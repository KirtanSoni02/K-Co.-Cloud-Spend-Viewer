import { type NextRequest, NextResponse } from "next/server"
import { getSpendData, getUniqueMonths, getUniqueTeams, getUniqueEnvironments } from "@/lib/data"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cloud = searchParams.get("cloud")
  const team = searchParams.get("team")
  const month = searchParams.get("month")
  const env = searchParams.get("env")

  let data = getSpendData()

  // Apply filters
  if (cloud && cloud !== "all") {
    data = data.filter((record) => record.cloud_provider === cloud)
  }

  if (team && team !== "all") {
    data = data.filter((record) => record.team === team)
  }

  if (env && env !== "all") {
    data = data.filter((record) => record.env === env)
  }

  const isSpecificMonthSelected = month && month !== "all"

  if (isSpecificMonthSelected) {
    data = data.filter((record) => {
      const recordDate = new Date(record.date)
      const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, "0")}`
      return recordMonth === month
    })
  }

  // Calculate summaries
  const totalSpend = data.reduce((sum, record) => sum + record.cost_usd, 0)
  const awsSpend = data.filter((r) => r.cloud_provider === "AWS").reduce((sum, r) => sum + r.cost_usd, 0)
  const gcpSpend = data.filter((r) => r.cloud_provider === "GCP").reduce((sum, r) => sum + r.cost_usd, 0)

  const serviceTotals = new Map<string, number>()
  data.forEach((record) => {
    const current = serviceTotals.get(record.service) || 0
    serviceTotals.set(record.service, current + record.cost_usd)
  })

  const topService = Array.from(serviceTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([service, total]) => ({ service, total }))[0] || { service: "N/A", total: 0 }

  // Calculate monthly totals for chart (when viewing all months)
  const monthlyTotals = new Map<string, { aws: number; gcp: number; total: number }>()
  data.forEach((record) => {
    const date = new Date(record.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthlyTotals.has(monthKey)) {
      monthlyTotals.set(monthKey, { aws: 0, gcp: 0, total: 0 })
    }

    const current = monthlyTotals.get(monthKey)!
    current.total += record.cost_usd
    if (record.cloud_provider === "AWS") {
      current.aws += record.cost_usd
    } else {
      current.gcp += record.cost_usd
    }
  })

  let dailyData: { day: number; date: string; aws: number; gcp: number; total: number }[] = []

  if (isSpecificMonthSelected) {
    const [year, monthNum] = month.split("-").map(Number)
    const daysInMonth = new Date(year, monthNum, 0).getDate()

    const dailyTotals = new Map<number, { aws: number; gcp: number; total: number }>()
    for (let day = 1; day <= daysInMonth; day++) {
      dailyTotals.set(day, { aws: 0, gcp: 0, total: 0 })
    }

    data.forEach((record) => {
      const date = new Date(record.date)
      const day = date.getDate()

      const current = dailyTotals.get(day)!
      current.total += record.cost_usd
      if (record.cloud_provider === "AWS") {
        current.aws += record.cost_usd
      } else {
        current.gcp += record.cost_usd
      }
    })

    dailyData = Array.from(dailyTotals.entries())
      .map(([day, totals]) => ({
        day,
        date: `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        aws: Math.round(totals.aws * 100) / 100,
        gcp: Math.round(totals.gcp * 100) / 100,
        total: Math.round(totals.total * 100) / 100,
      }))
      .sort((a, b) => a.day - b.day)
  }

  const teamTotals = new Map<string, number>()
  data.forEach((record) => {
    const current = teamTotals.get(record.team) || 0
    teamTotals.set(record.team, current + record.cost_usd)
  })

  return NextResponse.json({
    records: data,
    summary: {
      total: Math.round(totalSpend * 100) / 100,
      aws: Math.round(awsSpend * 100) / 100,
      gcp: Math.round(gcpSpend * 100) / 100,
      recordCount: data.length,
      topService, // Added top service to summary
    },
    monthlyData: Array.from(monthlyTotals.entries())
      .map(([month, totals]) => ({
        month,
        aws: Math.round(totals.aws * 100) / 100,
        gcp: Math.round(totals.gcp * 100) / 100,
        total: Math.round(totals.total * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    dailyData,
    selectedMonth: month || "all",
    teamData: Array.from(teamTotals.entries())
      .map(([team, total]) => ({
        team,
        total: Math.round(total * 100) / 100,
      }))
      .sort((a, b) => b.total - a.total),
    filters: {
      months: getUniqueMonths(),
      teams: getUniqueTeams(),
      environments: getUniqueEnvironments(),
    },
  })
}

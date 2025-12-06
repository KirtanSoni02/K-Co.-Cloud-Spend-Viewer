// import { type NextRequest, NextResponse } from "next/server"
// import { getSpendData, getUniqueMonths, getUniqueTeams, getUniqueEnvironments } from "@/lib/data"

// export async function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams
//   const cloud = searchParams.get("cloud")
//   const team = searchParams.get("team")
//   const month = searchParams.get("month")
//   const env = searchParams.get("env")

//   let data = getSpendData()

//   // Apply filters
//   if (cloud && cloud !== "all") {
//     data = data.filter((record) => record.cloud_provider === cloud)
//   }

//   if (team && team !== "all") {
//     data = data.filter((record) => record.team === team)
//   }

//   if (env && env !== "all") {
//     data = data.filter((record) => record.env === env)
//   }

//   const isSpecificMonthSelected = month && month !== "all"

//   if (isSpecificMonthSelected) {
//     data = data.filter((record) => {
//       const recordDate = new Date(record.date)
//       const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, "0")}`
//       return recordMonth === month
//     })
//   }

//   // Calculate summaries
//   const totalSpend = data.reduce((sum, record) => sum + record.cost_usd, 0)
//   const awsSpend = data.filter((r) => r.cloud_provider === "AWS").reduce((sum, r) => sum + r.cost_usd, 0)
//   const gcpSpend = data.filter((r) => r.cloud_provider === "GCP").reduce((sum, r) => sum + r.cost_usd, 0)

//   const serviceTotals = new Map<string, number>()
//   data.forEach((record) => {
//     const current = serviceTotals.get(record.service) || 0
//     serviceTotals.set(record.service, current + record.cost_usd)
//   })

//   const topService = Array.from(serviceTotals.entries())
//     .sort((a, b) => b[1] - a[1])
//     .map(([service, total]) => ({ service, total }))[0] || { service: "N/A", total: 0 }

//   // Calculate monthly totals for chart (when viewing all months)
//   const monthlyTotals = new Map<string, { aws: number; gcp: number; total: number }>()
//   data.forEach((record) => {
//     const date = new Date(record.date)
//     const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

//     if (!monthlyTotals.has(monthKey)) {
//       monthlyTotals.set(monthKey, { aws: 0, gcp: 0, total: 0 })
//     }

//     const current = monthlyTotals.get(monthKey)!
//     current.total += record.cost_usd
//     if (record.cloud_provider === "AWS") {
//       current.aws += record.cost_usd
//     } else {
//       current.gcp += record.cost_usd
//     }
//   })

//   let dailyData: { day: number; date: string; aws: number; gcp: number; total: number }[] = []

//   if (isSpecificMonthSelected) {
//     const [year, monthNum] = month.split("-").map(Number)
//     const daysInMonth = new Date(year, monthNum, 0).getDate()

//     const dailyTotals = new Map<number, { aws: number; gcp: number; total: number }>()
//     for (let day = 1; day <= daysInMonth; day++) {
//       dailyTotals.set(day, { aws: 0, gcp: 0, total: 0 })
//     }

//     data.forEach((record) => {
//       const date = new Date(record.date)
//       const day = date.getDate()

//       const current = dailyTotals.get(day)!
//       current.total += record.cost_usd
//       if (record.cloud_provider === "AWS") {
//         current.aws += record.cost_usd
//       } else {
//         current.gcp += record.cost_usd
//       }
//     })

//     dailyData = Array.from(dailyTotals.entries())
//       .map(([day, totals]) => ({
//         day,
//         date: `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
//         aws: Math.round(totals.aws * 100) / 100,
//         gcp: Math.round(totals.gcp * 100) / 100,
//         total: Math.round(totals.total * 100) / 100,
//       }))
//       .sort((a, b) => a.day - b.day)
//   }

//   const teamTotals = new Map<string, number>()
//   data.forEach((record) => {
//     const current = teamTotals.get(record.team) || 0
//     teamTotals.set(record.team, current + record.cost_usd)
//   })

//   return NextResponse.json({
//     records: data,
//     summary: {
//       total: Math.round(totalSpend * 100) / 100,
//       aws: Math.round(awsSpend * 100) / 100,
//       gcp: Math.round(gcpSpend * 100) / 100,
//       recordCount: data.length,
//       topService, // Added top service to summary
//     },
//     monthlyData: Array.from(monthlyTotals.entries())
//       .map(([month, totals]) => ({
//         month,
//         aws: Math.round(totals.aws * 100) / 100,
//         gcp: Math.round(totals.gcp * 100) / 100,
//         total: Math.round(totals.total * 100) / 100,
//       }))
//       .sort((a, b) => a.month.localeCompare(b.month)),
//     dailyData,
//     selectedMonth: month || "all",
//     teamData: Array.from(teamTotals.entries())
//       .map(([team, total]) => ({
//         team,
//         total: Math.round(total * 100) / 100,
//       }))
//       .sort((a, b) => b.total - a.total),
//     filters: {
//       months: getUniqueMonths(),
//       teams: getUniqueTeams(),
//       environments: getUniqueEnvironments(),
//     },
//   })
// }


import { type NextRequest, NextResponse } from "next/server";
import { getSpendData, getUniqueMonths, getUniqueTeams, getUniqueEnvironments } from "@/lib/data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const cloud = params.get("cloud");
  const team = params.get("team");
  const month = params.get("month");
  const env = params.get("env");

  let records = getSpendData();

  // === Filtering (replicates Express logic) ===
  if (cloud && cloud !== "all") records = records.filter(r => r.cloud_provider.toUpperCase() === cloud.toUpperCase());
  if (team && team !== "all") records = records.filter(r => r.team === team);
  if (env && env !== "all") records = records.filter(r => r.env === env);
  if (month && month !== "all") records = records.filter(r => r.date.startsWith(month));

  // === Summary Calculation ===
  let total = 0, aws = 0, gcp = 0;
  const serviceCosts: Record<string, number> = {};
  records.forEach(r => {
    total += r.cost_usd;
    if (r.cloud_provider === "AWS") aws += r.cost_usd;
    if (r.cloud_provider === "GCP") gcp += r.cost_usd;
    const s = r.service;
    serviceCosts[s] = (serviceCosts[s] || 0) + r.cost_usd;
  });

  let topService = { service: "None", total: 0 };
  for (const [service, cost] of Object.entries(serviceCosts)) {
    if (cost > topService.total) topService = { service, total: cost };
  }
  if (topService.total === 0) topService = { service: "N/A", total: 0 };

  // === Monthly Data ===
  const monthlyDataMap: Record<string, { month: string; aws: number; gcp: number; total: number }> = {};
  records.forEach(r => {
    const m = r.date.substring(0, 7);
    if (!monthlyDataMap[m]) monthlyDataMap[m] = { month: m, aws: 0, gcp: 0, total: 0 };
    monthlyDataMap[m].total += r.cost_usd;
    if (r.cloud_provider === "AWS") monthlyDataMap[m].aws += r.cost_usd;
    if (r.cloud_provider === "GCP") monthlyDataMap[m].gcp += r.cost_usd;
  });

  // === Daily Data ===
  const dailyDataMap: Record<string, { date: string; day: number; aws: number; gcp: number; total: number }> = {};
  records.forEach(r => {
    const d = r.date;
    if (!dailyDataMap[d]) dailyDataMap[d] = { date: d, day: new Date(d).getDate(), aws: 0, gcp: 0, total: 0 };
    dailyDataMap[d].total += r.cost_usd;
    if (r.cloud_provider === "AWS") dailyDataMap[d].aws += r.cost_usd;
    if (r.cloud_provider === "GCP") dailyDataMap[d].gcp += r.cost_usd;
  });

  // === Team Data ===
  const teamDataMap: Record<string, number> = {};
  records.forEach(r => {
    if (!teamDataMap[r.team]) teamDataMap[r.team] = 0;
    teamDataMap[r.team] += r.cost_usd;
  });

  // === Filter sets (like Express) ===
  const allRecords = getSpendData();
  const months = new Set<string>(), teams = new Set<string>(), environments = new Set<string>();
  allRecords.forEach(r => {
    months.add(r.date.substring(0, 7));
    teams.add(r.team);
    environments.add(r.env);
  });

  return NextResponse.json({
    records,
    summary: {
      total: Math.round(total * 100) / 100,
      aws: Math.round(aws * 100) / 100,
      gcp: Math.round(gcp * 100) / 100,
      recordCount: records.length,
      topService
    },
    monthlyData: Object.values(monthlyDataMap).sort((a, b) => a.month.localeCompare(b.month)).map((m) => ({
      month: m.month,
      aws: Math.round(m.aws * 100) / 100,
      gcp: Math.round(m.gcp * 100) / 100,
      total: Math.round(m.total * 100) / 100,
    })),
    dailyData: Object.values(dailyDataMap).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
      ...d,
      aws: Math.round(d.aws * 100) / 100,
      gcp: Math.round(d.gcp * 100) / 100,
      total: Math.round(d.total * 100) / 100,
    })),
    teamData: Object.entries(teamDataMap).map(([team, total]) => ({
      team, total: Math.round(total * 100) / 100
    })).sort((a, b) => b.total - a.total),
    filters: {
      months: Array.from(months).sort().reverse(),
      teams: Array.from(teams).sort(),
      environments: Array.from(environments).sort()
    },
    selectedMonth: month || "all"
  });
}
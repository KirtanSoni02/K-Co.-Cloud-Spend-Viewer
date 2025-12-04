"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { useTheme } from "next-themes"

interface MonthlyData {
  month: string
  aws: number
  gcp: number
  total: number
}

interface DailyData {
  day: number
  date: string
  aws: number
  gcp: number
  total: number
}

interface TeamData {
  team: string
  total: number
}

interface SpendChartProps {
  title: string
  data: MonthlyData[] | TeamData[]
  isLoading: boolean
  type: "monthly" | "team"
  dailyData?: DailyData[]
  selectedMonth?: string
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
  return date.toLocaleDateString("en-US", { month: "short" })
}

function formatMonthFull(monthStr: string): string {
  const [year, month] = monthStr.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

const CustomTooltip = ({ active, payload, label, isDaily }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl border border-border/50 p-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground mb-2">{isDaily ? `Day ${label}` : formatMonth(label)}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const TeamTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl border border-border/50 p-3 shadow-xl">
        <p className="text-sm font-semibold text-foreground mb-1">{payload[0].payload.team}</p>
        <p className="text-sm">
          <span className="text-muted-foreground">Total:</span>{" "}
          <span className="font-semibold text-foreground">${payload[0].value.toLocaleString()}</span>
        </p>
      </div>
    )
  }
  return null
}

export function SpendChart({ title, data, isLoading, type, dailyData, selectedMonth }: SpendChartProps) {
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  const textColor = isDark ? "#e5e7eb" : "#6b7280"
  const axisColor = isDark ? "#4b5563" : "#d1d5db"

  const showDailyView =
    type === "monthly" && selectedMonth && selectedMonth !== "all" && dailyData && dailyData.length > 0

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {type === "monthly" ? (
              <TrendingUp className="h-5 w-5 text-primary" />
            ) : (
              <Users className="h-5 w-5 text-primary" />
            )}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full rounded-lg shimmer" />
        </CardContent>
      </Card>
    )
  }

  const hasData = showDailyView ? dailyData && dailyData.length > 0 : data.length > 0

  if (!hasData) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {type === "monthly" ? (
              <TrendingUp className="h-5 w-5 text-primary" />
            ) : (
              <Users className="h-5 w-5 text-primary" />
            )}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No data available for the selected filters
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartTitle = showDailyView ? `Daily Spend - ${formatMonthFull(selectedMonth!)}` : title

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {type === "monthly" ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <Users className="h-4 w-4 text-white" />
              </div>
            )}
            {chartTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {type === "monthly" ? (
                showDailyView ? (
                  <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="awsBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="gcpBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={axisColor} opacity={0.5} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: textColor, fontSize: 11 }}
                      axisLine={{ stroke: axisColor }}
                      tickLine={{ stroke: axisColor }}
                      interval={2}
                    />
                    <YAxis
                      tickFormatter={formatCurrency}
                      tick={{ fill: textColor, fontSize: 11 }}
                      axisLine={{ stroke: axisColor }}
                      tickLine={{ stroke: axisColor }}
                    />
                    <Tooltip content={<CustomTooltip isDaily={true} />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                    />
                    <Bar dataKey="aws" name="AWS" fill="url(#awsBarGradient)" radius={[4, 4, 0, 0]} stackId="stack" />
                    <Bar dataKey="gcp" name="GCP" fill="url(#gcpBarGradient)" radius={[4, 4, 0, 0]} stackId="stack" />
                  </BarChart>
                ) : (
                  <AreaChart data={data as MonthlyData[]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="awsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gcpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={axisColor} opacity={0.5} />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      tick={{ fill: textColor, fontSize: 11 }}
                      axisLine={{ stroke: axisColor }}
                      tickLine={{ stroke: axisColor }}
                    />
                    <YAxis
                      tickFormatter={formatCurrency}
                      tick={{ fill: textColor, fontSize: 11 }}
                      axisLine={{ stroke: axisColor }}
                      tickLine={{ stroke: axisColor }}
                    />
                    <Tooltip content={<CustomTooltip isDaily={false} />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                    />
                    <Area
                      type="monotone"
                      dataKey="aws"
                      name="AWS"
                      stroke="#f97316"
                      fill="url(#awsGradient)"
                      strokeWidth={2.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="gcp"
                      name="GCP"
                      stroke="#3b82f6"
                      fill="url(#gcpGradient)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                )
              ) : (
                <BarChart
                  data={data as TeamData[]}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="teamGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={axisColor} opacity={0.5} horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={formatCurrency}
                    tick={{ fill: textColor, fontSize: 11 }}
                    axisLine={{ stroke: axisColor }}
                    tickLine={{ stroke: axisColor }}
                  />
                  <YAxis
                    type="category"
                    dataKey="team"
                    tick={{ fill: textColor, fontSize: 11 }}
                    axisLine={{ stroke: axisColor }}
                    tickLine={{ stroke: axisColor }}
                    width={60}
                  />
                  <Tooltip content={<TeamTooltip />} />
                  <Bar dataKey="total" fill="url(#teamGradient)" radius={[0, 6, 6, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

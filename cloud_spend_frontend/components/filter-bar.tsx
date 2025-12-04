"use client"

import { Filter, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface Filters {
  cloud: string
  team: string
  month: string
  env: string
}

interface FilterBarProps {
  filters: Filters
  onFilterChange: (key: keyof Filters, value: string) => void
  availableMonths: string[]
  availableTeams: string[]
  availableEnvironments: string[]
  isLoading: boolean
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export function FilterBar({
  filters,
  onFilterChange,
  availableMonths,
  availableTeams,
  availableEnvironments,
  isLoading,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(filters).some((v) => v !== "all")

  const resetFilters = () => {
    onFilterChange("cloud", "all")
    onFilterChange("team", "all")
    onFilterChange("month", "all")
    onFilterChange("env", "all")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Filter className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Filters</span>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-4">
              <motion.div
                className="flex min-w-[160px] flex-col gap-1.5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Label htmlFor="month" className="text-xs font-medium text-muted-foreground">
                  Month
                </Label>
                <Select
                  value={filters.month}
                  onValueChange={(value) => onFilterChange("month", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="month"
                    className="h-10 bg-background/50 border-border/50 transition-colors hover:border-border focus:border-primary"
                  >
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="all">All Months</SelectItem>
                    {availableMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {formatMonth(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                className="flex min-w-[140px] flex-col gap-1.5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Label htmlFor="cloud" className="text-xs font-medium text-muted-foreground">
                  Provider
                </Label>
                <Select
                  value={filters.cloud}
                  onValueChange={(value) => onFilterChange("cloud", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="cloud"
                    className="h-10 bg-background/50 border-border/50 transition-colors hover:border-border focus:border-primary"
                  >
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="AWS">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-orange-400 to-amber-500" />
                        AWS
                      </span>
                    </SelectItem>
                    <SelectItem value="GCP">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                        GCP
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                className="flex min-w-[130px] flex-col gap-1.5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Label htmlFor="team" className="text-xs font-medium text-muted-foreground">
                  Team
                </Label>
                <Select
                  value={filters.team}
                  onValueChange={(value) => onFilterChange("team", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="team"
                    className="h-10 bg-background/50 border-border/50 transition-colors hover:border-border focus:border-primary"
                  >
                    <SelectValue placeholder="All Teams" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="all">All Teams</SelectItem>
                    {availableTeams.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div
                className="flex min-w-[130px] flex-col gap-1.5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Label htmlFor="env" className="text-xs font-medium text-muted-foreground">
                  Environment
                </Label>
                <Select
                  value={filters.env}
                  onValueChange={(value) => onFilterChange("env", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="env"
                    className="h-10 bg-background/50 border-border/50 transition-colors hover:border-border focus:border-primary"
                  >
                    <SelectValue placeholder="All Envs" />
                  </SelectTrigger>
                  <SelectContent className="glass border-border/50">
                    <SelectItem value="all">All Environments</SelectItem>
                    {availableEnvironments.map((env) => (
                      <SelectItem key={env} value={env}>
                        <span className="capitalize">{env}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

"use client"
import { useState, useCallback } from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { Header } from "./header"
import { SummaryCards } from "./summary-cards"
import { FilterBar } from "./filter-bar"
import { SpendChart } from "./spend-chart"
import { SpendTable } from "./spend-table"
import { SpendModal } from "./spend-modal"
import type { SpendRecord } from "@/lib/data"

interface Filters {
  cloud: string
  team: string
  month: string
  env: string
}

interface ApiResponse {
  records: SpendRecord[]
  summary: {
    total: number
    aws: number
    gcp: number
    recordCount: number
    topService?: { service: string; total: number }
  }
  monthlyData: { month: string; aws: number; gcp: number; total: number }[]
  dailyData: { day: number; date: string; aws: number; gcp: number; total: number }[]
  selectedMonth: string
  teamData: { team: string; total: number }[]
  filters: {
    months: string[]
    teams: string[]
    environments: string[]
  }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Dashboard() {
  const [filters, setFilters] = useState<Filters>({
    cloud: "all",
    team: "all",
    month: "all",
    env: "all",
  })
  const [selectedRecord, setSelectedRecord] = useState<SpendRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isUsingUploadedData, setIsUsingUploadedData] = useState(false)

  const queryString = new URLSearchParams(Object.entries(filters).filter(([_, v]) => v !== "all")).toString()

  // const { data, isLoading, mutate } = useSWR<ApiResponse>(`http://localhost:5000/api/spend${queryString ? `?${queryString}` : ""}`, fetcher)
  const { data, isLoading, mutate } = useSWR<ApiResponse>(`api/spend${queryString ? `?${queryString}` : ""}`, fetcher)


  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleRowClick = (record: SpendRecord) => {
    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRecord(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 h-full w-full rounded-full bg-gradient-to-tr from-primary/5 to-transparent blur-3xl" />
      </div>

      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Cloud Spending Overview</h2>
          <p className="mt-2 text-muted-foreground">
            Monitor and analyze your AWS and GCP cloud expenditures in real-time.
          </p>
          {isUsingUploadedData && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Showing data from uploaded Excel file
            </motion.p>
          )}
        </motion.div>

        <SummaryCards
          total={data?.summary.total ?? 0}
          aws={data?.summary.aws ?? 0}
          gcp={data?.summary.gcp ?? 0}
          recordCount={data?.summary.recordCount ?? 0}
          topService={data?.summary.topService}
          isLoading={isLoading}
        />

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          availableMonths={data?.filters.months ?? []}
          availableTeams={data?.filters.teams ?? []}
          availableEnvironments={data?.filters.environments ?? []}
          isLoading={isLoading}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 grid gap-6 lg:grid-cols-2"
        >
          <SpendChart
            title="Monthly Spend Trend"
            data={data?.monthlyData ?? []}
            isLoading={isLoading}
            type="monthly"
            dailyData={data?.dailyData ?? []}
            selectedMonth={data?.selectedMonth ?? "all"}
          />
          <SpendChart title="Spend by Team" data={data?.teamData ?? []} isLoading={isLoading} type="team" />
        </motion.div>

        <SpendTable records={data?.records ?? []} isLoading={isLoading} onRowClick={handleRowClick} />

        <SpendModal record={selectedRecord} isOpen={isModalOpen} onClose={handleCloseModal} />
  
        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pb-8 text-center text-sm text-muted-foreground"
        >
          <p>K&Co. Cloud Spend Viewer - Optimize Your Cloud Costs</p>
        </motion.footer>
      </main>
    </div>
  )
}

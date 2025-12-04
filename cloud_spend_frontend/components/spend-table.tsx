"use client"

import { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Table2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SpendRecord } from "@/lib/data"

interface SpendTableProps {
  records: SpendRecord[]
  isLoading: boolean
  onRowClick: (record: SpendRecord) => void
}

type SortKey = "date" | "cost_usd"
type SortOrder = "asc" | "desc"

const ITEMS_PER_PAGE = 10

export function SpendTable({ records, isLoading, onRowClick }: SpendTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("desc")
    }
    setCurrentPage(1)
  }

  const sortedRecords = [...records].sort((a, b) => {
    const multiplier = sortOrder === "asc" ? 1 : -1
    if (sortKey === "date") {
      return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    return multiplier * (a.cost_usd - b.cost_usd)
  })

  const totalPages = Math.ceil(sortedRecords.length / ITEMS_PER_PAGE)
  const paginatedRecords = sortedRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
    }
    return sortOrder === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="mt-6 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-600">
                <Table2 className="h-4 w-4 text-white" />
              </div>
              Spend Records
            </CardTitle>
            {!isLoading && (
              <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {records.length} records
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                  <TableHead
                    className="cursor-pointer select-none transition-colors hover:text-foreground"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      Date
                      <SortIcon column="date" />
                    </div>
                  </TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-right transition-colors hover:text-foreground"
                    onClick={() => handleSort("cost_usd")}
                  >
                    <div className="flex items-center justify-end">
                      Cost
                      <SortIcon column="cost_usd" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-5 w-full rounded shimmer" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Table2 className="h-8 w-8 opacity-50" />
                        <span>No records found matching your filters.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {paginatedRecords.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="cursor-pointer border-b border-border/30 transition-colors hover:bg-muted/30 group"
                        onClick={() => onRowClick(record)}
                      >
                        <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-transform group-hover:scale-105 ${
                              record.cloud_provider === "AWS"
                                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                            }`}
                          >
                            {record.cloud_provider}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{record.service}</TableCell>
                        <TableCell className="text-muted-foreground">{record.team}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                              record.env === "prod"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                                : record.env === "staging"
                                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"
                                  : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
                            }`}
                          >
                            {record.env}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatCurrency(record.cost_usd)}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1 border-border/50 hover:bg-muted/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1 border-border/50 hover:bg-muted/50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

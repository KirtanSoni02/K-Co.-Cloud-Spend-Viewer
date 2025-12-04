"use client"

import { Calendar, Cloud, Server, Users, Layers, DollarSign } from "lucide-react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { SpendRecord } from "@/lib/data"

interface SpendModalProps {
  record: SpendRecord | null
  isOpen: boolean
  onClose: () => void
}

export function SpendModal({ record, isOpen, onClose }: SpendModalProps) {
  if (!record) return null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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

  const details = [
    {
      icon: Calendar,
      label: "Date",
      value: formatDate(record.date),
      gradient: "from-slate-500 to-slate-600",
    },
    {
      icon: Cloud,
      label: "Cloud Provider",
      value: record.cloud_provider,
      badge: true,
      badgeClass:
        record.cloud_provider === "AWS"
          ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30"
          : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
      gradient: record.cloud_provider === "AWS" ? "from-orange-400 to-amber-500" : "from-blue-500 to-indigo-600",
    },
    {
      icon: Server,
      label: "Service",
      value: record.service,
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: Users,
      label: "Team",
      value: record.team,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Layers,
      label: "Environment",
      value: record.env,
      badge: true,
      badgeClass:
        record.env === "prod"
          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
          : record.env === "staging"
            ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"
            : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
      gradient:
        record.env === "prod"
          ? "from-red-500 to-rose-600"
          : record.env === "staging"
            ? "from-yellow-500 to-amber-600"
            : "from-green-500 to-emerald-600",
    },
    {
      icon: DollarSign,
      label: "Cost",
      value: formatCurrency(record.cost_usd),
      highlight: true,
      gradient: "from-violet-500 to-purple-600",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass border-border/50 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg ${
                  record.cloud_provider === "AWS" ? "from-orange-400 to-amber-500" : "from-blue-500 to-indigo-600"
                }`}
              >
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <span>Spend Details</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {details.map((detail, index) => (
              <motion.div
                key={detail.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between rounded-xl bg-muted/30 p-3 border border-border/30 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${detail.gradient}`}
                  >
                    <detail.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground">{detail.label}</span>
                </div>
                {detail.badge ? (
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${detail.badgeClass}`}
                  >
                    {detail.value}
                  </span>
                ) : (
                  <span
                    className={`text-sm font-medium ${
                      detail.highlight
                        ? "text-xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent"
                        : "text-foreground"
                    }`}
                  >
                    {detail.value}
                  </span>
                )}
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mt-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4"
            >
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-semibold">Summary:</span> This is{" "}
                <span className="font-semibold text-primary">{record.service}</span> spend from the{" "}
                <span className="font-semibold">{record.team}</span> team in the{" "}
                <span className="capitalize font-semibold">{record.env}</span> environment, running on{" "}
                <span
                  className={`font-semibold ${record.cloud_provider === "AWS" ? "text-orange-500" : "text-blue-500"}`}
                >
                  {record.cloud_provider}
                </span>
                .
              </p>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

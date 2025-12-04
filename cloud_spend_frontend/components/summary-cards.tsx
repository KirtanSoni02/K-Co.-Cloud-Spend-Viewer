"use client"

import { DollarSign, Cloud, Server, Database, Award } from "lucide-react"
import { motion, Variants } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface SummaryCardsProps {
  total: number
  aws: number
  gcp: number
  recordCount: number
  topService?: { service: string; total: number }
  isLoading: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  isLoading,
}: { value: number; prefix?: string; suffix?: string; isLoading: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isLoading) return
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value, isLoading])

  if (isLoading) {
    return <div className="h-9 w-28 rounded-lg shimmer" />
  }

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}

export function SummaryCards({ total, aws, gcp, recordCount, topService, isLoading }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Spend",
      value: total,
      icon: DollarSign,
      gradient: "from-violet-500 to-purple-600",
      bgGlow: "group-hover:shadow-violet-500/25",
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      prefix: "$",
    },
    {
      title: "AWS Spend",
      value: aws,
      icon: Server,
      gradient: "from-orange-400 to-amber-500",
      bgGlow: "group-hover:shadow-orange-500/25",
      iconBg: "bg-gradient-to-br from-orange-400 to-amber-500",
      badge: "AWS",
      badgeClass: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
      prefix: "$",
    },
    {
      title: "GCP Spend",
      value: gcp,
      icon: Cloud,
      gradient: "from-blue-500 to-indigo-600",
      bgGlow: "group-hover:shadow-blue-500/25",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      badge: "GCP",
      badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
      prefix: "$",
    },
    {
      title: "Top Service",
      value: topService?.total || 0,
      icon: Award,
      gradient: "from-emerald-500 to-teal-600",
      bgGlow: "group-hover:shadow-emerald-500/25",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      badge: topService?.service || "N/A",
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      prefix: "$",
      customLabel: true,
    },
    {
      title: "Total Records",
      value: recordCount,
      icon: Database,
      gradient: "from-slate-500 to-slate-600",
      bgGlow: "group-hover:shadow-slate-500/25",
      iconBg: "bg-gradient-to-br from-slate-500 to-slate-600",
      prefix: "",
    },
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {cards.map((card) => (
        <motion.div key={card.title} variants={cardVariants}>
          <Card
            className={`group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-xl ${card.bgGlow}`}
          >
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${card.gradient}`}
            />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-6">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  {card.customLabel && topService ? (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold tracking-tight text-card-foreground">{topService.service}</p>
                      <div className="text-sm text-muted-foreground">
                        <AnimatedNumber value={card.value} prefix={card.prefix} isLoading={isLoading} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold tracking-tight text-card-foreground">
                      <AnimatedNumber value={card.value} prefix={card.prefix} isLoading={isLoading} />
                    </div>
                  )}
                  {card.badge && !card.customLabel && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${card.badgeClass}`}
                    >
                      {card.badge}
                    </span>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} shadow-lg`}
                >
                  <card.icon className="h-6 w-6 text-white" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

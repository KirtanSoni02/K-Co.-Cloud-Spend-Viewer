"use client"

import { Cloud, Sparkles, Upload, FileSpreadsheet } from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onUploadClick?: () => void
}

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-primary/60 blur-lg opacity-50" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Cloud className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">K&Co.</h1>
            <p className="text-xs font-medium text-muted-foreground tracking-wide">Cloud Spend Viewer</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-4 py-2 border border-emerald-500/20"
          >
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Optimize Cloud Costs</span>
          </motion.div>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  )
}

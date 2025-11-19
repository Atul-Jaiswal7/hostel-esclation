"use client"


import { EscalationCharts } from "@/components/reports/escalation-charts"
import { StatsCards } from "@/components/reports/stats-cards"
import { useEscalationContext } from "@/context/escalation-context"

export default function DashboardPage() {
  const { escalations, loading } = useEscalationContext()

  return (
    <div className="space-y-6">
      <StatsCards escalations={escalations} loading={loading} />
      <EscalationCharts escalations={escalations} loading={loading} />
    </div>
  )
}

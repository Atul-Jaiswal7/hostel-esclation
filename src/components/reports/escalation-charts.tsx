
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEmployeeContext } from "@/context/employee-context"
import { useSettingsContext } from "@/context/settings-context"
import type { Escalation } from "@/types"
import { Skeleton } from "../ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"

interface EscalationChartsProps {
  escalations: Escalation[],
  loading: boolean
}

export function EscalationCharts({ escalations, loading }: EscalationChartsProps) {
  const { settings } = useSettingsContext()
  const isMobile = useIsMobile()

  const byInitialDepartment = settings.departments.map(department => ({
    name: department,
    total: escalations.filter(e => e.department === department).length,
  })).filter(d => d.total > 0);

  const byStatus = settings.statuses.map(status => ({
    name: status,
    total: escalations.filter(e => e.status === status).length,
  }))

  // Group escalations by building
  const buildingCounts = escalations.reduce((acc, escalation) => {
    const building = escalation.buildingName || 'Unknown Building';
    acc[building] = (acc[building] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byBuilding = Object.entries(buildingCounts)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total); // Sort by count descending

  if (loading) {
      return (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="grid gap-6 w-full md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Escalations by Initial Department</CardTitle>
          <CardDescription>Distribution of escalations based on the initial department assigned.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="w-full h-[220px] sm:h-[260px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byInitialDepartment} margin={{ top: 12, right: 12, bottom: isMobile ? 56 : 24, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={isMobile ? -45 : 0} textAnchor={isMobile ? "end" : "middle"} height={isMobile ? 56 : 30} tick={{ fontSize: isMobile ? 10 : 12 }} interval={isMobile ? "preserveStartEnd" : "preserveStartEnd"} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Escalations by Status</CardTitle>
          <CardDescription>Current status overview of all escalations.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="w-full h-[220px] sm:h-[260px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} margin={{ top: 12, right: 12, bottom: isMobile ? 32 : 18, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: isMobile ? 8 : 8 }} interval={isMobile ? "preserveStartEnd" : "preserveStartEnd"} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="w-full max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Escalations by Building</CardTitle>
          <CardDescription>Distribution of escalations across different buildings.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="w-full h-[220px] sm:h-[260px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBuilding} margin={{ top: 12, right: 12, bottom: isMobile ? 56 : 24, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={isMobile ? -45 : -30} 
                  textAnchor="end" 
                  height={isMobile ? 56 : 40} 
                  tick={{ fontSize: isMobile ? 9 : 10 }} 
                  interval={0}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="hsl(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

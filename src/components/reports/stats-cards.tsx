
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Escalation } from "@/types"
import { CheckCircle2, Hourglass, Ticket, Timer } from "lucide-react"
import { Skeleton } from "../ui/skeleton";

interface StatsCardsProps {
    escalations: Escalation[]
    loading: boolean
}

function formatDuration(milliseconds: number): string {
    if (milliseconds <= 0) return "N/A";

    const days = milliseconds / (1000 * 60 * 60 * 24);
    if (days >= 1) {
        return `${days.toFixed(1)} days`;
    }
    const hours = milliseconds / (1000 * 60 * 60);
    if (hours >= 1) {
        return `${hours.toFixed(1)} hours`;
    }
    const minutes = milliseconds / (1000 * 60);
    if (minutes < 1) {
        return "<1 min"
    }
    return `${minutes.toFixed(1)} mins`;
}

export function StatsCards({ escalations, loading }: StatsCardsProps) {
    const total = escalations.length;
    const inProgress = escalations.filter(e => e.status === "In Progress").length;
    const resolved = escalations.filter(e => e.status === "Resolved").length;

    const resolvedOrClosed = escalations.filter(e => 
        (e.status === "Resolved" || e.status === "Closed") && e.endDate
    );
    
    const totalResolutionTime = resolvedOrClosed.reduce((acc, curr) => {
        const duration = curr.endDate!.getTime() - curr.startDate.getTime();
        return acc + duration;
    }, 0);

    const averageResolutionTime = resolvedOrClosed.length > 0 
        ? totalResolutionTime / resolvedOrClosed.length 
        : 0;

    const stats = [
        { title: "Total Escalations", value: total, icon: Ticket },
        { title: "In Progress", value: inProgress, icon: Hourglass },
        { title: "Resolved", value: resolved, icon: CheckCircle2 },
        { title: "Avg. Resolution Time", value: formatDuration(averageResolutionTime), icon: Timer }
    ]

    if(loading) {
        return (
             <div className="grid gap-6 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <Skeleton className="h-5 w-2/3" />
                           <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-1/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-4">
            {stats.map(stat => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

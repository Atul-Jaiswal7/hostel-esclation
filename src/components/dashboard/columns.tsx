
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Wrench, FileText, CircleDollarSign, Construction, Scale, ArrowUpDown, Circle, CircleDot, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Escalation, EscalationStatus, Department } from "@/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const departmentIcons: Record<string, React.ElementType> = {
  Maintenance: Construction,
  Mess: FileText,
  Water: Wrench,
  Electricity: Wrench,
  Security: Wrench,
  Cleaning: Wrench,
  Internet: Wrench,
  Other: Wrench,
}

const statusConfig: Record<EscalationStatus, { icon: React.ElementType, color: string }> = {
    "New": { icon: Circle, color: "bg-primary" },
    "In Progress": { icon: CircleDot, color: "bg-[hsl(var(--chart-4))]" },
    "Resolved": { icon: CheckCircle2, color: "bg-[hsl(var(--chart-2))]" },
    "Closed": { icon: XCircle, color: "bg-muted-foreground" },
}

type GetColumnsProps = {
  onViewDetails: (escalation: Escalation) => void;
  onUpdateStatus: (escalation: Escalation) => void;
  onAssignTeamMember: (escalation: Escalation) => void;
}

export const columns = ({ onViewDetails, onUpdateStatus, onAssignTeamMember }: GetColumnsProps): ColumnDef<Escalation>[] => [
  {
    accessorKey: "id",
    header: () => <span className="hidden sm:inline">ID</span>,
     cell: ({ row }) => (
      <div className="hidden sm:block font-mono">#{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "studentName",
    header: "Student",
    cell: ({ row }) => {
      const name = row.getValue("studentName") as string
      return <div className="truncate max-w-[160px] sm:max-w-none" title={name}>{name}</div>
    }
  },
  {
    accessorKey: "hostelName",
    header: "Hostel",
    cell: ({ row }) => {
      const hostel = row.getValue("hostelName") as string
      return <div className="truncate max-w-[140px] sm:max-w-none" title={hostel}>{hostel}</div>
    }
  },
  {
    accessorKey: "roomNumber",
    header: () => <span className="hidden sm:inline">Room</span>,
    cell: ({ row }) => <div className="hidden sm:block">{row.getValue("roomNumber") as string}</div>,
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      const department = row.getValue("department") as Department
      const Icon = departmentIcons[department] || Wrench
      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {department}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as EscalationStatus
      const config = statusConfig[status]
      return (
        <Badge variant="outline" className="flex items-center gap-2 w-fit capitalize">
          <span className={cn("h-2 w-2 rounded-full", config.color)}></span>
          <span>{status}</span>
        </Badge>
      )
    },
     filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const date = row.getValue("startDate") as Date
        return <div>{format(date, "P")}</div>
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.getValue("endDate") as Date | null
      return date ? <div>{format(date, "P")}</div> : <span className="text-muted-foreground">N/A</span>
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned Supervisor",
  },
  {
    accessorKey: "assignedTeamMemberEmail",
    header: "Assigned To",
    cell: ({ row }) => {
        const email = row.getValue("assignedTeamMemberEmail") as string | null
        return email ? (
          <a
            href={`mailto:${email}`}
            className="text-primary hover:underline block max-w-[180px] sm:max-w-none truncate"
            title={email}
          >
            {email}
          </a>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const escalation = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(escalation.id)}
            >
              Copy Escalation ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onViewDetails(escalation)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(escalation)}>
              Update Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssignTeamMember(escalation)}>Assign to Team Member</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]


"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Employee } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

type GetColumnsProps = {
  onDelete: (employee: Employee) => void;
  onDisable: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  isAdmin: boolean;
}

export const columns = ({ onDelete, onDisable, onEdit, isAdmin }: GetColumnsProps): ColumnDef<Employee>[] => [
  {
    accessorKey: "id",
    header: () => <span className="hidden sm:inline">ID</span>,
     cell: ({ row }) => (
      <div className="hidden sm:block font-mono">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
     cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return (
          <a
            href={`mailto:${email}`}
            className="text-primary hover:underline block max-w-[180px] sm:max-w-none truncate"
            title={email}
          >
            {email}
          </a>
        )
    }
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return <Badge variant="secondary">{role}</Badge>
    }
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
        const department = row.getValue("department") as string;
        return <Badge variant="outline">{department}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original

      // Only show actions for admin users
      if (!isAdmin) {
        return <span className="text-muted-foreground text-sm">No actions available</span>
      }

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
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDisable(employee)}>
              Disable Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(employee)}
            >
              Delete Employee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

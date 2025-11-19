
"use client"

import * as React from "react"
import { AddEmployeeForm } from "@/components/employees/add-employee-form";
import { EmployeesDataTable } from "@/components/employees/employees-data-table";
import { columns } from "@/components/employees/columns";
import { EditEmployeeDialog } from "@/components/employees/edit-employee-dialog";
import { useEmployeeContext } from "@/context/employee-context";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { Employee } from "@/types";

export default function EmployeesPage() {
  const { employees, loading, refreshEmployees } = useEmployeeContext();
  const { toast } = useToast();
  const { user, isAdmin, adminLoading } = useAuth();
  const [employeeToDelete, setEmployeeToDelete] = React.useState<Employee | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = React.useState<Employee | null>(null);

  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee);
  };

  const handleDisable = async (employee: Employee) => {
    if (!user) return;
    
    if (!isAdmin) {
        toast({
            title: "Access Denied",
            description: "Only administrators can disable employees.",
            variant: "destructive",
        });
        return;
    }
    
    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/employees/manage-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ employeeId: employee.id, action: 'disable' }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to disable employee');
        }

        toast({
            title: "Employee Disabled",
            description: result.message || `${employee.name}'s account has been disabled. They can no longer access the system.`,
        });
        
        // Refresh the employee list to ensure it updates
        setTimeout(async () => {
            await refreshEmployees();
        }, 1000);
    } catch (error: any) {
        console.error('Disable error:', error);
        toast({
            title: "Action Failed",
            description: error.message || "Could not disable the employee.",
            variant: "destructive",
        });
    }
  };

  const handleEdit = (employee: Employee) => {
    setEmployeeToEdit(employee);
  };

  const handleEditOpenChange = (open: boolean) => {
    if (!open) {
      setEmployeeToEdit(null);
    }
  };

  const confirmDelete = async () => {
    if (!employeeToDelete || !user) return;
    
    if (!isAdmin) {
        toast({
            title: "Access Denied",
            description: "Only administrators can delete employees.",
            variant: "destructive",
        });
        setEmployeeToDelete(null);
        return;
    }
    
    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/employees/manage-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ employeeId: employeeToDelete.id, action: 'delete' }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete employee');
        }

        toast({
            title: "Employee Deleted",
            description: result.message || `${employeeToDelete.name}'s account and data have been permanently deleted.`,
        });
        
        // Refresh the employee list to ensure it updates
        setTimeout(async () => {
            await refreshEmployees();
        }, 1000);
    } catch (error: any) {
        console.error('Delete error:', error);
        toast({
            title: "Deletion Failed",
            description: error.message || "Could not delete the employee.",
            variant: "destructive",
        });
    } finally {
        setEmployeeToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Employee</h2>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "Fill out the form below to add a new employee to the system."
            : "Only administrators can add new employees to the system."
          }
        </p>
      </div>
      <AddEmployeeForm />
      <Separator />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Current Employees</h2>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "A list of all employees in the system. You can manage their details, disable accounts, or delete them."
            : "A list of all employees in the system. You can view their details but cannot make changes."
          }
        </p>
      </div>
      <EmployeesDataTable 
        columns={columns({ onDelete: handleDelete, onDisable: handleDisable, onEdit: handleEdit, isAdmin })} 
        data={employees} 
        loading={loading} 
      />
      
      <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the employee account
                    for <span className="font-bold">{employeeToDelete?.name}</span> and remove their data from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditEmployeeDialog
        employee={employeeToEdit}
        open={!!employeeToEdit}
        onOpenChange={handleEditOpenChange}
        onSuccess={refreshEmployees}
      />
    </div>
  )
}

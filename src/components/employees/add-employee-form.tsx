
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as React from "react"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useSettingsContext } from "@/context/settings-context"
import { useAuth } from "@/hooks/useAuth"
import { useEmployeeContext } from "@/context/employee-context"
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase/config'

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Employee name must be at least 2 characters.",
  }),
  email: z.string().email({
      message: "Please enter a valid email address.",
  }),
  role: z.string().optional(),
  department: z.string().optional(),
  isAdmin: z.boolean().default(false),
  isCRM: z.boolean().default(false),
}).refine((data) => {
  // If neither Admin nor CRM is selected, role and department are required
  if (!data.isAdmin && !data.isCRM) {
    return data.role && data.department;
  }
  return true;
}, {
  message: "Role and Department are required for regular employees",
  path: ["role"]
})

export function AddEmployeeForm() {
  const { settings } = useSettingsContext();
  const { toast } = useToast()
  const { user, isAdmin } = useAuth();
  const { refreshEmployees } = useEmployeeContext();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitProgress, setSubmitProgress] = React.useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "",
      department: "",
      isAdmin: false,
      isCRM: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmitProgress("Creating employee...");
    
    try {
        // Check if current user is logged in and is admin
        if (!user) {
            throw new Error("You must be logged in to invite employees");
        }

        if (!isAdmin) {
            throw new Error("Only administrators can invite employees.");
        }

        // Get the user's ID token
        const idToken = await user.getIdToken();
        
        // Call the API endpoint to create the employee
        const response = await fetch('/api/employees/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify(values),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to invite employee');
        }

                setSubmitProgress("Sending invitation email...");
        
        // Send password reset email using Firebase Auth
        if (auth && result.email) {
          try {
            const actionCodeSettings = {
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/reset-password`,
              handleCodeInApp: true,
            };

            await sendPasswordResetEmail(auth, result.email, actionCodeSettings);
                
                toast({
                    title: "Employee Invited",
                    description: `${values.fullName} has been invited. A password reset email has been sent to ${result.email}.`,
                });
            } catch (emailError: any) {
                console.error('Error sending password reset email:', emailError);
                
                // Still show success but with a warning about the email
                toast({
                    title: "Employee Invited",
                    description: `${values.fullName} has been invited, but there was an issue sending the password reset email. They can use the "Forgot Password" feature on the login page.`,
                    variant: "default",
                });
            }
        } else {
            toast({
                title: "Employee Invited",
                description: result.message || `${values.fullName} has been invited.`,
            });
        }
        
        setSubmitProgress("Refreshing employee list...");
        form.reset();
        
        // Refresh the employee list to show the new employee
        await refreshEmployees();
        
        // Manually refresh user status to ensure it persists
        if ((window as any).refreshUserStatus) {
          (window as any).refreshUserStatus();
        }

    } catch (error: any) {
        console.error("Error inviting employee:", error);
        
        let errorMessage = "Failed to invite employee";
        if (error.message) {
            // Handle specific timeout errors
            if (error.message.includes('timeout') || error.message.includes('DEADLINE_EXCEEDED')) {
                errorMessage = "Request timed out. Please check your internet connection and try again.";
            } else if (error.message.includes('auth/email-already-exists')) {
                errorMessage = "An account with this email already exists.";
            } else if (error.message.includes('auth/invalid-email')) {
                errorMessage = "Invalid email address.";
            } else if (error.message.includes('auth/weak-password')) {
                errorMessage = "Password is too weak.";
            } else {
                errorMessage = error.message;
            }
        }

        toast({
            title: "Invitation Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
        setSubmitProgress("");
    }
  }

  return (
    <div>
      {!isAdmin ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Only administrators can add new employees to the system.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Employee Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Employee Email</FormLabel>
                    <FormControl>
                        <Input placeholder="jane.smith@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={form.watch("isAdmin") || form.watch("isCRM")}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {settings.roles.map((role) => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Department</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={form.watch("isAdmin") || form.watch("isCRM")}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a department" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {settings.departments.map((dep) => (
                                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="isAdmin"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Is Admin</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Grant administrative privileges
                                </p>
                            </div>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isCRM"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Is CRM</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Grant CRM privileges
                                </p>
                            </div>
                        </FormItem>
                    )}
                />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-11">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? submitProgress : "Invite Employee"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}

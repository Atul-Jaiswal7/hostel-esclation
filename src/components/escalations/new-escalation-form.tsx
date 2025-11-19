
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as React from "react"
import { z } from "zod"
import { Loader2, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getDepartmentSuggestion } from "@/lib/actions"
import { useEscalationContext } from "@/context/escalation-context"
import { useSettingsContext } from "@/context/settings-context"
import { useEmployeeContext } from "@/context/employee-context"

const formSchema = z.object({
  studentName: z.string().min(2, {
    message: "Student name must be at least 2 characters.",
  }),
  studentEmail: z.string().email({
      message: "Please enter a valid email address.",
  }),
  hostelName: z.string().min(1, { message: "Hostel name is required." }),
  roomNumber: z.string().min(1, { message: "Room number is required." }),
  description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
  }).max(500, {
      message: "Description must not exceed 500 characters."
  }),
  department: z.string().min(1, { message: "Department is required." }),
  assignedTeamMemberEmail: z.string().email({ message: "Please enter a valid email."}).optional().or(z.literal('')),
})

export function NewEscalationForm() {
  const { addEscalation } = useEscalationContext();
  const { settings } = useSettingsContext();
  const { employees } = useEmployeeContext();
  const { toast } = useToast()
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<string | null>(null);

  const wardens = employees.filter(e => e.role === "Warden");
  const wardenMapping = React.useMemo(() => {
    return wardens.reduce((acc, warden) => {
        if (warden.department) {
            acc[warden.department] = { name: `${warden.name} (Warden)`, email: warden.email };
        }
        return acc;
    }, {} as Record<string, { name: string; email: string }>);
  }, [wardens]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      studentEmail: "",
      hostelName: "",
      roomNumber: "",
      description: "",
      department: "",
      assignedTeamMemberEmail: "",
    },
  })

  const handleSuggestDepartment = React.useCallback(async () => {
    const description = form.getValues("description");
    if(description.length < 10) {
      toast({
        title: "Description too short",
        description: "Please enter at least 10 characters for AI suggestion.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSuggesting(true);
    setSuggestion(null);
    try {
        const result = await getDepartmentSuggestion(description);
        if (result.department) {
            const validDepartments = settings.departments;
            if (validDepartments.includes(result.department)) {
                 setSuggestion(result.department);
                 toast({
                   title: "Department suggested",
                   description: `AI suggests: ${result.department}`,
                 });
            } else {
                console.warn("AI suggested an invalid department:", result.department);
                toast({
                  title: "Invalid suggestion",
                  description: "AI suggested an invalid department. Please select manually.",
                  variant: "destructive",
                });
            }
        } else if (result.error) {
            toast({
              title: "AI suggestion failed",
              description: result.error,
              variant: "destructive",
            });
        }
    } catch (error) {
        console.error("Failed to get department suggestion:", error);
        toast({
          title: "AI suggestion failed",
          description: "Unable to get AI suggestion. Please select department manually.",
          variant: "destructive",
        });
    } finally {
        setIsSuggesting(false);
    }
  }, [form, settings.departments, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const wardenDetails = wardenMapping[values.department];
    if (!wardenDetails) {
        toast({
            title: "Warden Not Found",
            description: `There is no Warden assigned for the "${values.department}" department. Please assign a Warden in the Employees section.`,
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }

    const newEscalation = {
        ...values,
        assignedTeamMemberEmail: values.assignedTeamMemberEmail || null,
        status: settings.statuses[0] || "New",
        assignedTo: wardenDetails.name,
        hodEmail: wardenDetails.email,
    };
    await addEscalation(newEscalation);

    toast({
      title: "New Escalation Created",
      description: `A new ticket has been created for ${values.studentName} and assigned to ${wardenDetails.name}.`,
    })
    form.reset();
    setSuggestion(null);
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
        <FormField
          control={form.control}
          name="studentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student Name</FormLabel>
              <FormControl>
                <Input placeholder="Rahul Sharma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="studentEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student Email</FormLabel>
              <FormControl>
                <Input placeholder="rahul.sharma@manit.ac.in" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="hostelName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Hostel Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Hostel A" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="roomNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Room Number</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. 101" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description of Issue</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the customer's issue in detail..."
                  rows={5}
                  {...field}
                  onBlur={handleSuggestDepartment}
                />
              </FormControl>
              <FormDescription>
                Provide as much detail as possible to help us resolve the hostel issue quickly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Department</FormLabel>
                <div className="flex items-center gap-2">
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                    <Button type="button" variant="outline" size="icon" onClick={handleSuggestDepartment} disabled={isSuggesting}>
                        {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    </Button>
                </div>
                 {form.watch("department") && wardenMapping[form.watch("department")] && (
                    <FormDescription>
                        This will be assigned to: <strong>{wardenMapping[form.watch("department")].name}</strong>
                    </FormDescription>
                )}
                 {form.watch("department") && !wardenMapping[form.watch("department")] && (
                    <FormDescription className="text-destructive">
                        No Warden assigned for this department.
                    </FormDescription>
                )}
                {suggestion && !isSuggesting && (
                    <div className="mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                            form.setValue("department", suggestion, { shouldValidate: true });
                            setSuggestion(null);
                        }}>
                            Use suggestion: &quot;{suggestion}&quot;
                        </Button>
                    </div>
                )}
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="assignedTeamMemberEmail"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Assign to Team Member (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="team.member@example.com" {...field} />
                    </FormControl>
                     <FormDescription>
                        The Warden can assign this later if left blank.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Escalation
        </Button>
      </form>
    </Form>
  )
}

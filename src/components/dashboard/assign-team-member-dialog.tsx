
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEscalationContext } from "@/context/escalation-context"
import { useEmployeeContext } from "@/context/employee-context"
import { useToast } from "@/hooks/use-toast"
import type { Escalation } from "@/types"

const formSchema = z.object({
  teamMemberEmail: z.string().email({ message: "Please select a team member." }),
})

interface AssignTeamMemberDialogProps {
  escalation: Escalation | null
  isOpen: boolean
  onClose: () => void
}

export function AssignTeamMemberDialog({ escalation, isOpen, onClose }: AssignTeamMemberDialogProps) {
  const { assignTeamMember } = useEscalationContext()
  const { employees } = useEmployeeContext()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const teamMembers = employees.filter(e => e.role === "Team Member");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  React.useEffect(() => {
    if (escalation) {
      form.reset({
        teamMemberEmail: escalation.assignedTeamMemberEmail || "",
      })
    }
  }, [escalation, form])

  if (!escalation) return null

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    await assignTeamMember(escalation!.id, values.teamMemberEmail)
    toast({
      title: "Team Member Assigned",
      description: `Escalation #${escalation?.id} has been assigned to ${values.teamMemberEmail}.`,
    })
    setIsSubmitting(false);
    onClose()
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Team Member to Escalation #{escalation.id}</DialogTitle>
          <DialogDescription>
            Select a team member to work on this escalation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teamMemberEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Member</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.email}>
                          {member.name} ({member.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Member
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

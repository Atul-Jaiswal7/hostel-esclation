
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
import { Textarea } from "@/components/ui/textarea"
import { useEscalationContext } from "@/context/escalation-context"
import { useSettingsContext } from "@/context/settings-context"
import { useToast } from "@/hooks/use-toast"
import type { Escalation, EscalationStatus } from "@/types"

const formSchema = z.object({
  status: z.string().min(1, { message: "Status is required." }),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters." }),
})

interface UpdateStatusDialogProps {
  escalation: Escalation | null
  isOpen: boolean
  onClose: () => void
}

export function UpdateStatusDialog({ escalation, isOpen, onClose }: UpdateStatusDialogProps) {
  const { updateEscalationStatus } = useEscalationContext()
  const { settings } = useSettingsContext()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: escalation?.status,
      comment: "",
    },
  })

  React.useEffect(() => {
    if (escalation) {
      form.reset({
        status: escalation.status,
        comment: "",
      })
    }
  }, [escalation, form])

  if (!escalation) return null

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    await updateEscalationStatus(escalation!.id, values.status as EscalationStatus, values.comment)
    toast({
      title: "Status Updated",
      description: `Escalation #${escalation?.id} has been updated to "${values.status}".`,
    })
    setIsSubmitting(false);
    onClose()
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Escalation #{escalation.id}</DialogTitle>
          <DialogDescription>
            Change the status and add a comment for this escalation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {settings.statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a comment explaining the status change..."
                      {...field}
                    />
                  </FormControl>
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

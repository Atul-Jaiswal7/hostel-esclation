
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
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  value: z.string().min(1, { message: "Value cannot be empty." }),
})

interface AddEditDialogProps {
  isOpen: boolean
  onClose: () => void
  type: 'departments' | 'statuses' | 'roles'
  initialValue?: string
  onSave: (type: 'departments' | 'statuses' | 'roles', newValue: string, oldValue?: string) => Promise<void>
}

export function AddEditDialog({
  isOpen,
  onClose,
  type,
  initialValue,
  onSave,
}: AddEditDialogProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: initialValue || "",
    },
  })

  React.useEffect(() => {
    form.reset({ value: initialValue || "" })
  }, [initialValue, form])

  const typeName = type.slice(0, -1);
  const title = initialValue ? `Edit ${typeName}` : `Add new ${typeName}`
  const description = initialValue
    ? `Change the value for this ${typeName}.`
    : `Enter the value for the new ${typeName}.`

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    await onSave(type, values.value, initialValue);
    setIsSaving(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{typeName} Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

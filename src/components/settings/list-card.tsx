
"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ListCardProps {
  title: string
  description: string
  items: string[]
  onAdd: () => void
  onEdit: (item: string) => void
  onDelete: (item: string) => void
}

export function ListCard({
  title,
  description,
  items,
  onAdd,
  onEdit,
  onDelete,
}: ListCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-60">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <span>{item}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
             {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">
                    No items yet.
                </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline" onClick={onAdd}>
          <Plus className="mr-2" />
          Add New {title.slice(0, -1)}
        </Button>
      </CardFooter>
    </Card>
  )
}

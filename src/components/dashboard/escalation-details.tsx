
"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Escalation, Comment } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { format } from "date-fns";

interface EscalationDetailsProps {
  escalation: Escalation | null
  isOpen: boolean
  onClose: () => void
}

const TimelineItem = ({ comment }: { comment: Comment }) => (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-primary rounded-full" />
        <div className="w-px h-full bg-border" />
      </div>
      <div className="flex-1 pb-8">
        <div className="flex justify-between items-center">
            <p className="font-semibold">{comment.author}</p>
            <p className="text-xs text-muted-foreground">{format(comment.timestamp, "PPP p")}</p>
        </div>
        <p className="text-sm text-muted-foreground">{comment.text}</p>
      </div>
    </div>
);


export function EscalationDetails({ escalation, isOpen, onClose }: EscalationDetailsProps) {
  if (!escalation) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-3/4 md:w-1/2 lg:w-2/5 xl:w-1/3 p-0">
        <ScrollArea className="h-full">
            <div className="p-6">
                <SheetHeader>
                    <SheetTitle>Escalation #{escalation.id}</SheetTitle>
                    <SheetDescription>
                        Details for the escalation raised by {escalation.studentName}.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 my-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Student</p>
                            <p className="font-medium">{escalation.studentName}</p>
                            <p className="text-xs text-muted-foreground">{escalation.studentEmail}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-medium">{escalation.hostelName}</p>
                            <p className="text-xs text-muted-foreground">Room: {escalation.roomNumber}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Status</p>
                            <Badge variant="secondary">{escalation.status}</Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Department</p>
                            <Badge variant="outline">{escalation.department}</Badge>
                        </div>
                         <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">{format(escalation.startDate, "PPP")}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">{escalation.endDate ? format(escalation.endDate, "PPP") : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Assigned Warden</p>
                            <p className="font-medium">{escalation.assignedTo}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Assigned Team Member</p>
                            <p className="font-medium">{escalation.assignedTeamMemberEmail || 'N/A'}</p>
                        </div>
                    </div>
                     <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
                            {escalation.description}
                        </p>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-4">Timeline</h4>
                        <div className="relative">
                           {escalation.history.length > 0 ? (
                                escalation.history.map((comment, index) => (
                                    <TimelineItem key={index} comment={comment} />
                                ))
                           ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No updates yet.</p>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

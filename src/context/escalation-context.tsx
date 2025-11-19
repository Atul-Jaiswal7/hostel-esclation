
"use client"

import * as React from "react"
import { EscalationStatus } from "@/types";
import type { Escalation, Comment, CommentFirestore } from "@/types"
import { sendNewEscalationNotification } from "@/lib/actions";
import { db, auth } from "../firebase/config";
import { collection, addDoc, updateDoc, doc, Timestamp, onSnapshot, query, orderBy, arrayUnion, where, getDocs } from "firebase/firestore";
import { fromFirestore } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface EscalationContextType {
  escalations: Escalation[]
  loading: boolean
  addEscalation: (escalation: Omit<Escalation, 'id' | 'startDate' | 'endDate' | 'history' | 'involvedUsers' | 'createdBy'>) => Promise<void>
  addComment: (escalationId: string, comment: Omit<Comment, 'id'>) => Promise<void>
  updateEscalationStatus: (escalationId: string, status: EscalationStatus, commentText: string) => Promise<void>
  assignTeamMember: (escalationId: string, teamMemberEmail: string) => Promise<void>
}

const EscalationContext = React.createContext<EscalationContextType | undefined>(undefined)

export function EscalationProvider({ children }: { children: React.ReactNode }) {
  const [escalations, setEscalations] = React.useState<Escalation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const { user, isAnonymous, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user || isAnonymous) {
      setEscalations([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "escalations"), orderBy("startDate", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const escalationsData = querySnapshot.docs.map(doc => fromFirestore<Escalation>(doc));
        setEscalations(escalationsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching escalations:", error);
        toast({ title: "Error fetching data", description: "Could not load escalations. Please try again.", variant: "destructive" });
        setLoading(false);
    });

    return () => unsubscribe();

  }, [user, isAnonymous, authLoading, toast]);

  const addEscalation = async (escalation: Omit<Escalation, 'id' | 'startDate' | 'endDate' | 'history' | 'involvedUsers' | 'createdBy'>) => {
    try {
        const user = auth.currentUser;
        if (!user || user.isAnonymous || !user.email) throw new Error("User not properly authenticated");

        const involved = [user.email, escalation.hodEmail];
        if (escalation.assignedTeamMemberEmail) {
            involved.push(escalation.assignedTeamMemberEmail);
        }

        const newEscalation = {
            ...escalation,
            createdBy: user.email, // Track who created the escalation
            startDate: Timestamp.now(),
            endDate: null,
            history: [],
            involvedUsers: Array.from(new Set(involved)), // Ensure unique emails
        };
        const docRef = await addDoc(collection(db, "escalations"), newEscalation);

        // Send notification using Firebase Auth's built-in email system
        await sendNewEscalationNotification({
            hodEmail: escalation.hodEmail,
            escalationId: docRef.id,
            studentName: escalation.studentName,
            department: escalation.department,
        });
    } catch (error) {
        console.error("Error adding escalation:", error);
        toast({ title: "Error", description: "Could not create the escalation.", variant: "destructive" });
    }
  }

  const addComment = async (escalationId: string, comment: Omit<Comment, 'id'>) => {
    const escalationDocRef = doc(db, "escalations", escalationId);
    try {
        const newComment: CommentFirestore = {
            ...comment,
            id: `C${Date.now()}`,
            timestamp: Timestamp.fromDate(comment.timestamp),
        };
        await updateDoc(escalationDocRef, {
            history: arrayUnion(newComment)
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        toast({ title: "Error", description: "Could not add comment.", variant: "destructive" });
    }
  }

  const updateEscalationStatus = async (escalationId: string, status: EscalationStatus, commentText: string) => {
    try {
        const user = auth.currentUser;
        if (!user || user.isAnonymous) throw new Error("User not properly authenticated");

        // Find the escalation to get its current status and details
        const escalation = escalations.find(e => e.id === escalationId);
        if (!escalation) {
            throw new Error("Escalation not found");
        }

        const oldStatus = escalation.status;
        const newComment: CommentFirestore = {
            id: `C${Date.now()}`,
            author: user.email || "System",
            timestamp: Timestamp.now(),
            text: `Status updated to: ${status}. ${commentText}`,
        };

        await updateDoc(doc(db, "escalations", escalationId), {
            status,
            history: arrayUnion(newComment),
        });

        // Send CRM notification for status update
        try {
            const response = await fetch('/api/notifications/crm-status-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    escalationId,
                    studentName: escalation.studentName,
                    department: escalation.department,
                    oldStatus,
                    newStatus: status,
                    updatedBy: user.email || "System",
                }),
            });

            if (!response.ok) {
                console.error('Failed to send CRM status update notification');
            } else {
                const result = await response.json();
                console.log('CRM status update notification sent:', result);
            }
        } catch (error) {
            console.error('Error sending CRM status update notification:', error);
        }

        toast({ title: "Status Updated", description: `Escalation status has been updated to ${status}.` });
    } catch (error) {
        console.error("Error updating escalation status:", error);
        toast({ title: "Error", description: "Could not update escalation status.", variant: "destructive" });
    }
  };

  const assignTeamMember = async (escalationId: string, teamMemberEmail: string) => {
    try {
        const user = auth.currentUser;
        if (!user || user.isAnonymous) throw new Error("User not properly authenticated");

        // Find the escalation to get its details for the email
        const escalation = escalations.find(e => e.id === escalationId);
        if (!escalation) {
            throw new Error("Escalation not found");
        }

        const newComment: CommentFirestore = {
            id: `C${Date.now()}`,
            author: user.email || "System",
            timestamp: Timestamp.now(),
            text: `Assigned to team member: ${teamMemberEmail}`,
        };

        await updateDoc(doc(db, "escalations", escalationId), {
            assignedTeamMemberEmail: teamMemberEmail,
            history: arrayUnion(newComment),
            involvedUsers: arrayUnion(teamMemberEmail),
        });

        // Send email notification to the assigned team member
        try {
            const response = await fetch('/api/notifications/team-member-assignment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamMemberEmail,
                    escalationId,
                    studentName: escalation.studentName,
                    department: escalation.department,
                    hodName: escalation.assignedTo, // This is the Warden name
                    description: escalation.description,
                }),
            });

            if (!response.ok) {
                console.error('Failed to send team member assignment notification');
            } else {
                console.log('Team member assignment notification sent successfully');
            }
        } catch (error) {
            console.error('Error sending team member assignment notification:', error);
        }

        toast({ 
            title: "Team Member Assigned", 
            description: `Team member ${teamMemberEmail} has been assigned and notified via email.` 
        });

    } catch (error) {
        console.error("Error assigning team member:", error);
        toast({ title: "Error", description: "Could not assign team member.", variant: "destructive" });
    }
  };

  const value = { escalations, loading, addEscalation, addComment, updateEscalationStatus, assignTeamMember }

  return (
    <EscalationContext.Provider value={value}>
      {children}
    </EscalationContext.Provider>
  )
}

export function useEscalationContext() {
  const context = React.useContext(EscalationContext)
  if (context === undefined) {
    throw new Error("useEscalationContext must be used within an EscalationProvider")
  }
  return context
}

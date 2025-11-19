import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { Escalation, EscalationFirestore, Comment, CommentFirestore } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Firestore data converters
export const fromFirestore = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
    const data = doc.data();

    // Convert Timestamps to Dates
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        }
        if(key === 'history' && Array.isArray(data[key])) {
            data[key] = data[key].map((comment: any) => {
                if(comment.timestamp instanceof Timestamp) {
                    return { ...comment, timestamp: comment.timestamp.toDate() };
                }
                return comment;
            });
        }
    }
    return { id: doc.id, ...data } as T;
};

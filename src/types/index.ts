
import { Timestamp } from "firebase/firestore";

// Using string types instead of enums to allow for dynamic data from a context/backend.
export type Department = string;

export type EscalationStatus = string;
  
export interface Comment {
    id: string;
    author: string;
    timestamp: Date;
    text: string;
}

export interface CommentFirestore extends Omit<Comment, 'timestamp'> {
    timestamp: Timestamp;
}
  
export interface Escalation {
    id: string;
    studentName: string;
    studentEmail: string;
    hostelName: string;
    roomNumber: string;
    startDate: Date;
    endDate: Date | null;
    department: Department;
    description: string;
    status: EscalationStatus;
    assignedTo: string; // Supervisor name
    hodEmail: string;
    assignedTeamMemberEmail: string | null;
    history: Comment[];
    involvedUsers: string[]; // Creator, Supervisor, assigned Team Member
    createdBy: string; // Email of user who created the escalation
}

export interface EscalationFirestore extends Omit<Escalation, 'startDate' | 'endDate' | 'history'> {
    startDate: Timestamp;
    endDate: Timestamp | null;
    history: CommentFirestore[];
}

export type EmployeeRole = string;

export interface Employee {
    id: string;
    name: string;
    email: string;
    role: EmployeeRole;
    department: Department;
    hostel?: string;
    isAdmin?: boolean;
    createdAt?: Date;
    isActive?: boolean;
}

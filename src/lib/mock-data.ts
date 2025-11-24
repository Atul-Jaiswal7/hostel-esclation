
import { Escalation, EscalationStatus, Employee, EmployeeRole, Department } from "@/types";

export const INITIAL_DEPARTMENTS: Department[] = ["Maintenance", "Mess", "Water", "Electricity", "Security", "Cleaning", "Internet", "Other"];
export const INITIAL_STATUSES: EscalationStatus[] = ["New", "In Progress", "Resolved", "Closed"];
export const INITIAL_ROLES: EmployeeRole[] = ["Supervisor", "Team Member", "Hostel Office", "Admin"];
export const INITIAL_HOSTELS: string[] = ["Hostel A", "Hostel B", "Hostel C", "Hostel D"];


export const MOCK_ESCALATIONS: Omit<Escalation, 'id' | 'startDate' | 'endDate' | 'history' | 'assignedTo' | 'hodEmail' | 'assignedTeamMemberEmail'>[] = [
    {
        studentName: "Rahul Sharma",
        studentEmail: "rahul.sharma@manit.ac.in",
        hostelName: "Hostel A",
        roomNumber: "101",
        department: "Water",
        description: "The water tap in the bathroom is leaking continuously and has caused water to accumulate on the floor. Immediate repair is required.",
        status: "New",
        involvedUsers: ["admin@manit.ac.in", "supervisor.maintenance@manit.ac.in"],
        createdBy: "admin@manit.ac.in",
    },
    {
        studentName: "Priya Patel",
        studentEmail: "priya.patel@manit.ac.in",
        hostelName: "Hostel B",
        roomNumber: "205",
        department: "Electricity",
        description: "The room lights are not working properly. The switch seems to be faulty and needs replacement.",
        status: "In Progress",
        involvedUsers: ["admin@manit.ac.in", "supervisor.electricity@manit.ac.in"],
        createdBy: "admin@manit.ac.in",
    },
    {
        studentName: "Amit Kumar",
        studentEmail: "amit.kumar@manit.ac.in",
        hostelName: "Hostel C",
        roomNumber: "312",
        department: "Maintenance",
        description: "The door lock is broken and needs to be replaced for security purposes.",
        status: "Resolved",
        involvedUsers: ["admin@manit.ac.in", "supervisor.maintenance@manit.ac.in"],
        createdBy: "admin@manit.ac.in",
    },
];

export const MOCK_EMPLOYEES: Omit<Employee, 'id'>[] = [
    { name: "Admin User", email: "admin@manit.ac.in", role: "Admin", department: "Management", isAdmin: true },
    { name: "Hostel Office User", email: "hostel.office@manit.ac.in", role: "Hostel Office", department: "Hostel Office", isAdmin: false },
    { name: "Dr. Rajesh Kumar", email: "supervisor.maintenance@manit.ac.in", role: "Supervisor", department: "Maintenance", isAdmin: false },
    { name: "Dr. Sunita Verma", email: "supervisor.mess@manit.ac.in", role: "Supervisor", department: "Mess", isAdmin: false },
    { name: "Dr. Anil Singh", email: "supervisor.electricity@manit.ac.in", role: "Supervisor", department: "Electricity", isAdmin: false },
    { name: "Dr. Meera Sharma", email: "supervisor.water@manit.ac.in", role: "Supervisor", department: "Water", isAdmin: false },
    { name: "Maintenance Team 1", email: "team.maint1@manit.ac.in", role: "Team Member", department: "Maintenance", isAdmin: false },
    { name: "Electricity Team 1", email: "team.elec1@manit.ac.in", role: "Team Member", department: "Electricity", isAdmin: false },
    { name: "Water Team 1", email: "team.water1@manit.ac.in", role: "Team Member", department: "Water", isAdmin: false },
    { name: "Security Team 1", email: "team.security1@manit.ac.in", role: "Team Member", department: "Security", isAdmin: false },
    { name: "Cleaning Team 1", email: "team.cleaning1@manit.ac.in", role: "Team Member", department: "Cleaning", isAdmin: false },
    { name: "Internet Team 1", email: "team.internet1@manit.ac.in", role: "Team Member", department: "Internet", isAdmin: false },
];

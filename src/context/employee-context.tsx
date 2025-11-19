
"use client"

import * as React from "react"
import type { Employee } from "@/types"
import { db } from "../firebase/config"
import { collection, addDoc, onSnapshot, query, orderBy, getDocs } from "firebase/firestore"
import { fromFirestore } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

interface EmployeeContextType {
  employees: Employee[]
  loading: boolean
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>
  refreshEmployees: () => Promise<void>
}

const EmployeeContext = React.createContext<EmployeeContextType | undefined>(undefined)

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const { user, isAnonymous, loading: authLoading } = useAuth();

  const refreshEmployees = async () => {
    if (!user || isAnonymous) return;
    
    try {
      setLoading(true);
      const q = query(collection(db, "employees"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const employeesData = querySnapshot.docs.map(doc => fromFirestore<Employee>(doc));
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error refreshing employees:", error);
      toast({ title: "Error", description: "Could not refresh employee data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (authLoading) {
        setLoading(true);
        return;
    }

    if (!user || isAnonymous) {
        setEmployees([]);
        setLoading(false);
        return;
    }
    
    const q = query(collection(db, "employees"), orderBy("name", "asc"));
    
    const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
      const employeesData = querySnapshot.docs.map(doc => fromFirestore<Employee>(doc));
      setEmployees(employeesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching employees:", error);
      toast({ title: "Error", description: "Could not load employee data.", variant: "destructive" });
      setLoading(false);
    });
    return () => unsubscribeSnapshot();
      
  }, [user, isAnonymous, authLoading, toast]);

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      await addDoc(collection(db, "employees"), employee);
    } catch (error) {
        console.error("Error adding employee:", error);
        toast({ title: "Error", description: "Could not add the employee.", variant: "destructive" });
    }
  }

  const value = { employees, loading, addEmployee, refreshEmployees }

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployeeContext() {
  const context = React.useContext(EmployeeContext)
  if (context === undefined) {
    throw new Error("useEmployeeContext must be used within an EmployeeProvider")
  }
  return context
}

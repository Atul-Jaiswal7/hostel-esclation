
"use client"

import * as React from "react"
import { db, auth } from "../firebase/config";
import { doc, getDoc, setDoc, collection, writeBatch, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { INITIAL_DEPARTMENTS, INITIAL_ROLES, INITIAL_STATUSES, MOCK_EMPLOYEES, MOCK_ESCALATIONS } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";


type SettingsType = {
  departments: string[];
  statuses: string[];
  roles: string[];
};

interface SettingsContextType {
  settings: SettingsType;
  loading: boolean;
  addSetting: (type: keyof SettingsType, value: string) => Promise<void>;
  updateSetting: (type: keyof SettingsType, oldValue: string, newValue: string) => Promise<void>;
  deleteSetting: (type: keyof SettingsType, value: string) => Promise<void>;
  seedDatabase: () => Promise<void>;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

const initialSettings: SettingsType = {
  departments: INITIAL_DEPARTMENTS,
  statuses: INITIAL_STATUSES,
  roles: INITIAL_ROLES,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<SettingsType>(initialSettings);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const { user, isAnonymous, loading: authLoading, isAdmin } = useAuth();


  const fetchSettings = React.useCallback(async () => {
    setLoading(true);
    const settingsDocRef = doc(db, "settings", "system");
    try {
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as SettingsType);
      } else {
        console.log("Settings document does not exist, using initial mock settings.");
        setSettings(initialSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({ title: "Could not load settings", description: "Loading default settings as a fallback. You may need to seed the database.", variant: "destructive" });
      setSettings(initialSettings);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if(authLoading) {
        setLoading(true);
        return;
    }
    if (user && !isAnonymous) {
        fetchSettings();
    } else {
        setSettings(initialSettings);
        setLoading(false);
    }
  }, [user, isAnonymous, authLoading, fetchSettings]);

  const updateFirestoreSettings = async (newSettings: SettingsType) => {
    const settingsDocRef = doc(db, "settings", "system");
    try {
      await setDoc(settingsDocRef, newSettings, { merge: true });
      setSettings(newSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({ title: "Error", description: "Could not save settings.", variant: "destructive" });
    }
  };

  const addSetting = async (type: keyof SettingsType, value: string) => {
    if (!isAdmin) {
      toast({ title: "Access Denied", description: "Only administrators can modify settings.", variant: "destructive" });
      return;
    }
    
    const key = type;
    if (settings[key].includes(value)) {
      toast({ title: "Duplicate", description: `This ${type.slice(0, -1)} already exists.`, variant: "destructive" });
      return;
    }
    const newSettings = {
      ...settings,
      [key]: [...settings[key], value],
    };
    await updateFirestoreSettings(newSettings);
    toast({ title: "Success", description: `${type.slice(0, -1)} added.` });
  };

  const updateSetting = async (type: keyof SettingsType, oldValue: string, newValue: string) => {
    if (!isAdmin) {
      toast({ title: "Access Denied", description: "Only administrators can modify settings.", variant: "destructive" });
      return;
    }
    const key = type;
    const newSettings = {
      ...settings,
      [key]: settings[key].map(item => (item === oldValue ? newValue : item)),
    };
    await updateFirestoreSettings(newSettings);
    toast({ title: "Success", description: `${type.slice(0, -1)} updated.` });
  };

  const deleteSetting = async (type: keyof SettingsType, value: string) => {
    if (!isAdmin) {
      toast({ title: "Access Denied", description: "Only administrators can modify settings.", variant: "destructive" });
      return;
    }
    const key = type;
    const newSettings = {
      ...settings,
      [key]: settings[key].filter(item => item !== value),
    };
    await updateFirestoreSettings(newSettings);
    toast({ title: "Success", description: `${type.slice(0, -1)} deleted.` });
  };

  const seedDatabase = async () => {
    if (!isAdmin) {
      toast({ title: "Access Denied", description: "Only administrators can seed the database.", variant: "destructive" });
      return;
    }
      setLoading(true);
      const user = auth.currentUser;
      if (!user || user.isAnonymous || !user.email) {
          toast({ title: "Error", description: "You must be logged in with a real account to seed the database.", variant: "destructive" });
          setLoading(false);
          return;
      }
      const userEmail = user.email;

      try {
          const batch = writeBatch(db);

          const settingsData = { departments: INITIAL_DEPARTMENTS, roles: INITIAL_ROLES, statuses: INITIAL_STATUSES };
          batch.set(doc(db, "settings", "system"), settingsData);
          
          const employeesCollection = collection(db, "employees");
          MOCK_EMPLOYEES.forEach(emp => {
              const newDoc = doc(employeesCollection);
              batch.set(newDoc, emp);
          });
          
          const escalationsCollection = collection(db, "escalations");
          MOCK_ESCALATIONS.forEach(esc => {
              const newDoc = doc(escalationsCollection);
              const hod = MOCK_EMPLOYEES.find(e => e.department === esc.department && e.role === "Warden");
              const teamMember = MOCK_EMPLOYEES.find(e => e.department === esc.department && e.role === "Team Member");
              
              const involvedUsers = [userEmail];
              if (hod) involvedUsers.push(hod.email);
              if (teamMember) involvedUsers.push(teamMember.email);

              const newEscalation = {
                  ...esc,
                  startDate: Timestamp.fromDate(new Date()),
                  endDate: null,
                  assignedTo: hod ? hod.name : "N/A",
                  hodEmail: hod ? hod.email : "N/A",
                  assignedTeamMemberEmail: teamMember ? teamMember.email : null,
                  history: [],
                  createdBy: userEmail,
                  involvedUsers: Array.from(new Set(involvedUsers)),
              }
              batch.set(newDoc, newEscalation);
          });

          await batch.commit();

          toast({ title: "Success", description: "Database has been seeded with initial data." });
          // Manually refetch settings after seeding
          await fetchSettings();
      } catch (error) {
          console.error("Error seeding database:", error);
          toast({ title: "Error", description: "Could not seed the database. Check Firestore rules and console logs.", variant: "destructive" });
          setLoading(false);
      } 
  };


  const value = { settings, loading, addSetting, updateSetting, deleteSetting, seedDatabase };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettingsContext must be used within a SettingsProvider");
  }
  return context;
}

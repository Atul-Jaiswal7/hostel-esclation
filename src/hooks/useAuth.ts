
"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, User, getIdTokenResult } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  isAdmin: boolean;
  isHostelOffice: boolean;
  adminLoading: boolean;
  employeeName: string | null;
  hostel: string | null;
}

const defaultAuthState: AuthState = {
    user: null,
    loading: true,
    isAnonymous: true,
    isAdmin: false,
    isHostelOffice: false,
    adminLoading: true,
    employeeName: null,
    hostel: null,
};

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  const lastUserEmail = useRef<string | null>(null);
  const lastAdminStatus = useRef<boolean | null>(null);
  const lastHostelOfficeStatus = useRef<boolean | null>(null);

  // Memoized function to check admin and Hostel Office status using custom claims with Firestore fallback
  const checkUserStatus = useCallback(async (user: User): Promise<{ isAdmin: boolean; isHostelOffice: boolean; employeeName: string | null; hostel: string | null }> => {
    try {
      const userEmail = user.email || '';
      // Cache by email - skip caching for now to always fetch fresh employee name
      // if (userEmail && lastUserEmail.current === userEmail && lastAdminStatus.current !== null && lastHostelOfficeStatus.current !== null) {
      //   return { isAdmin: !!lastAdminStatus.current, isHostelOffice: !!lastHostelOfficeStatus.current, employeeName: null };
      // }

      // Prefer custom claims
      let isAdmin = false;
      let isHostelOffice = false;
      let employeeName: string | null = null;
      let hostel: string | null = null;
      try {
        const tokenResult = await getIdTokenResult(user, true);
        const claims = tokenResult.claims as any;
        isAdmin = Boolean(claims.isAdmin) || (claims.role === 'Admin');
        isHostelOffice = Boolean(claims.isHostelOffice) || (claims.role === 'Hostel Office');
      } catch (e) {
        // ignore, will fallback to Firestore
      }

      // Always fetch from Firestore to get employee name, status, and hostel
      if (db) {
        try {
          const ref = doc(db, 'employees', user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data() as any;
            // Use Firestore data if claims are not set
            if (!isAdmin && !isHostelOffice) {
              isAdmin = Boolean(data.isAdmin) || data.role === 'Admin';
              isHostelOffice = data.role === 'Hostel Office';
            }
            // Always get the employee name and hostel from Firestore
            employeeName = data.name || null;
            hostel = data.hostel || null;
          }
        } catch (e) {
          // ignore Firestore errors here
        }
      }

      lastUserEmail.current = userEmail || null;
      lastAdminStatus.current = isAdmin;
      lastHostelOfficeStatus.current = isHostelOffice;
      return { isAdmin, isHostelOffice, employeeName, hostel };
    } catch (error) {
      return { isAdmin: false, isHostelOffice: false, employeeName: null, hostel: null };
    }
  }, []);

  // Function to refresh user status without changing user
  const refreshUserStatus = useCallback(() => {
    if (authState.user) {
      checkUserStatus(authState.user).then(({ isAdmin, isHostelOffice, employeeName, hostel }) => {
        setAuthState(prev => ({
          ...prev,
          isAdmin,
          isHostelOffice,
          employeeName,
          hostel,
          adminLoading: false,
        }));
      });
    }
  }, [authState.user, checkUserStatus]);

  useEffect(() => {
    // Check if Firebase auth is available
    if (!auth) {
      console.warn('Firebase auth not available. Please check your environment variables.');
      setAuthState({ 
        user: null, 
        loading: false, 
        isAnonymous: true,
        isAdmin: false,
        isHostelOffice: false,
        adminLoading: false,
        employeeName: null,
        hostel: null
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const { isAdmin, isHostelOffice, employeeName, hostel } = await checkUserStatus(user);
          setAuthState({
              user,
              loading: false,
              isAnonymous: user.isAnonymous,
              isAdmin,
              isHostelOffice,
              employeeName,
              hostel,
              adminLoading: false,
          });
        } catch (error) {
          console.error('Error checking user status:', error);
          setAuthState({
              user,
              loading: false,
              isAnonymous: user.isAnonymous,
              isAdmin: false,
              isHostelOffice: false,
              employeeName: null,
              hostel: null,
              adminLoading: false,
          });
        }
      } else {
        // This case should be handled by the anonymous sign-in,
        // but we keep it for completeness.
        setAuthState({ 
          user: null, 
          loading: false, 
          isAnonymous: true,
          isAdmin: false,
          isHostelOffice: false,
          employeeName: null,
          hostel: null,
          adminLoading: false
        });
        
        // Clear cache when user signs out
        lastUserEmail.current = null;
        lastAdminStatus.current = null;
        lastHostelOfficeStatus.current = null;
      }
    });

    return () => unsubscribe();
  }, [checkUserStatus]);

  // Expose refresh function for manual user status refresh
  useEffect(() => {
    // Add refreshUserStatus to window for debugging
    (window as any).refreshUserStatus = refreshUserStatus;
  }, [refreshUserStatus]);

  return authState;
}

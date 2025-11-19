
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
  isCRM: boolean;
  adminLoading: boolean;
  employeeName: string | null;
}

const defaultAuthState: AuthState = {
    user: null,
    loading: true,
    isAnonymous: true,
    isAdmin: false,
    isCRM: false,
    adminLoading: true,
    employeeName: null,
};

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  const lastUserEmail = useRef<string | null>(null);
  const lastAdminStatus = useRef<boolean | null>(null);
  const lastCRMStatus = useRef<boolean | null>(null);

  // Memoized function to check admin and CRM status using custom claims with Firestore fallback
  const checkUserStatus = useCallback(async (user: User): Promise<{ isAdmin: boolean; isCRM: boolean; employeeName: string | null }> => {
    try {
      const userEmail = user.email || '';
      // Cache by email - skip caching for now to always fetch fresh employee name
      // if (userEmail && lastUserEmail.current === userEmail && lastAdminStatus.current !== null && lastCRMStatus.current !== null) {
      //   return { isAdmin: !!lastAdminStatus.current, isCRM: !!lastCRMStatus.current, employeeName: null };
      // }

      // Prefer custom claims
      let isAdmin = false;
      let isCRM = false;
      let employeeName: string | null = null;
      try {
        const tokenResult = await getIdTokenResult(user, true);
        const claims = tokenResult.claims as any;
        isAdmin = Boolean(claims.isAdmin) || (claims.role === 'Admin');
        isCRM = Boolean(claims.isCRM) || (claims.role === 'CRM');
      } catch (e) {
        // ignore, will fallback to Firestore
      }

      // Always fetch from Firestore to get employee name and status
      if (db) {
        try {
          const ref = doc(db, 'employees', user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data() as any;
            // Use Firestore data if claims are not set
            if (!isAdmin && !isCRM) {
              isAdmin = Boolean(data.isAdmin) || data.role === 'Admin';
              isCRM = Boolean(data.isCRM) || data.role === 'CRM';
            }
            // Always get the employee name from Firestore
            employeeName = data.name || null;
          }
        } catch (e) {
          // ignore Firestore errors here
        }
      }

      lastUserEmail.current = userEmail || null;
      lastAdminStatus.current = isAdmin;
      lastCRMStatus.current = isCRM;
      return { isAdmin, isCRM, employeeName };
    } catch (error) {
      return { isAdmin: false, isCRM: false, employeeName: null };
    }
  }, []);

  // Function to refresh user status without changing user
  const refreshUserStatus = useCallback(() => {
    if (authState.user) {
      checkUserStatus(authState.user).then(({ isAdmin, isCRM, employeeName }) => {
        setAuthState(prev => ({
          ...prev,
          isAdmin,
          isCRM,
          employeeName,
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
        isCRM: false,
        adminLoading: false,
        employeeName: null
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const { isAdmin, isCRM, employeeName } = await checkUserStatus(user);
          setAuthState({
              user,
              loading: false,
              isAnonymous: user.isAnonymous,
              isAdmin,
              isCRM,
              employeeName,
              adminLoading: false,
          });
        } catch (error) {
          console.error('Error checking user status:', error);
          setAuthState({
              user,
              loading: false,
              isAnonymous: user.isAnonymous,
              isAdmin: false,
              isCRM: false,
              employeeName: null,
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
          isCRM: false,
          employeeName: null,
          adminLoading: false
        });
        
        // Clear cache when user signs out
        lastUserEmail.current = null;
        lastAdminStatus.current = null;
        lastCRMStatus.current = null;
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

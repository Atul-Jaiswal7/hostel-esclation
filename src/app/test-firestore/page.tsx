
'use client';

import { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

export default function TestFirestore() {
  const [out, setOut] = useState('Click the button to run the diagnostic test.');
  const [loading, setLoading] = useState(false);

  async function runTest() {
    setLoading(true);
    setOut('Running test...');
    try {
      const testDocRef = doc(db, 'diagnostics', 'ping');
      
      setOut('Attempting to write to diagnostics/ping...');
      await setDoc(testDocRef, { ts: serverTimestamp() });
      setOut('Write successful! Attempting to read...');
      
      const snap = await getDoc(testDocRef);
      if (snap.exists()) {
        setOut(`Diagnostics OK: Read successful! Document exists. Timestamp: ${snap.data().ts.toDate()}`);
      } else {
        setOut('Diagnostics FAILED: Wrote document but could not read it back.');
      }
    } catch (e: any) {
      console.error(e);
      setOut(`Diagnostics FAILED: ${e.code ?? 'error'}: ${e.message}`);
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Firestore Connection Test</h1>
      <p>This page performs a simple write and read operation to the `/diagnostics/ping` document in your Firestore database. This helps verify that your Firebase configuration and basic security rules are working correctly.</p>
      <Button onClick={runTest} disabled={loading}>
        {loading ? 'Testing...' : 'Run Firestore Test'}
        </Button>
      <div className="p-4 bg-muted rounded-md">
        <h2 className="font-semibold">Test Output:</h2>
        <pre className="text-sm whitespace-pre-wrap">{out}</pre>
      </div>
    </div>
  );
}

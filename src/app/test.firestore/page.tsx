'use client';

import { useState } from 'react';
import { db } from '../../firebase/config'; // adjust if you place the file elsewhere
import { doc, getDoc } from 'firebase/firestore';

export default function TestFirestore() {
  const [out, setOut] = useState('click the button');

  async function readOnce() {
    try {
      // change "app" to your real doc id if different
      const snap = await getDoc(doc(db, 'settings', 'app'));
      setOut(snap.exists() ? JSON.stringify(snap.data(), null, 2) : 'No settings doc');
    } catch (e: any) {
      console.error(e);
      setOut(`${e.code ?? 'error'}: ${e.message}`);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <button onClick={readOnce}>Read settings/app</button>
      <pre>{out}</pre>
    </div>
  );
}

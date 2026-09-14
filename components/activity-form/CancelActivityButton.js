'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelActivity } from '@/lib/organizer/actions';
import styles from './organizer.module.css';

export default function CancelActivityButton({ activityId, title }) {
  const router = useRouter();
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cancelled, setCancelled] = useState(false);

  async function cancel() {
    if (locked.current || !window.confirm(`Ar tikrai norite atšaukti veiklą „${title}“? Esamos rezervacijos išliks istorijoje.`)) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await cancelActivity(activityId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setCancelled(true);
      router.refresh();
    } catch {
      setError('Nepavyko atšaukti veiklos. Atnaujinkite puslapį ir bandykite dar kartą.');
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  if (cancelled) return <p role="status">Veikla atšaukta.</p>;
  return <div>
    <button className={styles.cancelButton} type="button" disabled={busy} onClick={cancel}>
      {busy ? 'Atšaukiama…' : 'Atšaukti veiklą'}
    </button>
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </div>;
}

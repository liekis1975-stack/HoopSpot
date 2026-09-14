'use client';

import Link from 'next/link';
import { useState } from 'react';
import { saveActivity } from '@/lib/organizer/actions';
import styles from './organizer.module.css';

export default function ActivityForm({ activity = null }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError('');
    const formData = new FormData(event.currentTarget);
    if (!activity) {
      for (const field of ['starts_at', 'ends_at']) {
        const date = new Date(formData.get(field));
        if (!Number.isFinite(date.getTime())) { setError('Įveskite tinkamą datą ir laiką.'); return; }
        formData.set(field, date.toISOString());
      }
    }
    setBusy(true);
    try {
      const result = await saveActivity(activity ? String(activity.id) : null, formData);
      if (result?.error) setError(result.error);
    } catch {
      setError('Nepavyko išsaugoti veiklos. Patikrinkite ryšį ir bandykite dar kartą.');
    } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className={styles.form}>
    <label>Pavadinimas<input name="title" defaultValue={activity?.title ?? ''} required maxLength={160} /></label>
    <label>Aprašymas<textarea name="description" defaultValue={activity?.description ?? ''} maxLength={5000} rows={5} /></label>
    {activity ? <p>Redaguojami tik pavadinimas ir aprašymas. Vietų limitas: <strong>{activity.capacity}</strong> (nekeičiamas). Data, laikas ir vieta šiame etape taip pat nekeičiami.</p> : <>
      <p>Veiklos tipas: krepšinis. Laiką įveskite pagal savo įrenginio laiko juostą.</p>
      <label>Pradžia<input name="starts_at" type="datetime-local" required /></label>
      <label>Pabaiga<input name="ends_at" type="datetime-local" required /></label>
      <label>Vieta<input name="location" required maxLength={200} /></label>
      <label>Vietų limitas<input name="capacity" type="number" min={1} max={2147483647} step={1} required defaultValue={8} /></label>
      <p>Vietų limitą nustatote vieną kartą — sukūrus veiklą jo pakeisti negalėsite.</p>
    </>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <div className={styles.links}><button disabled={busy} type="submit">{busy ? 'Saugoma…' : activity ? 'Išsaugoti pakeitimus' : 'Sukurti veiklą'}</button><Link href="/my-activities">Grįžti į mano veiklas</Link></div>
  </form>;
}

import Link from 'next/link';
import CancelActivityButton from '@/components/activity-form/CancelActivityButton';
import styles from '@/components/activity-form/organizer.module.css';
import { organizerSession } from '@/lib/organizer/session';

const formatDate = (value) => new Intl.DateTimeFormat('lt-LT', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Vilnius' }).format(new Date(value));

export default async function MyActivitiesPage() {
  const { supabase, user } = await organizerSession();
  const { data: activities, error } = await supabase.from('activities').select('id,title,description,starts_at,ends_at,location,capacity,reserved_slots,status').eq('creator_id', user.id).order('starts_at', { ascending: false });
  // Only fetch participants for activities whose ownership was checked above.
  let reservations = [];
  let participantError = false;
  if (activities?.length) {
    const result = await supabase.from('reservations').select('id,activity_id,profiles(display_name)').in('activity_id', activities.map((activity) => activity.id)).eq('status', 'active');
    reservations = result.data ?? [];
    participantError = Boolean(result.error);
  }
  return <main className={styles.page}>
    <h1>Mano veiklos</h1><Link href="/activities/new">Sukurti krepšinio veiklą</Link>
    <p>Datos ir laikas rodomi Lietuvos laiko juosta (Europe/Vilnius).</p>
    {error ? <p role="alert">Nepavyko įkelti veiklų. Atnaujinkite puslapį ir bandykite dar kartą.</p> : !activities.length ? <p>Dar nesukūrėte veiklų. Pradėkite nuo naujos krepšinio veiklos.</p> : activities.map((activity) => {
      const participants = reservations.filter((reservation) => String(reservation.activity_id) === String(activity.id));
      return <article key={activity.id} className={styles.card}>
        <h2>{activity.title}</h2><p>{activity.description}</p>
        <p>Statusas: <strong>{activity.status === 'cancelled' ? 'Atšaukta' : 'Aktyvi'}</strong></p>
        <p>{formatDate(activity.starts_at)} – {formatDate(activity.ends_at)}<br />Vieta: {activity.location}</p>
        <p>Rezervuota: <strong>{activity.reserved_slots}</strong> · Laisva: <strong>{activity.capacity - activity.reserved_slots}</strong> · Vietų limitas: <strong>{activity.capacity}</strong></p>
        <Link href={`/activities/${activity.id}/edit`}>Redaguoti veiklą</Link>
        {activity.status === 'active' && <CancelActivityButton activityId={String(activity.id)} title={activity.title} />}
        <details><summary>Dalyvių sąrašas</summary>{participantError ? <p role="alert">Nepavyko įkelti dalyvių sąrašo.</p> : participants.length ? <ul>{participants.map((participant) => <li key={participant.id}>{participant.profiles?.display_name || 'Dalyvis'}</li>)}</ul> : <p>Aktyvių rezervacijų dar nėra.</p>}</details>
      </article>;
    })}
  </main>;
}

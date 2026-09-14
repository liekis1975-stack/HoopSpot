import { notFound } from 'next/navigation';
import ActivityForm from '@/components/activity-form';
import styles from '@/components/activity-form/organizer.module.css';
import { organizerSession } from '@/lib/organizer/session';
import { validActivityId } from '@/lib/organizer/validation.mjs';

export default async function EditActivityPage({ params }) {
  const { supabase, user } = await organizerSession();
  const { id } = await params;
  if (!validActivityId(id)) notFound();
  const { data: activity, error } = await supabase.from('activities').select('id,title,description,capacity').eq('id', id).eq('creator_id', user.id).maybeSingle();
  if (error) return <main className={styles.page}><h1>Veiklos redagavimas</h1><p role="alert">Nepavyko įkelti veiklos. Atnaujinkite puslapį.</p></main>;
  if (!activity) notFound();
  return <main className={styles.page}><h1>Redaguoti veiklą</h1><ActivityForm activity={activity} /></main>;
}

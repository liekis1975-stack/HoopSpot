import ActivityForm from '@/components/activity-form';
import styles from '@/components/activity-form/organizer.module.css';
import { organizerSession } from '@/lib/organizer/session';

export default async function NewActivityPage() {
  await organizerSession();
  return <main className={styles.page}><h1>Nauja krepšinio veikla</h1><ActivityForm /></main>;
}

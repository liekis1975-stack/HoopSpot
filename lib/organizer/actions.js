'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { organizerSession } from './session';
import { validateActivity, validActivityId } from './validation.mjs';

export async function cancelActivity(id) {
  const { supabase } = await organizerSession();
  if (!validActivityId(id)) return { error: 'Veikla nerasta arba neturite teisės jos atšaukti.' };
  try {
    const { error } = await supabase.rpc('cancel_activity', { p_activity_id: id });
    if (error) {
      if (error.message === 'Veikla nerasta arba neturite teisės jos atšaukti') {
        return { error: 'Veikla nerasta arba neturite teisės jos atšaukti.' };
      }
      return { error: 'Nepavyko atšaukti veiklos. Bandykite dar kartą.' };
    }
  } catch {
    return { error: 'Nepavyko susisiekti su duomenų baze. Bandykite dar kartą.' };
  }
  revalidatePath('/my-activities');
  return { success: true };
}

export async function saveActivity(id, formData) {
  const { supabase, user } = await organizerSession();
  const editing = id !== null;
  if (editing && !validActivityId(id)) return { error: 'Veikla nerasta arba neturite teisės jos redaguoti.' };
  const result = validateActivity(formData, editing);
  if (result.error) return result;
  let response;
  try {
    response = editing
      ? await supabase.from('activities').update(result.values).eq('id', id).eq('creator_id', user.id).select('id').maybeSingle()
      : await supabase.from('activities').insert({ ...result.values, creator_id: user.id }).select('id').single();
  } catch {
    return { error: 'Nepavyko susisiekti su duomenų baze. Bandykite dar kartą.' };
  }
  if (response.error) return { error: 'Nepavyko išsaugoti veiklos. Patikrinkite duomenis ir bandykite dar kartą.' };
  if (!response.data) return { error: 'Veikla nerasta arba neturite teisės jos redaguoti.' };
  revalidatePath('/my-activities');
  revalidatePath('/activities');
  if (editing) {
    revalidatePath(`/activities/${id}`);
    revalidatePath(`/activities/${id}/edit`);
  }
  redirect('/my-activities');
}

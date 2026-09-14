export function validateActivity(formData, editing = false, now = Date.now()) {
  const text = (key) => String(formData.get(key) ?? '').trim();
  const title = text('title');
  const description = text('description');
  if (!title || title.length > 160) return { error: 'Pavadinimą turi sudaryti 1–160 simbolių.' };
  if (description.length > 5000) return { error: 'Aprašymas negali viršyti 5000 simbolių.' };
  // Editing deliberately accepts only columns permitted by the database grants.
  if (editing) return { values: { title, description } };
  const location = text('location');
  const capacity = Number(text('capacity'));
  const startText = text('starts_at');
  const endText = text('ends_at');
  const startsAt = new Date(startText);
  const endsAt = new Date(endText);
  if (!location || location.length > 200) return { error: 'Vietą turi sudaryti 1–200 simbolių.' };
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 2147483647) return { error: 'Vietų limitas turi būti teigiamas sveikasis skaičius (iki 2147483647).' };
  if (!/Z$/.test(startText) || !/Z$/.test(endText) || !Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime())) return { error: 'Įveskite pradžios ir pabaigos datą bei laiką.' };
  if (startsAt.getTime() <= now) return { error: 'Veiklos pradžia turi būti ateityje.' };
  if (endsAt <= startsAt) return { error: 'Pabaiga turi būti vėlesnė už pradžią.' };
  return { values: { title, description, location, capacity, activity_type: 'Krepšinis', starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() } };
}

export function validActivityId(id) {
  return typeof id === 'string' && /^[1-9]\d*$/.test(id) && BigInt(id) <= 9223372036854775807n;
}

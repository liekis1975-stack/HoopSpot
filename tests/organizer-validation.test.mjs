import test from 'node:test';
import assert from 'node:assert/strict';
import { validateActivity, validActivityId } from '../lib/organizer/validation.mjs';
const now = Date.parse('2030-01-01T00:00:00Z');
function form(overrides = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ title: ' Treniruotė ', description: '', location: 'Vilnius', capacity: '8', starts_at: '2030-01-02T10:00:00Z', ends_at: '2030-01-02T11:00:00Z', ...overrides })) data.set(key, value);
  return data;
}
test('creation validates and whitelists fields', () => {
  const { values } = validateActivity(form({ creator_id: 'someone-else', reserved_slots: '8', status: 'cancelled', activity_type: 'Other' }), false, now);
  assert.equal(values.title, 'Treniruotė');
  assert.equal(values.activity_type, 'Krepšinis');
  for (const field of ['creator_id', 'reserved_slots', 'status']) assert.equal(field in values, false);
});
test('invalid limits, dates and blank fields are rejected', () => {
  for (const overrides of [{ capacity: '0' }, { capacity: '1.5' }, { capacity: '2147483648' }, { title: ' ' }, { location: ' ' }, { starts_at: 'invalid' }, { starts_at: '2029-01-01T00:00:00Z' }, { ends_at: '2030-01-02T10:00:00Z' }, { description: 'x'.repeat(5001) }]) assert.ok(validateActivity(form(overrides), false, now).error);
});
test('editing never accepts capacity, ownership, counters or scheduling changes', () => {
  assert.deepEqual(validateActivity(form({ capacity: '99', creator_id: 'other', reserved_slots: '10' }), true).values, { title: 'Treniruotė', description: '' });
});
test('IDs must fit a positive PostgreSQL bigint', () => {
  for (const id of ['0', '-1', '1.2', 'abc', '9223372036854775808']) assert.equal(validActivityId(id), false);
  assert.equal(validActivityId('123'), true);
});

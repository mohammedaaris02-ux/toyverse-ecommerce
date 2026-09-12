'use client';
import { useMemo, useState, type SyntheticEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
export type DeliveryAgent = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  vehicle_type: string | null;
  vehicle_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
const empty = {
  id: '',
  full_name: '',
  phone: '',
  email: '',
  vehicle_type: '',
  vehicle_number: '',
  is_active: true,
};
export function DeliveryAgentsManager({
  initialItems,
}: {
  initialItems: DeliveryAgent[];
}) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  async function load() {
    const { data, error } = await supabase
      .from('delivery_agents')
      .select('*')
      .order('full_name');
    setItems((data ?? []) as DeliveryAgent[]);
    if (error) setMessage(error.message);
  }
  async function save(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      vehicle_type: form.vehicle_type.trim() || null,
      vehicle_number: form.vehicle_number.trim() || null,
      is_active: form.is_active,
    };
    const result = form.id
      ? await supabase.from('delivery_agents').update(payload).eq('id', form.id)
      : await supabase.from('delivery_agents').insert(payload);
    setMessage(
      result.error?.message ??
        (form.id ? 'Delivery agent updated.' : 'Delivery agent added.'),
    );
    if (!result.error) {
      setForm(empty);
      await load();
    }
    setSaving(false);
  }
  async function toggle(agent: DeliveryAgent) {
    const { error } = await supabase
      .from('delivery_agents')
      .update({ is_active: !agent.is_active })
      .eq('id', agent.id);
    setMessage(error?.message ?? 'Agent status updated.');
    await load();
  }
  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-semibold text-[#6D4AFF]">Delivery</p>
        <h1 className="mt-1 text-3xl font-bold">Delivery Agents</h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="overflow-hidden rounded-lg border border-[#E7EAF0] bg-white">
          {items.length ? (
            items.map((a) => (
              <article
                key={a.id}
                className="flex flex-wrap items-center gap-4 border-b border-[#E7EAF0] p-4 last:border-0"
              >
                <div className="min-w-56 flex-1">
                  <strong>{a.full_name}</strong>
                  <p className="text-sm text-[#667085]">
                    {a.phone} · {a.vehicle_type || 'Vehicle not set'}{' '}
                    {a.vehicle_number || ''}
                  </p>
                </div>
                <span
                  className={
                    a.is_active
                      ? 'text-sm font-semibold text-[#067647]'
                      : 'text-sm text-[#667085]'
                  }
                >
                  {a.is_active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() =>
                    setForm({
                      ...a,
                      email: a.email || '',
                      vehicle_type: a.vehicle_type || '',
                      vehicle_number: a.vehicle_number || '',
                    })
                  }
                  className="min-h-10 rounded-lg border px-3 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => void toggle(a)}
                  className="min-h-10 rounded-lg border px-3 text-sm"
                >
                  {a.is_active ? 'Disable' : 'Enable'}
                </button>
              </article>
            ))
          ) : (
            <p className="p-10 text-center text-[#667085]">
              No delivery agents yet.
            </p>
          )}
        </section>
        <form
          onSubmit={save}
          className="grid h-fit gap-4 rounded-lg border border-[#E7EAF0] bg-white p-5"
        >
          <h2 className="text-lg font-bold">
            {form.id ? 'Edit agent' : 'Add delivery agent'}
          </h2>
          {(
            [
              ['full_name', 'Full Name'],
              ['phone', 'Phone'],
              ['email', 'Email'],
              ['vehicle_type', 'Vehicle Type'],
              ['vehicle_number', 'Vehicle Number'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="grid gap-1.5 text-sm font-semibold">
              {label}
              <input
                required={key === 'full_name' || key === 'phone'}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="h-11 rounded-lg border border-[#D0D5DD] px-3 font-normal"
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Active
          </label>
          {message && (
            <output className="text-sm text-[#475467]">{message}</output>
          )}
          <button
            disabled={saving}
            className="min-h-11 rounded-lg bg-[#6D4AFF] px-4 font-semibold text-white"
          >
            {saving ? 'Saving...' : 'Save Agent'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(empty)}
              className="min-h-11 rounded-lg border"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

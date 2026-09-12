'use client';

import { useCallback, useMemo, useState, type SyntheticEvent } from 'react';
import { Edit3, LoaderCircle, Plus, Search, Tags, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify, type CatalogCategory } from '@/lib/catalog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const emptyForm = {
  id: '',
  name: '',
  slug: '',
  description: '',
  image_url: '',
  is_active: true,
};

export function CategoriesManager({
  initialItems,
}: {
  initialItems: CatalogCategory[];
}) {
  const [items, setItems] = useState<CatalogCategory[]>(initialItems);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState<CatalogCategory | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      setItems((data ?? []) as CatalogCategory[]);
      setMessage(error ? error.message : '');
      setLoading(false);
    },
    [supabase],
  );
  async function save(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      is_active: form.is_active,
    };
    const result = form.id
      ? await supabase.from('categories').update(payload).eq('id', form.id)
      : await supabase.from('categories').insert(payload);
    if (result.error) setMessage(result.error.message);
    else {
      setMessage(form.id ? 'Category updated.' : 'Category created.');
      setForm(emptyForm);
      await load();
    }
    setSaving(false);
  }
  async function toggle(item: CatalogCategory) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);
    setMessage(
      error?.message ??
        `${item.name} ${item.is_active ? 'disabled' : 'enabled'}.`,
    );
    await load();
  }
  async function remove() {
    if (!deleting) return;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', deleting.id);
    setMessage(error?.message ?? `${deleting.name} deleted.`);
    setDeleting(null);
    await load();
  }
  const visible = items.filter((item) =>
    `${item.name} ${item.slug}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-7">
        <p className="mb-1 text-sm font-semibold text-[#6D4AFF]">Catalog</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Categories</h1>
        <p className="mt-2 text-[#667085]">
          Create and organize the categories customers browse.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-lg border border-[#E7EAF0] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7EAF0] p-4">
            <label className="relative block min-w-64 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#98A2B3]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search categories"
                className="h-11 w-full rounded-lg border border-[#D0D5DD] pl-10 pr-3 outline-none focus:border-[#6D4AFF] focus:ring-3 focus:ring-[#6D4AFF]/15"
              />
            </label>
            <span className="text-sm text-[#667085]">
              {visible.length} categories
            </span>
          </div>
          {loading ? (
            <div className="grid min-h-52 place-items-center">
              <LoaderCircle className="size-6 animate-spin text-[#6D4AFF]" />
            </div>
          ) : visible.length === 0 ? (
            <div className="grid min-h-52 place-items-center text-center">
              <div>
                <Tags className="mx-auto mb-3 size-8 text-[#98A2B3]" />
                <p className="font-semibold">No categories found</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#E7EAF0]">
              {visible.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 p-4"
                >
                  <div className="grid size-11 place-items-center rounded-lg bg-[#F2EFFF] font-bold text-[#6D4AFF]">
                    {item.name.slice(0, 1)}
                  </div>
                  <div className="min-w-48 flex-1">
                    <strong>{item.name}</strong>
                    <p className="text-sm text-[#667085]">/{item.slug}</p>
                  </div>
                  <span
                    className={
                      item.is_active
                        ? 'rounded-full bg-[#ECFDF3] px-2.5 py-1 text-xs font-semibold text-[#067647]'
                        : 'rounded-full bg-[#F2F4F7] px-2.5 py-1 text-xs font-semibold text-[#667085]'
                    }
                  >
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        id: item.id,
                        name: item.name,
                        slug: item.slug,
                        description: item.description ?? '',
                        image_url: item.image_url ?? '',
                        is_active: item.is_active,
                      })
                    }
                    className="grid size-10 place-items-center rounded-lg border border-[#D0D5DD] hover:bg-[#F8FAFC]"
                    aria-label={`Edit ${item.name}`}
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(item)}
                    className="min-h-10 rounded-lg border border-[#D0D5DD] px-3 text-sm font-semibold hover:bg-[#F8FAFC]"
                  >
                    {item.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(item)}
                    className="grid size-10 place-items-center rounded-lg border border-[#FDA29B] text-[#B42318] hover:bg-[#FEF3F2]"
                    aria-label={`Delete ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="h-fit rounded-lg border border-[#E7EAF0] bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Plus className="size-5 text-[#6D4AFF]" />
            {form.id ? 'Edit category' : 'Add category'}
          </h2>
          <form onSubmit={save} className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm font-semibold">
              Name
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((v) => ({
                    ...v,
                    name: e.target.value,
                    slug: v.id ? v.slug : slugify(e.target.value),
                  }))
                }
                className="h-11 rounded-lg border border-[#D0D5DD] px-3 font-normal outline-none focus:border-[#6D4AFF]"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Slug
              <input
                required
                value={form.slug}
                onChange={(e) =>
                  setForm((v) => ({ ...v, slug: slugify(e.target.value) }))
                }
                className="h-11 rounded-lg border border-[#D0D5DD] px-3 font-normal outline-none focus:border-[#6D4AFF]"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((v) => ({ ...v, description: e.target.value }))
                }
                rows={4}
                className="rounded-lg border border-[#D0D5DD] p-3 font-normal outline-none focus:border-[#6D4AFF]"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Image URL
              <input
                type="url"
                value={form.image_url}
                onChange={(e) =>
                  setForm((v) => ({ ...v, image_url: e.target.value }))
                }
                className="h-11 rounded-lg border border-[#D0D5DD] px-3 font-normal outline-none focus:border-[#6D4AFF]"
              />
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((v) => ({ ...v, is_active: e.target.checked }))
                }
                className="size-4 accent-[#6D4AFF]"
              />
              Active
            </label>
            {message && (
              <output className="text-sm text-[#475467]">{message}</output>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 flex-1 rounded-lg bg-[#6D4AFF] px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : form.id
                    ? 'Save changes'
                    : 'Add category'}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={() => setForm(emptyForm)}
                  className="min-h-11 rounded-lg border border-[#D0D5DD] px-4 text-sm font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {deleting?.name}. Categories linked to
              products may need to be disabled instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-[#B42318] text-white hover:bg-[#912018]"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

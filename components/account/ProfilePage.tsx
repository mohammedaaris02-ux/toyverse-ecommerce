'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type SubmitEvent,
} from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react';

import { AnnouncementBar, Footer, Header } from '@/components/toyverse/shared';

import { useCustomerAuth } from './CustomerAuth';

import { useCustomerStore } from '@/components/customer/CustomerStore';
import {
  mapCustomerAddress,
  toAddressPayload,
  type AddressRow,
  type CustomerAddress as Address,
} from '@/lib/customer-addresses';
import { createClient } from '@/lib/supabase/client';

const focus =
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30';

const button = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E6EAF2] bg-white px-4 text-sm font-semibold transition hover:bg-[#F2EFFF] hover:text-[#6D4AFF] ${focus}`;

const primary = `${button} border-transparent bg-[#6D4AFF]! text-white hover:bg-[#5B3DF5]!`;

const phoneValid = (value: string) =>
  /^(?:\+91|91)?[6-9]\d{9}$/.test(value.replace(/[\s()-]/g, ''));

const emptyAddress: Address = {
  id: '',
  label: 'Home',
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

function Field({
  label,
  value,
  onChange,
  error,
  readOnly = false,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  readOnly?: boolean;
  type?: string;
  required?: boolean;
}) {
  const id = useId();

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[#344054]"
      >
        {label}

        {required && (
          <span aria-hidden="true" className="text-[#D92D20]">
            {' '}
            *
          </span>
        )}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        required={required}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 w-full min-w-0 rounded-xl border border-[#D9E2F0] bg-white px-3 text-base text-[#101828] outline-none transition read-only:cursor-not-allowed read-only:bg-[#F8FAFC] read-only:text-[#667085] aria-invalid:border-[#D92D20] ${focus}`}
      />

      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-[#B42318]">
          {error}
        </p>
      )}
    </div>
  );
}

function PersonalInformation() {
  const { user, updateProfile } = useCustomerAuth();

  const store = useCustomerStore();

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName ?? '');

  const [phone, setPhone] = useState(user?.phone ?? '');

  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
  }>({});

  if (!user) return null;

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: {
      fullName?: string;
      phone?: string;
    } = {};

    if (!fullName.trim()) {
      next.fullName = 'Please enter your full name.';
    }

    if (phone.trim() && !phoneValid(phone)) {
      next.phone = 'Enter a valid Indian mobile number, e.g. +91 98765 43210.';
    }

    setErrors(next);

    if (Object.keys(next).length) {
      return;
    }

    setSaving(true);

    const result = await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
    });

    setSaving(false);

    store.notify(result.message);

    if (result.success) {
      setEditing(false);
    }
  }

  function cancelEditing() {
    if (!user) return;
    setFullName(user.fullName ?? '');
    setPhone(user.phone ?? '');
    setErrors({});
    setEditing(false);
  }

  return (
    <section
      aria-labelledby="personal-title"
      className="rounded-[20px] border border-[#E6EAF2] bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="personal-title" className="text-xl font-bold">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-[#667085]">
            Manage your customer profile information.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            className={button}
            onClick={() => {
              setFullName(user.fullName ?? '');

              setPhone(user.phone ?? '');

              setErrors({});
              setEditing(true);
            }}
          >
            <Pencil className="size-4" />
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={submit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full Name"
            value={editing ? fullName : user.fullName}
            required
            readOnly={!editing}
            error={errors.fullName}
            onChange={(value) => {
              setFullName(value);

              setErrors((current) => ({
                ...current,
                fullName: undefined,
              }));
            }}
          />

          <Field
            label="Email Address"
            type="email"
            value={user.email}
            readOnly
            onChange={() => {}}
          />

          <Field
            label="Phone Number"
            type="tel"
            value={editing ? phone : user.phone}
            readOnly={!editing}
            error={errors.phone}
            onChange={(value) => {
              setPhone(value);

              setErrors((current) => ({
                ...current,
                phone: undefined,
              }));
            }}
          />

          <Field
            label="Account Role"
            value={user.role === 'admin' ? 'Admin' : 'Customer'}
            readOnly
            onChange={() => {}}
          />
        </div>

        <p className="mt-4 rounded-xl bg-[#EDF6FF] px-4 py-3 text-sm leading-6 text-[#475467]">
          Email changes will be handled separately through Supabase
          Authentication.
        </p>

        {editing && (
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className={button}
              disabled={saving}
              onClick={cancelEditing}
            >
              <X className="size-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`${primary} disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <Save className="size-4" />

              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

function Addresses() {
  const { user } = useCustomerAuth();
  const store = useCustomerStore();
  const supabase = useMemo(() => createClient(), []);
  const userId = user?.id;
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [draft, setDraft] = useState<Address | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');

  const errorMessage = useCallback(
    (error: { message: string }, fallback: string) => {
      console.error(fallback, error.message);
      return process.env.NODE_ENV === 'development' ? error.message : fallback;
    },
    [],
  );

  const loadAddresses = useCallback(async () => {
    if (!userId) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    if (error) {
      setLoadError(errorMessage(error, 'Unable to load saved addresses.'));
      setAddresses([]);
    } else {
      setAddresses(((data ?? []) as AddressRow[]).map(mapCustomerAddress));
    }
    setLoading(false);
  }, [errorMessage, supabase, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAddresses(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAddresses]);

  if (!user || !userId) return null;

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft) return;

    const next: Record<string, string> = {};

    const requiredFields: Array<keyof Address> = [
      'label',
      'name',
      'phone',
      'line1',
      'city',
      'state',
      'postalCode',
      'country',
    ];

    requiredFields.forEach((key) => {
      const value = draft[key];

      if (typeof value === 'string' && !value.trim()) {
        next[key] = 'This field is required.';
      }
    });

    if (draft.phone && !phoneValid(draft.phone)) {
      next.phone = 'Enter a valid Indian mobile number.';
    }

    if (
      draft.country.trim().toLowerCase() === 'india' &&
      !/^[1-9]\d{5}$/.test(draft.postalCode.trim())
    ) {
      next.postalCode = 'Enter a valid 6-digit PIN code.';
    }

    setErrors(next);

    if (Object.keys(next).length) {
      return;
    }

    const cleaned: Address = {
      ...draft,
      label: draft.label.trim(),
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      line1: draft.line1.trim(),
      line2: draft.line2.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
      postalCode: draft.postalCode.trim(),
      country: draft.country.trim(),
    };

    setSaving(true);
    const shouldBeDefault = cleaned.isDefault || addresses.length === 0;
    let addressId = cleaned.id;
    const payload = toAddressPayload(cleaned);
    const result = cleaned.id
      ? await supabase
          .from('addresses')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', cleaned.id)
          .eq('user_id', userId)
          .select('id')
          .single()
      : await supabase
          .from('addresses')
          .insert({ ...payload, user_id: userId, is_default: false })
          .select('id')
          .single();

    if (result.error) {
      store.notify(errorMessage(result.error, 'Unable to save address.'));
      setSaving(false);
      return;
    }
    addressId = result.data.id;

    if (shouldBeDefault) {
      const clearResult = await supabase
        .from('addresses')
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .neq('id', addressId);
      const defaultResult = clearResult.error
        ? clearResult
        : await supabase
            .from('addresses')
            .update({ is_default: true, updated_at: new Date().toISOString() })
            .eq('id', addressId)
            .eq('user_id', userId);
      if (defaultResult.error) {
        store.notify(
          errorMessage(
            defaultResult.error,
            'Address saved, but its default status could not be updated.',
          ),
        );
        setSaving(false);
        await loadAddresses();
        return;
      }
    }

    await loadAddresses();
    setDraft(null);
    setSaving(false);
    store.notify(
      cleaned.id
        ? 'Address updated successfully.'
        : 'Address added successfully.',
    );
  }

  async function deleteAddress(address: Address) {
    setActionPending(address.id);
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', address.id)
      .eq('user_id', userId);
    if (error) {
      store.notify(errorMessage(error, 'Unable to delete address.'));
      setActionPending(null);
      return;
    }
    if (address.isDefault) {
      const replacement = addresses.find((item) => item.id !== address.id);
      if (replacement) {
        const { error: defaultError } = await supabase
          .from('addresses')
          .update({ is_default: true, updated_at: new Date().toISOString() })
          .eq('id', replacement.id)
          .eq('user_id', userId);
        if (defaultError)
          store.notify(
            errorMessage(
              defaultError,
              'Address deleted, but a new default could not be selected.',
            ),
          );
      }
    }
    setDeleting(null);
    if (draft?.id === address.id) setDraft(null);
    await loadAddresses();
    setActionPending(null);
    store.notify('Address deleted successfully.');
  }

  async function setDefaultAddress(id: string) {
    setActionPending(id);
    const clearResult = await supabase
      .from('addresses')
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .neq('id', id);
    const result = clearResult.error
      ? clearResult
      : await supabase
          .from('addresses')
          .update({ is_default: true, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId);
    if (result.error) {
      store.notify(
        errorMessage(result.error, 'Unable to update the default address.'),
      );
    } else {
      await loadAddresses();
      store.notify('Default address updated successfully.');
    }
    setActionPending(null);
  }

  return (
    <section
      id="addresses"
      aria-labelledby="addresses-title"
      className="scroll-mt-28"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="addresses-title" className="text-xl font-bold">
            Saved Addresses
          </h2>

          <p className="mt-1 text-sm text-[#667085]">
            Manage the delivery addresses saved to your account.
          </p>
        </div>

        <button
          type="button"
          className={button}
          disabled={loading || saving || !!actionPending}
          onClick={() => {
            setDraft({
              ...emptyAddress,

              name: user.fullName || user.email.split('@')[0],

              phone: user.phone || '',

              isDefault: addresses.length === 0,
            });

            setErrors({});
          }}
        >
          <Plus className="size-4" />
          Add New Address
        </button>
      </div>

      {draft && (
        <form
          noValidate
          onSubmit={submit}
          className="mb-6 rounded-[20px] border border-[#E6EAF2] bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">
              {draft.id ? 'Edit Address' : 'New Address'}
            </h3>

            <button
              type="button"
              aria-label="Close address form"
              className={`grid size-9 place-items-center rounded-lg hover:bg-[#F2EFFF] ${focus}`}
              onClick={() => setDraft(null)}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {(
              [
                ['label', 'Address Label'],
                ['name', 'Recipient Full Name'],
                ['phone', 'Delivery Phone Number'],
                ['line1', 'Address Line 1'],
                ['line2', 'Address Line 2'],
                ['city', 'City'],
                ['state', 'State'],
                ['postalCode', 'Postal Code'],
                ['country', 'Country'],
              ] as const
            ).map(([key, label]) => (
              <Field
                key={key}
                label={label}
                value={draft[key]}
                type={key === 'phone' ? 'tel' : 'text'}
                required={key !== 'line2'}
                error={errors[key]}
                onChange={(value) => {
                  setDraft({
                    ...draft,
                    [key]: value,
                  });

                  setErrors((current) => {
                    const next = { ...current };
                    delete next[key];
                    return next;
                  });
                }}
              />
            ))}
          </div>

          <label className="mt-5 flex min-h-11 items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={draft.isDefault}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  isDefault: event.target.checked,
                })
              }
              className={`size-4 accent-[#6D4AFF] ${focus}`}
            />
            Set as default address
          </label>

          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className={button}
              onClick={() => setDraft(null)}
            >
              <X className="size-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`${primary} disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <Save className="size-4" />
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {loading && (
        <output className="block rounded-[20px] border border-[#E6EAF2] bg-white px-5 py-10 text-center text-[#667085]">
          Loading saved addresses...
        </output>
      )}

      {loadError && !loading && (
        <div
          className="mb-5 rounded-xl border border-[#FEE4E2] bg-[#FEF3F2] p-4 text-sm text-[#B42318]"
          role="alert"
        >
          <p>{loadError}</p>
          <button
            type="button"
            className={`${button} mt-3`}
            onClick={() => void loadAddresses()}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !loadError && addresses.length === 0 && !draft && (
        <div className="rounded-[20px] border border-dashed border-[#D9E2F0] bg-white px-5 py-10 text-center text-[#667085]">
          <MapPin className="mx-auto mb-3 size-8 text-[#6D4AFF]" />

          <p className="font-semibold text-[#344054]">
            No saved addresses yet.
          </p>

          <p className="mt-1 text-sm">
            Add an address to prepare your account for checkout.
          </p>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {addresses.map((address) => (
          <article
            key={address.id}
            className="min-w-0 rounded-[20px] border border-[#E6EAF2] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="break-words font-bold">{address.label}</h3>

              {address.isDefault && (
                <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#039855]">
                  Default address
                </span>
              )}
            </div>

            <div className="mt-4 break-words text-sm leading-7 text-[#667085]">
              <p className="font-semibold text-[#101828]">{address.name}</p>

              <p>{address.line1}</p>

              {address.line2 && <p>{address.line2}</p>}

              <p>
                {address.city}, {address.state} {address.postalCode}
              </p>

              <p>{address.country}</p>

              <p>Phone: {address.phone}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                aria-label={`Edit ${address.label} address`}
                className={button}
                disabled={!!actionPending}
                onClick={() => {
                  setDraft(address);
                  setErrors({});
                }}
              >
                <Pencil className="size-4" />
                Edit
              </button>

              <button
                type="button"
                aria-label={`Delete ${address.label} address`}
                className={button}
                disabled={!!actionPending}
                onClick={() => setDeleting(address.id)}
              >
                <Trash2 className="size-4" />
                Delete
              </button>

              {!address.isDefault && (
                <button
                  type="button"
                  className={button}
                  disabled={!!actionPending}
                  onClick={() => void setDefaultAddress(address.id)}
                >
                  Set as default
                </button>
              )}
            </div>

            {deleting === address.id && (
              <div className="mt-4 rounded-xl border border-[#FEE4E2] bg-[#FEF3F2] p-4">
                <p className="mb-3 text-sm font-semibold text-[#B42318]">
                  Delete this address?
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={button}
                    disabled={actionPending === address.id}
                    onClick={() => void deleteAddress(address)}
                  >
                    {actionPending === address.id
                      ? 'Deleting...'
                      : 'Confirm Delete'}
                  </button>

                  <button
                    type="button"
                    className={button}
                    onClick={() => setDeleting(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProfilePage() {
  const { user, ready, logout } = useCustomerAuth();

  const store = useCustomerStore();

  const router = useRouter();

  async function handleLogout() {
    await logout();

    store.notify('You have been logged out.');

    router.replace('/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#101828]">
      <AnnouncementBar />

      <Header />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#6D4AFF]">My Account</p>

          <h1 className="mt-2 text-3xl font-extrabold">My Profile</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667085]">
            Manage your ToyVerse customer profile and delivery information.
          </p>
        </div>

        {!ready ? (
          <output className="block py-20 text-center text-[#667085]">
            Loading account...
          </output>
        ) : !user ? (
          <section className="rounded-[20px] border border-[#E6EAF2] bg-white px-5 py-12 text-center shadow-sm">
            <User className="mx-auto mb-4 size-10 text-[#6D4AFF]" />

            <h2 className="text-xl font-bold">Sign in to view your profile</h2>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className={`${primary} mt-5`}
            >
              Sign In
            </button>
          </section>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav
              aria-label="Account navigation"
              className="flex flex-wrap gap-2 lg:sticky lg:top-28 lg:flex-col"
            >
              <Link
                href="/account/profile"
                aria-current="page"
                className={`${button} justify-start bg-[#F2EFFF]! text-[#6D4AFF]!`}
              >
                <User className="size-4" />
                My Profile
              </Link>

              <a href="#addresses" className={`${button} justify-start`}>
                <MapPin className="size-4" />
                My Addresses
              </a>

              <button
                type="button"
                onClick={() => router.push('/account/orders')}
                className={`${button} justify-start`}
              >
                <Package className="size-4" />
                My Orders
              </button>

              <button
                type="button"
                className={`${button} justify-start`}
                onClick={() => store.setPanel('wishlist')}
              >
                <Heart className="size-4" />
                Wishlist
              </button>

              <button
                type="button"
                className={`${button} justify-start text-[#B42318] hover:bg-[#FEF3F2] hover:text-[#B42318]`}
                onClick={() => void handleLogout()}
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </nav>

            <div className="min-w-0 space-y-8">
              <PersonalInformation key={user.id} />

              <Addresses />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

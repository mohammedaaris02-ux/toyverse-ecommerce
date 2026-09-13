'use client';

/* eslint-disable next/no-html-link-for-pages -- Native anchors avoid the Vinext production Link runtime failure. */

import { useRef, useState, type ReactNode, type SubmitEvent } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCustomerAuth } from '@/components/account/CustomerAuth';

const focus =
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30';
const input =
  'h-[52px] w-full rounded-xl border border-[#D9E2F0] bg-white pl-11 pr-12 text-base text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#6D4AFF] focus:ring-3 focus:ring-[#6D4AFF]/15 aria-invalid:border-[#D92D20]';

type FieldName = 'fullName' | 'email' | 'password' | 'confirmPassword';

export function RegisterPortal() {
  const { refreshUser } = useCustomerAuth();
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState<Record<FieldName, string>>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [notice, setNotice] = useState('');
  const [confirmationRequired, setConfirmationRequired] = useState(false);

  function update(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setNotice('');
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const fullName = values.fullName.trim().replace(/\s+/g, ' ');
    const email = values.email.trim().toLowerCase();
    const next: Partial<Record<FieldName, string>> = {};
    if (fullName.length < 2)
      next.fullName = 'Enter your full name using at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Please enter a valid email address.';
    if (values.password.length < 8)
      next.password = 'Password must contain at least 8 characters.';
    if (!values.confirmPassword)
      next.confirmPassword = 'Please confirm your password.';
    else if (values.confirmPassword !== values.password)
      next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;

    submitting.current = true;
    setPending(true);
    setNotice('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: values.password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const duplicate =
          error.code === 'user_already_exists' || error.status === 422;
        setNotice(
          duplicate
            ? 'An account with this email may already exist. Try signing in instead.'
            : 'Unable to create your account right now. Please try again.',
        );
        return;
      }

      if (!data.user || data.user.identities?.length === 0) {
        setNotice(
          'An account with this email may already exist. Try signing in instead.',
        );
        return;
      }

      if (!data.session) {
        setConfirmationRequired(true);
        return;
      }

      await refreshUser();
      window.location.replace('/');
    } catch (error) {
      console.error('Signup failed:', error);
      setNotice('Unable to create your account right now. Please try again.');
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-[#101828] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-lg">
        <a
          href="/"
          aria-label="ToyVerse home"
          className="mb-7 flex w-fit items-center gap-2"
        >
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6D4AFF] to-[#247BFE] text-white shadow-md">
            <Sparkles className="size-5" />
          </span>
          <strong className="text-xl font-extrabold">ToyVerse</strong>
        </a>

        <section className="rounded-2xl border border-[#E6EAF2] bg-white p-5 shadow-[0_12px_45px_rgb(16_24_40/6%)] sm:p-9">
          {confirmationRequired ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto size-12 text-[#039855]" />
              <h1 className="mt-5 text-2xl font-black">Check your email</h1>
              <p className="mt-3 leading-7 text-[#667085]">
                Account created successfully. Please check your email to verify
                your account before signing in.
              </p>
              <a
                href="/login"
                className={`mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#6D4AFF] px-6 font-bold text-white ${focus}`}
              >
                Go to Login <ArrowRight className="size-4" />
              </a>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-[#6D4AFF]">
                Customer Account
              </p>
              <h1 className="mt-2 text-3xl font-black">Create your account</h1>
              <p className="mt-3 text-[#667085]">
                Join ToyVerse and keep your orders, wishlist and cart together.
              </p>
              <form noValidate onSubmit={submit} className="mt-7 space-y-4">
                <Field
                  icon={User}
                  label="Full Name"
                  name="fullName"
                  value={values.fullName}
                  error={errors.fullName}
                  onChange={update}
                  autoComplete="name"
                />
                <Field
                  icon={Mail}
                  label="Email Address"
                  name="email"
                  type="email"
                  value={values.email}
                  error={errors.email}
                  onChange={update}
                  autoComplete="email"
                />
                <Field
                  icon={LockKeyhole}
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  error={errors.password}
                  onChange={update}
                  autoComplete="new-password"
                  trailing={
                    <VisibilityButton
                      visible={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                <Field
                  icon={LockKeyhole}
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={values.confirmPassword}
                  error={errors.confirmPassword}
                  onChange={update}
                  autoComplete="new-password"
                />
                {notice && (
                  <p
                    role="alert"
                    className="rounded-xl border border-[#FECDCA] bg-[#FEF3F2] p-3 text-sm text-[#B42318]"
                  >
                    {notice}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  aria-busy={pending}
                  className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] px-4 font-bold text-white shadow-sm disabled:cursor-wait disabled:opacity-65 ${focus}`}
                >
                  {pending ? 'Creating Account...' : 'Create Account'}{' '}
                  <ArrowRight className="size-5" />
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-[#667085]">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-bold text-[#6D4AFF] hover:text-[#247BFE]"
                >
                  Sign in
                </a>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function VisibilityButton({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={visible ? 'Hide password' : 'Show password'}
      className="grid size-11 place-items-center rounded-lg text-[#667085] hover:bg-[#F2EFFF]"
    >
      {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
    </button>
  );
}

function Field({
  icon: Icon,
  label,
  name,
  value,
  error,
  onChange,
  type = 'text',
  autoComplete,
  trailing,
}: {
  icon: typeof User;
  label: string;
  name: FieldName;
  value: string;
  error?: string;
  onChange: (field: FieldName, value: string) => void;
  type?: string;
  autoComplete: string;
  trailing?: ReactNode;
}) {
  return (
    <label className="block text-sm font-bold text-[#344054]">
      {label}
      <span className="relative mt-2 block">
        <Icon className="pointer-events-none absolute left-4 top-4 size-5 text-[#98A2B3]" />
        <input
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          autoComplete={autoComplete}
          disabled={false}
          aria-invalid={!!error}
          className={input}
        />
        {trailing && <span className="absolute right-1 top-1">{trailing}</span>}
      </span>
      <span className="block min-h-6 pt-1 font-normal text-[#B42318]">
        {error}
      </span>
    </label>
  );
}

'use client';

/* eslint-disable next/no-html-link-for-pages */

import {
  useRef,
  useState,
  useSyncExternalStore,
  type SubmitEvent,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from 'framer-motion';

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

import { ToyVisual } from '@/components/toyverse/shared';
import { createClient } from '@/lib/supabase/client';

const focus =
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#6D4AFF]/30';

const subscribeToReady = () => () => {};

const input =
  'h-[52px] w-full rounded-xl border border-[#D9E2F0] bg-white pl-11 pr-4 text-base text-[#101828] outline-none transition duration-200 placeholder:text-[#98A2B3] focus:border-[#6D4AFF] focus:ring-3 focus:ring-[#6D4AFF]/15 aria-invalid:border-[#D92D20]';

function AuthVisualPanel() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="hidden min-w-0 flex-col justify-center bg-gradient-to-br from-[#F2EFFF] to-[#EDF6FF] px-8 py-10 lg:flex lg:px-12"
    >
      <div className="flex items-center gap-2 text-sm font-bold text-[#6D4AFF]">
        <Sparkles className="size-5" />A little joy, every day
      </div>

      <h2 className="mt-4 max-w-md text-4xl font-black leading-tight text-[#101828]">
        Welcome Back To ToyVerse
      </h2>

      <p className="mt-4 max-w-md leading-7 text-[#667085]">
        Sign in to continue exploring joyful, safe and exciting toys for every
        little explorer.
      </p>

      <div className="my-7">
        <ToyVisual compact />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        {[
          { text: 'Safe Shopping', icon: ShieldCheck },
          { text: 'Easy Orders', icon: PackageCheck },
          { text: 'Secure Payments', icon: LockKeyhole },
        ].map(({ text, icon: Icon }, index) => (
          <motion.div
            key={text}
            animate={reducedMotion ? {} : { y: [0, -3, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: index * 0.5,
              ease: 'easeInOut',
            }}
            className="flex min-h-16 items-center justify-center gap-2 rounded-xl border border-white bg-white/85 px-3 py-4 text-xs font-bold text-[#475467] shadow-sm"
          >
            <Icon className="size-4 shrink-0 text-[#6D4AFF]" />
            {text}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();

  const ready = useSyncExternalStore(
    subscribeToReady,
    () => true,
    () => false,
  );

  const [pending, setPending] = useState<'email' | 'google' | null>(null);

  const submitting = useRef(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [visible, setVisible] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [notice, setNotice] = useState<{
    text: string;
    success: boolean;
  } | null>(initialError ? { text: initialError, success: false } : null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  /*
   * REAL SUPABASE EMAIL LOGIN
   */
  async function loginWithEmail() {
    if (submitting.current) return;

    submitting.current = true;
    setPending('email');
    setNotice(null);
    setErrors({});

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setNotice({
          text:
            error.message === 'Invalid login credentials'
              ? 'Incorrect email or password. Please try again.'
              : error.message,
          success: false,
        });

        return;
      }

      if (!data.user) {
        setNotice({
          text: 'Unable to sign in. Please try again.',
          success: false,
        });

        return;
      }

      setNotice({
        text: 'Login successful. Welcome to ToyVerse!',
        success: true,
      });

      /*
       * Password is NOT stored anywhere.
       * Supabase manages the real authentication session.
       */

      window.setTimeout(() => {
        router.replace('/');
        router.refresh();
      }, 600);
    } catch (error) {
      console.error('Login error:', error);

      setNotice({
        text: 'Something went wrong while signing in. Please try again.',
        success: false,
      });
    } finally {
      submitting.current = false;
      setPending(null);
    }
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting.current) return;

    const next: {
      email?: string;
      password?: string;
    } = {};

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      next.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      next.email = 'Please enter a valid email address.';
    }

    if (!password) {
      next.password = 'Please enter your password.';
    } else if (password.length < 6) {
      next.password = 'Password must contain at least 6 characters.';
    }

    setErrors(next);

    if (Object.keys(next).length) {
      setNotice(null);

      if (next.email) {
        emailRef.current?.focus();
      } else {
        passwordRef.current?.focus();
      }

      return;
    }

    void loginWithEmail();
  }

  async function loginWithGoogle() {
    if (submitting.current) return;
    submitting.current = true;
    setPending('google');
    setNotice(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setNotice({ text: 'Unable to start Google sign-in.', success: false });
        submitting.current = false;
        setPending(null);
      }
    } catch (error) {
      console.error('Google login error:', error);
      setNotice({ text: 'Unable to start Google sign-in.', success: false });
      submitting.current = false;
      setPending(null);
    }
  }

  function error(field: keyof typeof errors) {
    return (
      <div className="min-h-6 pt-1" aria-live="polite">
        <AnimatePresence initial={false}>
          {errors[field] && (
            <motion.p
              id={`${field}-error`}
              key={field}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-[#B42318]"
            >
              {errors[field]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-labelledby="login-heading"
      className="flex min-w-0 flex-col justify-center bg-white px-5 py-8 sm:px-10 sm:py-12 lg:px-12"
    >
      <p className="text-sm font-bold text-[#6D4AFF]">Customer Login</p>

      <h1
        id="login-heading"
        className="mt-3 text-3xl font-black text-[#101828]"
      >
        Welcome Back
      </h1>

      <p className="mt-3 leading-7 text-[#667085]">
        Sign in to continue to your ToyVerse account.
      </p>

      <p className="mt-3 text-xs leading-5 text-[#667085]">
        Sign in securely using your registered email address and password.
      </p>

      <form noValidate onSubmit={submit} className="mt-7">
        {/* EMAIL */}

        <label
          htmlFor="login-email"
          className="text-sm font-bold text-[#344054]"
        >
          Email Address
        </label>

        <div className="group relative mt-2">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-4 size-5 text-[#98A2B3] transition group-focus-within:text-[#6D4AFF]"
          />

          <input
            ref={emailRef}
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            readOnly={pending !== null}
            onChange={(event) => {
              setEmail(event.target.value);

              setErrors((current) => ({
                ...current,
                email: undefined,
              }));

              setNotice(null);
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={input}
          />
        </div>

        {error('email')}

        {/* PASSWORD */}

        <div className="mt-3">
          <label
            htmlFor="login-password"
            className="text-sm font-bold text-[#344054]"
          >
            Password
          </label>

          <div className="group relative mt-2">
            <LockKeyhole
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-4 size-5 text-[#98A2B3] transition group-focus-within:text-[#6D4AFF]"
            />

            <input
              ref={passwordRef}
              id="login-password"
              name="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              required
              minLength={6}
              placeholder="Enter your password"
              value={password}
              readOnly={pending !== null}
              onChange={(event) => {
                setPassword(event.target.value);

                setErrors((current) => ({
                  ...current,
                  password: undefined,
                }));

                setNotice(null);
              }}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`${input} pr-14`}
            />

            <button
              type="button"
              aria-label={visible ? 'Hide password' : 'Show password'}
              aria-pressed={visible}
              onClick={() => setVisible(!visible)}
              className={`absolute right-1 top-1 grid size-11 place-items-center rounded-lg text-[#667085] transition hover:bg-[#F2EFFF] hover:text-[#6D4AFF] ${focus}`}
            >
              {visible ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>

          {error('password')}
        </div>

        {/* REMEMBER + FORGOT PASSWORD */}

        <div className="my-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[#475467]">
            <input
              type="checkbox"
              name="rememberMe"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className={`size-4 accent-[#6D4AFF] ${focus}`}
            />
            Remember me
          </label>

          <button
            type="button"
            disabled={pending !== null}
            onClick={() =>
              setNotice({
                text: 'Password recovery will be connected with Supabase Auth later.',
                success: false,
              })
            }
            className={`min-h-11 rounded-lg font-semibold text-[#6D4AFF] hover:text-[#247BFE] ${focus}`}
          >
            Forgot Password?
          </button>
        </div>

        {/* SIGN IN */}

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={!ready || pending !== null}
          aria-busy={pending === 'email'}
          className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D4AFF] to-[#247BFE] font-bold text-white shadow-sm transition-shadow duration-200 hover:shadow-lg hover:shadow-[#6D4AFF]/25 disabled:cursor-not-allowed disabled:opacity-70 ${focus}`}
        >
          {pending === 'email' ? 'Signing In...' : 'Sign In'}

          <ArrowRight className="size-5" />
        </motion.button>
      </form>

      {/* DIVIDER */}

      <div className="my-6 flex items-center gap-4 text-xs text-[#667085]">
        <span className="h-px flex-1 bg-[#E6EAF2]" />
        or continue with
        <span className="h-px flex-1 bg-[#E6EAF2]" />
      </div>

      {/* GOOGLE LOGIN */}

      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        disabled={!ready || pending !== null}
        aria-busy={pending === 'google'}
        onClick={() => void loginWithGoogle()}
        className={`flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-[#D9E2F0] bg-white px-3 font-semibold text-[#344054] transition hover:border-[#6D4AFF]/35 hover:bg-[#F8FAFC] hover:shadow-sm ${focus}`}
      >
        <span aria-hidden="true" className="text-xl font-bold text-[#247BFE]">
          G
        </span>
        {pending === 'google'
          ? 'Connecting to Google...'
          : 'Continue with Google'}
      </motion.button>

      {/* CREATE ACCOUNT */}

      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 text-sm text-[#667085]">
        New to ToyVerse?
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => router.push('/register')}
          className={`min-h-11 rounded-lg font-bold text-[#6D4AFF] hover:text-[#247BFE] ${focus}`}
        >
          Create an account
        </button>
      </p>

      {/* NOTICE */}

      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          {notice && (
            <motion.div
              key={notice.text}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${
                notice.success
                  ? 'border-[#ABEFC6] bg-[#ECFDF5] text-[#067647]'
                  : 'border-[#D9E2F0] bg-[#EDF6FF] text-[#344054]'
              }`}
            >
              {notice.success ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              ) : (
                <Info className="mt-0.5 size-5 shrink-0 text-[#247BFE]" />
              )}

              <span className="flex-1">{notice.text}</span>

              <button
                type="button"
                aria-label="Dismiss notification"
                disabled={pending !== null}
                onClick={() => setNotice(null)}
                className={`grid size-8 shrink-0 place-items-center rounded-lg hover:bg-white/70 ${focus}`}
              >
                <X className="size-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

export function LoginPortal({ initialError }: { initialError?: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-[#F8FAFC] text-[#101828]">
        <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div
            aria-label="ToyVerse"
            className="flex min-h-11 items-center gap-2 rounded-xl"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6D4AFF] to-[#247BFE] text-white shadow-md">
              <Sparkles className="size-5" />
            </span>

            <strong className="text-xl font-extrabold">ToyVerse</strong>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:py-6"
        >
          <div className="grid overflow-hidden rounded-[24px] border border-[#E6EAF2] bg-white shadow-[0_12px_45px_rgb(16_24_40/6%)] transition-shadow duration-300 hover:shadow-[0_16px_55px_rgb(16_24_40/8%)] lg:grid-cols-2">
            <AuthVisualPanel />

            <LoginForm initialError={initialError} />
          </div>
        </motion.div>
      </main>
    </MotionConfig>
  );
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { User as SupabaseUser } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client';

type CustomerUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  role: 'customer' | 'admin';
  emailEditable: boolean;
};

type UpdateProfileInput = {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
};

type CustomerAuthContextType = {
  user: CustomerUser | null;

  ready: boolean;
  isLoggedIn: boolean;
  loginPending: boolean;

  refreshUser: () => Promise<void>;

  updateProfile: (values: UpdateProfileInput) => Promise<{
    success: boolean;
    message: string;
  }>;

  updateEmail: (email: string) => Promise<{
    success: boolean;
    pendingVerification: boolean;
    message: string;
  }>;

  logout: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

function getEmail(authUser: SupabaseUser) {
  return authUser.email ?? '';
}

function canEditEmail(authUser: SupabaseUser) {
  const providers = Array.isArray(authUser.app_metadata?.providers)
    ? authUser.app_metadata.providers
    : [authUser.app_metadata?.provider].filter(Boolean);

  return providers.includes('email');
}

function getFallbackName(authUser: SupabaseUser) {
  const metadata = authUser.user_metadata;

  if (typeof metadata?.full_name === 'string') {
    return metadata.full_name;
  }

  if (typeof metadata?.name === 'string') {
    return metadata.name;
  }

  const email = getEmail(authUser);

  if (email.includes('@')) {
    return email.split('@')[0];
  }

  return 'ToyVerse Customer';
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<CustomerUser | null>(null);

  const [ready, setReady] = useState(false);

  const [loginPending, setLoginPending] = useState(true);

  const loadCustomer = useCallback(
    async (authUser: SupabaseUser | null) => {
      if (!authUser) {
        setUser(null);
        return;
      }

      const fallbackName = getFallbackName(authUser);
      const email = getEmail(authUser);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(
          `
            id,
            full_name,
            phone,
            avatar_url,
            role
          `,
        )
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Unable to load customer profile:', profileError.message);
      }

      /*
       * First login:
       * If Auth user exists but profiles row does not exist,
       * automatically create the customer profile.
       */
      if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            full_name: fallbackName,
            phone: '',
            avatar_url:
              typeof authUser.user_metadata?.avatar_url === 'string'
                ? authUser.user_metadata.avatar_url
                : '',
            role: 'customer',
          })
          .select(
            `
              id,
              full_name,
              phone,
              avatar_url,
              role
            `,
          )
          .single();

        if (insertError) {
          console.error(
            'Unable to create customer profile:',
            insertError.message,
          );

          /*
           * Auth is still valid even if profile creation fails.
           * Keep the customer logged in using Auth data.
           */
          setUser({
            id: authUser.id,
            email,
            fullName: fallbackName,
            phone: '',
            avatarUrl:
              typeof authUser.user_metadata?.avatar_url === 'string'
                ? authUser.user_metadata.avatar_url
                : '',
            role: 'customer',
            emailEditable: canEditEmail(authUser),
          });

          return;
        }

        setUser({
          id: authUser.id,
          email,
          fullName: newProfile.full_name || fallbackName,
          phone: newProfile.phone || '',
          avatarUrl: newProfile.avatar_url || '',
          role: newProfile.role === 'admin' ? 'admin' : 'customer',
          emailEditable: canEditEmail(authUser),
        });

        return;
      }

      setUser({
        id: authUser.id,
        email,
        fullName: profile.full_name || fallbackName,
        phone: profile.phone || '',
        avatarUrl: profile.avatar_url || '',
        role: profile.role === 'admin' ? 'admin' : 'customer',
        emailEditable: canEditEmail(authUser),
      });
    },
    [supabase],
  );

  /*
   * Load real Supabase authentication
   * when the application starts.
   */
  const refreshUser = useCallback(async () => {
    setLoginPending(true);

    try {
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Supabase getUser error:', error.message);

        setUser(null);
        return;
      }

      await loadCustomer(authUser);
    } catch (error) {
      console.error('Unable to restore customer session:', error);

      setUser(null);
    } finally {
      setReady(true);
      setLoginPending(false);
    }
  }, [loadCustomer, supabase]);

  useEffect(() => {
    let active = true;
    const authTimers = new Set<ReturnType<typeof setTimeout>>();

    async function initializeAuth() {
      setLoginPending(true);

      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!active) return;

        await loadCustomer(authUser);
      } catch (error) {
        console.error('Initial authentication error:', error);

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setReady(true);
          setLoginPending(false);
        }
      }
    }

    void initializeAuth();

    /*
     * Real-time Supabase authentication listener.
     *
     * SIGNED_IN
     * SIGNED_OUT
     * TOKEN_REFRESHED
     * USER_UPDATED
     *
     * are handled automatically.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase holds its auth lock while this callback runs. Defer profile
      // queries so subsequent browser-client operations cannot deadlock.
      const timer = setTimeout(() => {
        authTimers.delete(timer);
        if (!active) return;

        setLoginPending(true);
        void loadCustomer(session?.user ?? null).finally(() => {
          if (active) {
            setReady(true);
            setLoginPending(false);
          }
        });
      }, 0);
      authTimers.add(timer);
    });

    return () => {
      active = false;
      authTimers.forEach((timer) => clearTimeout(timer));
      authTimers.clear();
      subscription.unsubscribe();
    };
  }, [loadCustomer, supabase]);

  /*
   * Update customer profile in real Supabase database.
   */
  const updateProfile = useCallback(
    async (
      values: UpdateProfileInput,
    ): Promise<{
      success: boolean;
      message: string;
    }> => {
      if (!user) {
        return {
          success: false,
          message: 'You must be logged in.',
        };
      }

      const updates: {
        full_name?: string;
        phone?: string;
        avatar_url?: string;
        updated_at: string;
      } = {
        updated_at: new Date().toISOString(),
      };

      if (values.fullName !== undefined) {
        updates.full_name = values.fullName.trim();
      }

      if (values.phone !== undefined) {
        updates.phone = values.phone.trim();
      }

      if (values.avatarUrl !== undefined) {
        updates.avatar_url = values.avatarUrl.trim();
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select(
          `
            id,
            full_name,
            phone,
            avatar_url,
            role
          `,
        )
        .single();

      if (error) {
        console.error('Profile update error:', error.message);

        return {
          success: false,
          message: 'Unable to update profile. Please try again.',
        };
      }

      setUser((current) => {
        if (!current) return current;

        return {
          ...current,
          fullName: data.full_name || current.fullName,
          phone: data.phone || '',
          avatarUrl: data.avatar_url || '',
          role: data.role === 'admin' ? 'admin' : 'customer',
        };
      });

      return {
        success: true,
        message: 'Profile updated successfully.',
      };
    },
    [supabase, user],
  );

  const updateEmail = useCallback(
    async (email: string) => {
      const normalizedEmail = email.trim().toLowerCase();

      if (!user) {
        return {
          success: false,
          pendingVerification: false,
          message: 'You must be logged in.',
        };
      }

      if (!user.emailEditable) {
        return {
          success: false,
          pendingVerification: false,
          message: 'Your email is managed by your Google account.',
        };
      }

      if (normalizedEmail === user.email.trim().toLowerCase()) {
        return {
          success: true,
          pendingVerification: false,
          message: 'Profile updated successfully.',
        };
      }

      const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(
        /\/$/,
        '',
      );
      const siteUrl =
        configuredSiteUrl ||
        (typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost:3000');
      const { data, error } = await supabase.auth.updateUser(
        { email: normalizedEmail },
        { emailRedirectTo: `${siteUrl}/account/profile` },
      );

      if (error) {
        console.error('Auth email update error:', error.message);
        const duplicateEmail =
          /already (?:associated|been registered|registered)|already exists|email address is already/i.test(
            error.message,
          );

        return {
          success: false,
          pendingVerification: false,
          message: duplicateEmail
            ? 'This email address is already associated with another account.'
            : 'Unable to update your email. Please try again.',
        };
      }

      const activeEmail = data.user.email?.trim().toLowerCase() ?? '';
      if (activeEmail === normalizedEmail) {
        await loadCustomer(data.user);
        return {
          success: true,
          pendingVerification: false,
          message: 'Profile and email updated successfully.',
        };
      }

      return {
        success: true,
        pendingVerification: true,
        message:
          'Email update requested. Please check your new email address and follow the verification link to complete the change.',
      };
    },
    [loadCustomer, supabase, user],
  );

  /*
   * REAL SUPABASE LOGOUT
   */
  async function logout() {
    setLoginPending(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error.message);

        return;
      }

      setUser(null);

      /*
       * Old demo session is no longer required.
       * Remove it if it still exists from previous frontend testing.
       */
      if (typeof window !== 'undefined') {
        localStorage.removeItem('toyverse_demo_user');
      }
    } finally {
      setLoginPending(false);
    }
  }

  const value: CustomerAuthContextType = {
    user,
    ready,
    isLoggedIn: Boolean(user),
    loginPending,
    refreshUser,
    updateProfile,
    updateEmail,
    logout,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);

  if (!context) {
    throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  }

  return context;
}

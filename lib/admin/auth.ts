import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') return null;
  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile.full_name ?? 'Admin',
  };
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.role !== 'admin') redirect('/');

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile.full_name ?? 'Admin',
  };
}

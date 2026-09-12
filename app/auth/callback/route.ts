import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=oauth_callback', url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('Google OAuth callback failed:', error?.message);
    return NextResponse.redirect(new URL('/login?error=oauth_callback', url));
  }

  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Unable to check Google profile:', profileError.message);
  } else if (!existingProfile) {
    const metadata = data.user.user_metadata;
    const fallbackName = data.user.email?.split('@')[0] || 'ToyVerse Customer';
    const { error: insertError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name:
        typeof metadata?.full_name === 'string'
          ? metadata.full_name
          : typeof metadata?.name === 'string'
            ? metadata.name
            : fallbackName,
      phone: '',
      avatar_url:
        typeof metadata?.avatar_url === 'string' ? metadata.avatar_url : '',
      role: 'customer',
    });

    if (insertError) {
      console.error('Unable to create Google profile:', insertError.message);
    }
  }

  return NextResponse.redirect(new URL('/', url));
}

import { LoginPortal } from '@/components/auth/LoginPortal';

export const metadata = { title: 'Customer Login | ToyVerse' };

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <LoginPortal
      initialError={
        error
          ? 'Google sign-in could not be completed. Please try again.'
          : undefined
      }
    />
  );
}

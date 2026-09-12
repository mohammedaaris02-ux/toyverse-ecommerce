import { AdminShell } from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return <AdminShell userName={user.fullName}>{children}</AdminShell>;
}

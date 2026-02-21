// Force dynamic rendering for auth pages — they require Supabase client
// which is not available during static generation
export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

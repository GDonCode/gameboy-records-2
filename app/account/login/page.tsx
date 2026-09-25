// app/account/login/page.tsx
import AuthForm from '@/components/AuthForm';

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;

  return <AuthForm initialMode={mode === 'register' ? 'register' : 'signin'} />;
}
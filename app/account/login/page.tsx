// app/account/login/page.tsx
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import AuthForm from '@/components/AuthForm';
import Footer from '@/components/Footer';

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;

  return (
    <>
      <style>{`
        .no-scrollbar { scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <MobileBottomNav />

        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1 overflow-hidden bg-[#1a2b1e]">
            <div className="absolute inset-0 flex overflow-hidden">
              <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto flex flex-col pt-[60px] md:pt-0">
                <AuthForm initialMode={mode === 'register' ? 'register' : 'signin'} />
                <Footer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
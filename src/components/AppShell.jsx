import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import WhatsAppFab from './WhatsAppFab';

export default function AppShell() {
  return (
    <div className="mx-auto min-h-[100dvh] min-h-screen w-full max-w-[768px] bg-[#0e0e0e] pb-28 text-zinc-100 shadow-2xl shadow-black/25">
      <Outlet />
      <WhatsAppFab />
      <BottomNav />
    </div>
  );
}

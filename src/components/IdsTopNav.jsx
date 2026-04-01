import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import WalletModal from './WalletModal';

export default function IdsTopNav() {
  const { user, refreshUser } = useAuth();
  const [depositOpen, setDepositOpen] = useState(false);
  const bal = Number(user?.walletBalance ?? 0).toLocaleString('en-IN');

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#141414] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="leading-tight">
            <span className="text-lg font-black tracking-wide text-amber-400">MAHADEV</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{bal} Bal</span>
            <button
              type="button"
              onClick={() => setDepositOpen(true)}
              className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black shadow hover:bg-zinc-200"
            >
              Deposit
            </button>
          </div>
        </div>
      </header>
      {depositOpen && (
        <WalletModal type="deposit" onClose={() => setDepositOpen(false)} onSuccess={refreshUser} />
      )}
    </>
  );
}

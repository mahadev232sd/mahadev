import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import WalletModal from './WalletModal';
import ResetGamePasswordModal from './ResetGamePasswordModal';

export default function ActiveIdRow({ platform, gameId, onRefresh }) {
  const [wallet, setWallet] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#1a1a1a] px-3 py-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-amber-400">
          {platform.name.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={platform.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-accent-blue hover:underline"
          >
            <span className="truncate">{platform.url}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </a>
          <p className="mt-0.5 truncate font-mono text-sm text-white">{gameId.uniqueId}</p>
          <p className="truncate text-xs text-zinc-500">{platform.name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setWallet({ type: 'deposit' })}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow hover:brightness-110"
            title="Deposit"
          >
            D
          </button>
          <button
            type="button"
            onClick={() => setWallet({ type: 'withdraw' })}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow hover:brightness-110"
            title="Withdraw"
          >
            W
          </button>
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue text-xs font-bold text-white shadow hover:brightness-110"
            title="Reset password"
          >
            P
          </button>
        </div>
      </div>

      {wallet && (
        <WalletModal
          type={wallet.type}
          gameId={gameId._id}
          onClose={() => setWallet(null)}
          onSuccess={() => onRefresh?.()}
        />
      )}
      {resetOpen && (
        <ResetGamePasswordModal
          gameId={gameId}
          displayId={gameId.uniqueId}
          onClose={() => setResetOpen(false)}
          onSaved={onRefresh}
        />
      )}
    </>
  );
}

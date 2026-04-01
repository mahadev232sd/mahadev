import { useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, ExternalLink } from 'lucide-react';
import ResetGamePasswordModal from './ResetGamePasswordModal';

function effAppr(g) {
  if (!g) return null;
  return g.approvalStatus || 'approved';
}

function CopyRow({ label, value, masked }) {
  const copy = () => {
    if (!value || masked) return;
    navigator.clipboard.writeText(value);
    toast.success('Copied');
  };
  return (
    <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 py-2 text-sm last:border-0">
      <span className="shrink-0 text-zinc-500">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-mono text-zinc-100">{masked ? '••••••••' : value}</span>
        {!masked && value && (
          <button type="button" onClick={copy} className="shrink-0 text-zinc-400 hover:text-white">
            <Copy className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function GameIdCard({ platform, gameId, onRefresh, onCreate, onOpenWallet }) {
  const [resetOpen, setResetOpen] = useState(false);

  const appr = effAppr(gameId);
  const created = !!gameId;
  const pending = created && appr === 'pending';
  const rejected = created && appr === 'rejected';
  const active = created && appr === 'approved' && gameId.status === 'active';
  const inactiveApproved = created && appr === 'approved' && gameId.status === 'inactive';

  let badgeClass = 'bg-zinc-700 text-zinc-400';
  let badgeText = 'Not Created';
  if (pending) {
    badgeClass = 'bg-amber-500/25 text-amber-300';
    badgeText = 'Pending';
  } else if (rejected) {
    badgeClass = 'bg-red-500/20 text-red-400';
    badgeText = 'Rejected';
  } else if (created && appr === 'approved') {
    badgeClass = active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400';
    badgeText = active ? 'Active' : 'Inactive';
  }

  const maskCreds = !created || pending || rejected || inactiveApproved;

  return (
    <div className="rounded-2xl border border-zinc-800/90 bg-surface-elevated/80 p-4 shadow-card backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-accent-yellow">
          {platform.name.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{platform.name}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
          {badgeText}
        </span>
      </div>

      {pending && (
        <p className="mb-2 rounded-lg bg-amber-500/10 px-2 py-1.5 text-xs text-amber-200/90">
          Username: <strong>{gameId.username || '—'}</strong> — ID & password after admin approval.
        </p>
      )}
      {inactiveApproved && (
        <p className="mb-2 rounded-lg border border-zinc-600/60 bg-zinc-800/50 px-2 py-1.5 text-xs text-zinc-400">
          This ID is inactive. Gaming ID, username, and password are hidden. Contact support if needed.
        </p>
      )}

      <CopyRow label="ID" value={maskCreds ? '' : gameId?.uniqueId} masked={maskCreds} />
      <CopyRow label="Username" value={maskCreds ? '' : gameId?.username} masked={maskCreds} />
      <CopyRow label="Password" value={maskCreds ? '' : gameId?.password} masked={maskCreds} />
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 py-2 text-sm last:border-0">
        <span className="text-zinc-500">Platform</span>
        <a
          href={platform.url}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-1 truncate text-accent-blue hover:underline"
        >
          <span className="truncate">{platform.url}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!active}
          onClick={() => active && onOpenWallet?.({ type: 'deposit', gameId: gameId._id })}
          className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img src="/arrowup.svg" alt="" className="h-4 w-4 object-contain" /> Deposit
        </button>
        <button
          type="button"
          disabled={!active}
          onClick={() => active && onOpenWallet?.({ type: 'withdraw', gameId: gameId._id })}
          className="flex items-center justify-center gap-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img src="/arrowdown.svg" alt="" className="h-4 w-4 object-contain" /> Withdraw
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          if (pending) return;
          if (!created || rejected) onCreate?.(platform);
          else if (active) setResetOpen(true);
        }}
        disabled={
          pending ||
          (created && !rejected && !active) ||
          ((!created || rejected) && !onCreate)
        }
        className="mt-2 w-full rounded-xl bg-accent-blue py-2.5 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending
          ? 'Pending approval'
          : !created || rejected
            ? 'Create Your ID'
            : active
              ? 'Reset Password'
              : 'Inactive'}
      </button>

      {resetOpen && active && (
        <ResetGamePasswordModal
          gameId={gameId}
          displayId={gameId.uniqueId}
          onClose={() => setResetOpen(false)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}

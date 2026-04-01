import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  MapPin,
  Phone,
  User,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WalletModal from '../components/WalletModal';

const tileAccents = {
  sky: {
    ring: 'shadow-[0_0_24px_-8px_rgba(56,189,248,0.45)]',
    icon: 'bg-gradient-to-br from-sky-500/35 to-blue-600/20 text-sky-200 shadow-inner ring-1 ring-sky-400/30',
  },
  violet: {
    ring: 'shadow-[0_0_24px_-8px_rgba(167,139,250,0.4)]',
    icon: 'bg-gradient-to-br from-violet-500/35 to-indigo-600/25 text-violet-200 shadow-inner ring-1 ring-violet-400/25',
  },
  amber: {
    ring: 'shadow-[0_0_24px_-8px_rgba(251,191,36,0.35)]',
    icon: 'bg-gradient-to-br from-amber-500/35 to-orange-600/20 text-amber-100 shadow-inner ring-1 ring-amber-400/30',
  },
  emerald: {
    ring: 'shadow-[0_0_24px_-8px_rgba(52,211,153,0.45)]',
    icon: 'bg-gradient-to-br from-emerald-500/40 to-teal-700/25 text-emerald-200 shadow-inner ring-1 ring-emerald-400/35',
  },
  rose: {
    ring: 'shadow-[0_0_24px_-8px_rgba(251,113,133,0.35)]',
    icon: 'bg-gradient-to-br from-rose-500/30 to-pink-900/30 text-rose-100 shadow-inner ring-1 ring-rose-400/25',
  },
  cyan: {
    ring: 'shadow-[0_0_24px_-8px_rgba(34,211,238,0.4)]',
    icon: 'bg-gradient-to-br from-cyan-500/35 to-sky-700/25 text-cyan-100 shadow-inner ring-1 ring-cyan-400/30',
  },
};

function InfoTile({ icon: Icon, label, value, valueClassName = '', accent = 'sky' }) {
  const a = tileAccents[accent] || tileAccents.sky;
  return (
    <div
      className={`flex min-h-[4.75rem] items-center gap-3 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-800/60 via-zinc-900/70 to-black/40 px-3 py-2.5 backdrop-blur-sm ${a.ring}`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${a.icon}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</p>
        <p className={`mt-0.5 truncate text-sm font-semibold text-zinc-50 ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [walletModal, setWalletModal] = useState(null);

  const shortName = useMemo(() => {
    const n = (user?.name || '').trim();
    if (!n) return 'User';
    return n.split(/\s+/)[0];
  }, [user?.name]);

  const initial = useMemo(() => {
    const n = (user?.name || '?').trim();
    return n.slice(0, 1).toUpperCase();
  }, [user?.name]);

  const bal = Number(user?.walletBalance ?? 0).toLocaleString('en-IN');
  const memberSince = useMemo(() => {
    if (!user?.createdAt) return '—';
    const d = new Date(user.createdAt);
    return d.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  }, [user?.createdAt]);

  const branchRaw = (user?.branch || '').trim();
  const branch =
    !branchRaw || branchRaw.toLowerCase() === 'drplay' ? 'Mahadev' : branchRaw;
  const city = (user?.city || '').trim() || '—';
  const phone = (user?.phone || '').trim() || '—';

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#050508] pb-4 pt-4">
      {/* soft color wash */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(59,130,246,0.14),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_100%_80%,rgba(16,185,129,0.08),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_0%_90%,rgba(244,63,94,0.06),transparent_45%)]"
        aria-hidden
      />

      <div className="relative mx-3 space-y-4 px-0.5">
        {/* Header card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800/70 via-[#16161f] to-zinc-950/90 p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-xl font-bold text-white shadow-[0_8px_28px_-4px_rgba(59,130,246,0.55)] ring-2 ring-sky-400/40"
                aria-hidden
              >
                {initial}
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="truncate text-lg font-bold tracking-tight text-white drop-shadow-sm">{shortName}</p>
                <span className="mt-1.5 inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_4px_14px_-2px_rgba(16,185,129,0.55)]">
                  Active
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="shrink-0 rounded-xl bg-gradient-to-br from-[#3498db] to-[#2563b8] px-4 py-2 text-xs font-bold text-white shadow-[0_6px_22px_-4px_rgba(52,152,219,0.55)] ring-1 ring-sky-300/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              Logout
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWalletModal('deposit')}
              className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 py-3.5 text-center text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(16,185,129,0.55)] ring-1 ring-emerald-300/25 transition hover:brightness-110 active:scale-[0.99]"
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setWalletModal('withdraw')}
              className="rounded-xl bg-gradient-to-br from-rose-500 to-red-700 py-3.5 text-center text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(244,63,94,0.45)] ring-1 ring-rose-300/25 transition hover:brightness-110 active:scale-[0.99]"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoTile icon={User} label="Full Name" value={user?.name || '—'} accent="sky" />
          <InfoTile icon={Building2} label="Branch" value={branch} accent="violet" />
          <InfoTile icon={Phone} label="Phone" value={phone} accent="amber" />
          <InfoTile icon={Wallet} label="Balance" value={`₹${bal}`} valueClassName="text-emerald-300" accent="emerald" />
          <InfoTile icon={MapPin} label="City" value={city} accent="rose" />
          <InfoTile icon={Calendar} label="Member Since" value={memberSince} accent="cyan" />
        </div>
      </div>

      {walletModal && (
        <WalletModal
          type={walletModal}
          onClose={() => setWalletModal(null)}
          onSuccess={refreshUser}
        />
      )}
    </div>
  );
}

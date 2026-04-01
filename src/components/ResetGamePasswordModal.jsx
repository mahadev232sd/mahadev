import { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, X } from 'lucide-react';
import api from '../api/client';

export function isStrongGamePassword(p) {
  const v = String(p || '');
  if (v.length < 8) return false;
  if (!/[a-z]/.test(v)) return false;
  if (!/[A-Z]/.test(v)) return false;
  if (!/\d/.test(v)) return false;
  if (!/[^A-Za-z0-9]/.test(v)) return false;
  return true;
}

export default function ResetGamePasswordModal({ gameId, displayId, onClose, onSaved }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = isStrongGamePassword(password);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) {
      toast.error('Password does not meet requirements');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.patch(`/game-ids/${gameId._id}/password`, {
        newPassword: password,
      });
      toast.success('Password updated');
      onSaved?.(data.gameId);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const idLabel = displayId || gameId.uniqueId || gameId._id;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reset Password</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              ID: <span className="font-mono text-slate-700">{idLabel}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">New Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Example@1256"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-3 pr-11 text-slate-900 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Must contain 8+ characters with 1 uppercase, 1 lowercase, 1 number, 1 special character.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !valid}
              className="flex-1 rounded-xl bg-[#1e5eff] py-3 text-sm font-bold text-white hover:bg-[#184dcc] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? 'Please wait…' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

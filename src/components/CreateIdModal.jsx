import { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import api from '../api/client';

const USERNAME_RE = /^[a-zA-Z0-9]{1,6}$/;

export default function CreateIdModal({ platform, onClose, onCreated }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    if (!USERNAME_RE.test(u)) {
      toast.error('Username: letters & numbers only, max 6');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/game-ids', { platformName: platform.name, username: u });
      toast.success('Request submitted. Admin will approve shortly.');
      onCreated?.(data.gameId);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-3 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New ID</h2>
            <p className="text-sm text-slate-500">Game: {platform.name}</p>
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
        <form onSubmit={submit} className="space-y-4 px-4 py-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').slice(0, 6))}
              placeholder="Enter username"
              maxLength={6}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
              required
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-500">
              Letters & numbers only, max 6. Gaming ID and password are set after admin approval.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#1e3a5f] py-3 text-sm font-bold text-white hover:bg-[#152a45] disabled:opacity-50"
            >
              {loading ? 'Please wait…' : 'Create ID'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex sm:w-28 rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Filter, Wallet, X } from 'lucide-react';
import api from '../api/client';
import IdsTopNav from '../components/IdsTopNav';
import AnnouncementBar from '../components/AnnouncementBar';

const statusClass = {
  pending: 'bg-amber-500/25 text-amber-300',
  approved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
};

function statusLabel(status) {
  if (status === 'pending') return 'pending';
  if (status === 'approved') return 'successful';
  return status;
}

export default function Passbook() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    minAmount: '',
    maxAmount: '',
  });
  const [draft, setDraft] = useState(filters);

  const load = useCallback(async () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    if (filters.minAmount !== '') params.minAmount = filters.minAmount;
    if (filters.maxAmount !== '') params.maxAmount = filters.maxAmount;
    const r = await api.get('/transactions', { params });
    setTransactions(r.data.transactions || []);
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    load()
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [load]);

  const openFilters = () => {
    setDraft(filters);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setFilters(draft);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    const empty = { status: '', type: '', minAmount: '', maxAmount: '' };
    setDraft(empty);
    setFilters(empty);
    setFilterOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0e0e0e] pb-4">
      <IdsTopNav />
      <AnnouncementBar className="mt-1" />

      <div className="mx-3 mt-3 px-1">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Passbook</h1>
          <button
            type="button"
            onClick={openFilters}
            className="rounded-lg border border-zinc-700 bg-zinc-900/60 p-2 text-zinc-400 hover:bg-zinc-800"
            aria-label="Filter"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="py-12 text-center text-zinc-500">No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {transactions.map((tx) => (
              <li
                key={tx._id}
                className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-surface-card p-4 shadow-card"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    tx.type === 'deposit' ? 'bg-emerald-600/30 text-emerald-400' : 'bg-red-600/30 text-red-400'
                  }`}
                >
                  <Wallet className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold capitalize text-white">{tx.type}</p>
                  <p className="text-xs text-zinc-500">
                    Tra_ID: #{String(tx._id).slice(-6)} •{' '}
                    {new Date(tx.createdAt).toLocaleString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusClass[tx.status]}`}
                  >
                    {statusLabel(tx.status)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-lg font-bold text-slate-900">Apply Filters</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Successful</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Type</label>
                <select
                  value={draft.type}
                  onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                >
                  <option value="">All Types</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdraw">Withdraw</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Amount (Min)</label>
                  <input
                    type="number"
                    min={0}
                    value={draft.minAmount}
                    onChange={(e) => setDraft((d) => ({ ...d, minAmount: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-slate-900"
                    placeholder="Min"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Amount (Max)</label>
                  <input
                    type="number"
                    min={0}
                    value={draft.maxAmount}
                    onChange={(e) => setDraft((d) => ({ ...d, maxAmount: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-slate-900"
                    placeholder="Max"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="flex-1 rounded-xl bg-[#1e3a5f] py-2.5 text-sm font-bold text-white"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800"
                >
                  clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

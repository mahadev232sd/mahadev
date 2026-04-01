import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AddBankModal from './AddBankModal';
import DepositFlowModal from './DepositFlowModal';

const MIN_WITHDRAW = 200;

function maskAccountTail(num) {
  const s = String(num || '').replace(/\s/g, '');
  if (s.length <= 4) return s || '—';
  return `····${s.slice(-4)}`;
}

export default function WalletModal({ type, gameId, onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const [withdrawMethod, setWithdrawMethod] = useState('mahadev');
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [addBankOpen, setAddBankOpen] = useState(false);

  const endpoint = '/wallet/withdraw-request';

  const bal = Number(user?.walletBalance ?? 0).toLocaleString('en-IN');
  const balNum = Number(user?.walletBalance ?? 0);

  const loadBanks = useCallback(() => {
    setBanksLoading(true);
    api
      .get('/bank-accounts')
      .then((r) => {
        const list = r.data.bankAccounts || [];
        setBanks(list);
        setSelectedBankId((prev) => {
          if (prev && list.some((b) => b._id === prev)) return prev;
          return list[0]?._id || '';
        });
      })
      .catch(() => toast.error('Could not load bank accounts'))
      .finally(() => setBanksLoading(false));
  }, []);

  useEffect(() => {
    if (type === 'withdraw') loadBanks();
  }, [type, loadBanks]);

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (type === 'withdraw') {
      if (n < MIN_WITHDRAW) {
        toast.error(`Minimum withdrawal is ₹${MIN_WITHDRAW}`);
        return;
      }
      if (withdrawMethod === 'instant_payout' && (n < 1000 || n > 10000)) {
        toast.error('Instant payout amount must be between ₹1000 and ₹10000');
        return;
      }
      if (!selectedBankId) {
        toast.error('Add a bank account to withdraw');
        return;
      }
      if (n > balNum) {
        toast.error('Insufficient balance');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        amount: n,
        paymentMethod: withdrawMethod,
        bankAccountId: selectedBankId,
        ...(gameId ? { gameId } : {}),
      };
      await api.post(endpoint, payload);
      toast.success('Withdrawal request submitted');
      await refreshUser();
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (type === 'deposit') {
    return <DepositFlowModal gameId={gameId} onClose={onClose} onSuccess={onSuccess} />;
  }

  const amountLabel =
    withdrawMethod === 'instant_payout'
      ? `Amount (₹1000 – ₹10000)`
      : `Amount (Minimum ₹${MIN_WITHDRAW})`;

  const amountPlaceholder =
    withdrawMethod === 'instant_payout' ? 'Enter amount (1000–10000)' : `Enter amount (min ${MIN_WITHDRAW})`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Request Transaction</h2>
                <p className="mt-1 text-sm text-slate-500">Submit transaction request</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="max-h-[min(78vh,640px)] space-y-4 overflow-y-auto px-5 pb-5 pt-4">
            <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-slate-700">
              <span className="text-slate-600">Available Balance: </span>
              <span className="font-bold text-slate-900">₹{bal}</span>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-800">{amountLabel}</label>
              <input
                type="number"
                min={withdrawMethod === 'instant_payout' ? 1000 : MIN_WITHDRAW}
                max={withdrawMethod === 'instant_payout' ? 10000 : undefined}
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                placeholder={amountPlaceholder}
                required
              />
              {withdrawMethod === 'instant_payout' && (
                <p className="mt-1 text-xs text-slate-500">Instant payout: only ₹1000–₹10000</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-800">Select Payment Method</p>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition hover:border-slate-300 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50/60">
                  <input
                    type="radio"
                    name="w-method"
                    checked={withdrawMethod === 'mahadev'}
                    onChange={() => setWithdrawMethod('mahadev')}
                    className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm font-semibold text-slate-800">Mahadev</span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 transition hover:border-slate-300 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50/60">
                  <input
                    type="radio"
                    name="w-method"
                    checked={withdrawMethod === 'instant_payout'}
                    onChange={() => setWithdrawMethod('instant_payout')}
                    className="mt-0.5 h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm font-semibold leading-snug text-slate-800">
                    INSTANT PAYOUT (₹1000–₹10000)
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <p className="mb-2 text-sm font-medium text-slate-800">Bank account</p>
              {banksLoading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : banks.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">No bank accounts found. Add your first bank account.</p>
                  <button
                    type="button"
                    onClick={() => setAddBankOpen(true)}
                    className="w-full rounded-xl bg-gradient-to-br from-[#3498db] to-[#2563b8] py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105"
                  >
                    Add Bank
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {banks.map((b) => (
                    <label
                      key={b._id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 has-[:checked]:border-teal-500 has-[:checked]:ring-1 has-[:checked]:ring-teal-500/30"
                    >
                      <input
                        type="radio"
                        name="bank-pick"
                        checked={selectedBankId === b._id}
                        onChange={() => setSelectedBankId(b._id)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="font-semibold text-slate-900">{b.bankName}</p>
                        <p className="text-xs text-slate-500">
                          {b.accountHolderName} · {maskAccountTail(b.accountNumber)}
                        </p>
                      </div>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAddBankOpen(true)}
                    className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm font-semibold text-accent-blue hover:bg-slate-100"
                  >
                    + Add another bank
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading || banks.length === 0 || !selectedBankId}
                className="flex-1 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Request Transaction'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {addBankOpen && (
        <AddBankModal
          onClose={() => setAddBankOpen(false)}
          onSaved={() => {
            loadBanks();
            setAddBankOpen(false);
          }}
        />
      )}
    </>
  );
}

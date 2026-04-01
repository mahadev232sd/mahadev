import { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import api from '../api/client';

export default function AddBankModal({ onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    upiId: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const t = {
      upiId: form.upiId.trim(),
      bankName: form.bankName.trim(),
      accountNumber: form.accountNumber.trim(),
      accountHolderName: form.accountHolderName.trim(),
      ifscCode: form.ifscCode.trim(),
    };
    if (!t.upiId || !t.bankName || !t.accountNumber || !t.accountHolderName || !t.ifscCode) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/bank-accounts', t);
      toast.success('Bank saved');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Add Bank Details</h2>
              <p className="mt-1 text-sm text-slate-500">Save your bank account for withdrawals</p>
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

        <form onSubmit={submit} className="space-y-3 px-5 pb-5 pt-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              UPI ID <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.upiId}
              onChange={set('upiId')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
              placeholder="Enter UPI ID"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.bankName}
              onChange={set('bankName')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
              placeholder="Enter bank name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.accountNumber}
              onChange={set('accountNumber')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
              placeholder="Enter account number"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.accountHolderName}
              onChange={set('accountHolderName')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
              placeholder="Enter account holder name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-800">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.ifscCode}
              onChange={set('ifscCode')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 uppercase text-slate-900 outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
              placeholder="ENTER IFSC CODE"
              maxLength={11}
              autoComplete="off"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-br from-[#3498db] to-[#2563b8] py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save Bank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

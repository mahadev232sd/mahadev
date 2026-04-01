import { useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import {
  X,
  Clock,
  Copy,
  Check,
  Upload,
  FileText,
  Download,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const MIN_DEPOSIT = 100;

function StepDot({ n, active, done }) {
  if (done) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
        <Check className="h-5 w-5" />
      </div>
    );
  }
  if (active) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3498db] text-sm font-bold text-white ring-2 ring-[#3498db]/40">
        {n}
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-sm font-semibold text-slate-500">
      {n}
    </div>
  );
}

function copyText(label, text) {
  navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied`),
    () => toast.error('Copy failed')
  );
}

function formatMmSs(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Receipt / success screen: our generated ref only (never the UTR the user types). */
function depositReceiptTxnId(tx) {
  if (!tx) return '';
  return String(tx.referenceCode || tx._id || '');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildReceiptHtml(tx, displayName) {
  const amt = Number(tx.amount).toFixed(2);
  const d = new Date(tx.updatedAt || tx.createdAt);
  const dateStr = d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const txnId = escapeHtml(depositReceiptTxnId(tx));
  const nameEsc = escapeHtml(displayName || '—');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt ${txnId}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:420px;margin:24px auto;padding:16px;background:#f8fafc;color:#1e293b}
.card{border:1px solid #bfdbfe;border-radius:16px;padding:20px;background:#fff}
h1{font-size:18px;color:#5b21b6;margin:0 0 4px}
.ref{color:#2563eb;font-size:14px}
.row{display:flex;justify-content:space-between;margin:12px 0;padding:12px;background:#f8fafc;border-radius:8px}
.amt{font-size:22px;font-weight:800;color:#5b21b6}
.note{background:#e0f2fe;padding:12px;border-radius:8px;font-size:13px;color:#0369a1}
.footer{margin-top:16px;font-size:12px;color:#64748b;text-align:center}
</style></head><body>
<div class="card">
<p style="margin:0 0 8px">📄 <strong>Request Receipt</strong></p>
<h1>Mahadev — Deposit</h1>
<p class="ref">Transaction #${txnId}</p>
<div class="row"><span>Amount</span><span class="amt">₹ ${amt}</span></div>
<p style="font-size:13px">📅 Date: ${dateStr}<br/>🕐 Time: ${timeStr}</p>
<p style="margin:0;font-size:13px">User: ${nameEsc}</p>
<p class="note"><strong>YOUR REQUEST IS UNDER REVIEW</strong><br/>We will notify you once it is processed.</p>
<p class="footer">Thank you. Keep this receipt for your records.</p>
</div>
</body></html>`;
}

const DEPOSIT_METHOD_VALUE = 'mahadev';

export default function DepositFlowModal({ gameId, onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [upiUri, setUpiUri] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [utr, setUtr] = useState('');
  const [file, setFile] = useState(null);

  const labels = ['Amount', 'QR', 'Verify', 'Success'];

  useEffect(() => {
    if (step !== 2 || !upiUri) return;
    let cancelled = false;
    QRCode.toDataURL(upiUri, { width: 240, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not build QR');
      });
    return () => {
      cancelled = true;
    };
  }, [step, upiUri]);

  useEffect(() => {
    if (step !== 2 || !expiresAt) return;
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setSecondsLeft(s);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [step, expiresAt]);

  const startDeposit = async (e) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n < MIN_DEPOSIT) {
      toast.error(`Minimum ₹${MIN_DEPOSIT}`);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/deposit-start', {
        amount: n,
        paymentMethod: DEPOSIT_METHOD_VALUE,
        ...(gameId ? { gameId } : {}),
      });
      setTx(data.transaction);
      setExpiresAt(data.expiresAt);
      setUpiUri(data.upiUri);
      setPaymentDetails(data.paymentDetails);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const submitVerify = async (e) => {
    e.preventDefault();
    if (!tx?._id) return;
    if (!utr.trim() || utr.replace(/\D/g, '').length < 8) {
      toast.error('Enter a valid UTR');
      return;
    }
    if (!file) {
      toast.error('Upload payment screenshot');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('utr', utr.trim());
      fd.append('proof', file);
      const { data } = await api.post(`/wallet/deposit-verify/${tx._id}`, fd);
      setTx(data.transaction);
      setStep(4);
      await refreshUser();
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Verify failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = useCallback(() => {
    if (!tx) return;
    const html = buildReceiptHtml(tx, user?.name);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileSlug =
      String(depositReceiptTxnId(tx)).replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 48) || 'receipt';
    a.download = `mahadev-deposit-receipt-${fileSlug}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  }, [tx, user?.name]);

  const bal = Number(user?.walletBalance ?? 0).toLocaleString('en-IN');

  const showStepper = step > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {step === 1 ? (
              <>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Request Transaction</h2>
                <p className="mt-1 text-sm text-slate-500">Submit transaction request</p>
              </>
            ) : (
              <>
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">Deposit</h2>
                <p className="truncate text-xs text-slate-500">Pay via UPI · Balance ₹{bal}</p>
              </>
            )}
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

        {showStepper && (
          <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-2 py-3">
            <div className="flex items-center justify-between gap-1 sm:gap-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex flex-1 flex-col items-center gap-1">
                  <StepDot n={n} active={step === n} done={step > n} />
                  <span
                    className={`hidden text-center text-[10px] font-medium sm:block ${
                      step >= n ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {labels[n - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {step === 1 && (
            <form onSubmit={startDeposit} className="space-y-4">
              <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-slate-700">
                <span className="text-slate-600">Available Balance: </span>
                <span className="font-bold text-slate-900">₹{bal}</span>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800">
                  Amount (Minimum ₹{MIN_DEPOSIT})
                </label>
                <input
                  type="number"
                  min={MIN_DEPOSIT}
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  placeholder={`Enter amount (min ${MIN_DEPOSIT})`}
                  required
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-800">Select Payment Method</p>
                <div className="flex items-center gap-3 rounded-xl border border-teal-500 bg-teal-50/60 px-4 py-3">
                  <span
                    className="flex h-4 w-4 shrink-0 rounded-full border-2 border-white bg-teal-600 shadow-[0_0_0_2px_rgb(20_184_166)]"
                    aria-hidden
                  />
                  <span className="text-sm font-semibold text-slate-800">Mahadev</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Next: scan our QR, pay the exact amount, then upload UTR & screenshot.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
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
          )}

          {step === 2 && paymentDetails && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Scan the QR Code</h3>
                <p className="text-sm text-slate-500">Scan the QR code below to make the payment</p>
              </div>
              <div className="rounded-xl bg-sky-50 px-4 py-3 text-center">
                <p className="text-xs text-slate-600">Amount</p>
                <p className="text-2xl font-bold text-[#2563eb]">
                  ₹{Number(tx?.amount || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-orange-600">
                <Clock className="h-4 w-4" />
                Time Left: {formatMmSs(secondsLeft)}
              </div>
              <div className="flex justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="UPI QR"
                    className="h-52 w-52 rounded-xl border-2 border-slate-200 bg-white p-2 sm:h-60 sm:w-60"
                  />
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-400">
                    Generating QR…
                  </div>
                )}
              </div>
              <div className="space-y-2 rounded-xl bg-sky-50 p-3 text-sm">
                {[
                  ['UPI ID', paymentDetails.upiId],
                  ['Account Number', paymentDetails.accountNumber],
                  ['IFSC Code', paymentDetails.ifsc],
                  ['Bank Name', paymentDetails.bankName],
                  ['Account Holder', paymentDetails.accountHolder],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-2 border-b border-sky-100/80 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="break-all font-semibold text-slate-900">{val}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(label, String(val))}
                      className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#2563eb] hover:underline"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <p className="font-semibold text-amber-950">Instructions</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  <li>Scan using your UPI app and pay the exact amount shown.</li>
                  <li>Tap Next after completing payment.</li>
                  <li>Keep UTR and screenshot ready for the next step.</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500"
              >
                Payment Complete – Next
              </button>
            </div>
          )}

          {step === 3 && tx && (
            <form onSubmit={submitVerify} className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Verify Payment</h3>
                  <p className="text-sm text-slate-500">Upload the UTR number and screenshot</p>
                </div>
              </div>
              <div className="rounded-xl bg-sky-50 px-3 py-2 text-center text-sm font-semibold text-[#2563eb]">
                Paid Amount: ₹{Number(tx.amount).toFixed(2)}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">UTR Number *</label>
                <input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\s/g, '').slice(0, 22))}
                  placeholder="Enter your UTR / reference number"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Payment Screenshot *</label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:bg-slate-100">
                  <Upload className="mb-2 h-8 w-8 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Upload the payment screenshot</span>
                  <span className="mt-1 text-xs text-slate-500">JPG, PNG, HEIC (max 50MB)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                {file && <p className="mt-1 text-xs text-slate-600">Selected: {file.name}</p>}
              </div>
              <button
                type="submit"
                disabled={loading || !utr.trim() || !file}
                className="w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Verify Payment'}
              </button>
            </form>
          )}

          {step === 4 && tx && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-indigo-950">Request Created!</h3>
              <p className="text-sm text-slate-600">Your request has been submitted successfully</p>
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-sky-50 to-white p-4 text-left shadow-inner">
                <p className="flex items-center gap-2 text-sm font-bold text-indigo-800">
                  <span className="text-lg">📄</span> Request Receipt
                </p>
                <p className="text-xs text-[#2563eb]">Transaction #{depositReceiptTxnId(tx)}</p>
                <div className="mt-3 flex justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-bold text-indigo-700">₹ {Number(tx.amount).toFixed(2)}</span>
                </div>
                <div className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                  <p>📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="mt-1">🕐 {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="mt-3 rounded-lg bg-sky-100 px-3 py-2 text-xs text-sky-900">
                  <strong>YOUR REQUEST IS UNDER REVIEW</strong>
                  <p className="mt-1 opacity-90">We will notify you once it is processed</p>
                </div>
                <p className="mt-3 text-center text-xs text-slate-500">Thank you! Keep this receipt.</p>
              </div>
              <button
                type="button"
                onClick={downloadReceipt}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b21b6] py-3 text-sm font-bold text-white hover:brightness-110"
              >
                <Download className="h-4 w-4" /> Download receipt
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

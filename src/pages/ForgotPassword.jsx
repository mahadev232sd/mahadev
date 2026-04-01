import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [useEmail, setUseEmail] = useState(true);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const requestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', useEmail ? { email } : { phone });
      toast.success(data.message || 'Check instructions');
      if (data.resetToken) setToken(data.resetToken);
      setStep(2);
    } catch {
      toast.error('Request failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { resetToken: token, newPassword });
      toast.success('Password updated. You can log in.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-8 text-center text-xl font-bold text-white">Forgot password</h1>
        {step === 1 && (
          <form onSubmit={requestToken} className="space-y-4 rounded-2xl border border-zinc-800 bg-surface-card p-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseEmail(true)}
                className={`flex-1 rounded-xl py-2 text-sm ${useEmail ? 'bg-zinc-700' : 'text-zinc-500'}`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setUseEmail(false)}
                className={`flex-1 rounded-xl py-2 text-sm ${!useEmail ? 'bg-zinc-700' : 'text-zinc-500'}`}
              >
                Phone
              </button>
            </div>
            {useEmail ? (
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-zinc-700 bg-surface px-4 py-3 text-white"
              />
            ) : (
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full rounded-xl border border-zinc-700 bg-surface px-4 py-3 text-white"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent-blue py-3 font-semibold text-white"
            >
              {loading ? '…' : 'Send reset'}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={reset} className="space-y-4 rounded-2xl border border-zinc-800 bg-surface-card p-6">
            <p className="text-sm text-zinc-400">
              Paste the reset token from the API response (dev). In production this would be emailed.
            </p>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Reset token"
              className="w-full rounded-xl border border-zinc-700 bg-surface px-4 py-3 font-mono text-sm text-white"
            />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-xl border border-zinc-700 bg-surface px-4 py-3 text-white"
            />
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-accent-blue py-3 font-semibold">
              Update password
            </button>
          </form>
        )}
        {step === 3 && <p className="text-center text-emerald-400">Done. You can sign in now.</p>}
        <p className="mt-4 text-center">
          <Link to="/login" className="text-accent-blue hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

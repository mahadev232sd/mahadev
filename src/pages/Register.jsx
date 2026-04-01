import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import DrPlayLogo from '../components/DrPlayLogo';
import WhatsAppFab from '../components/WhatsAppFab';

function normalizePhone(input) {
  const d = String(input || '').replace(/\D/g, '');
  return d.length >= 10 ? d.slice(-10) : d;
}

export default function Register() {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/', { replace: true });
  }, [loading, isAuthenticated, navigate]);

  const onUsernameChange = (e) => {
    const v = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    setUsername(v);
  };

  const sendOtp = async () => {
    const p = normalizePhone(phone);
    if (p.length !== 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setSendingOtp(true);
    try {
      const { data } = await api.post('/auth/send-otp', { phone: p });
      toast.success(data.message || 'OTP sent');
      if (data.devOtp) {
        toast(`Dev OTP: ${data.devOtp}`, { icon: '🔑' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const p = normalizePhone(phone);
    if (!/^[a-zA-Z0-9]{1,6}$/.test(username)) {
      toast.error('Username: max 6 characters, letters and numbers only');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (p.length !== 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (!otp.trim()) {
      toast.error('Enter the OTP sent to your phone');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        username: username.toLowerCase(),
        password,
        phone: p,
        otp: otp.trim(),
      });
      toast.success('Account created');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-black px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center">
        <DrPlayLogo className="mb-8" />

        <div className="w-full rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={onUsernameChange}
                maxLength={6}
                autoComplete="username"
                placeholder="Enter username (max 6 chars)"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
              />
              <p className="mt-1 text-xs text-slate-500">Maximum 6 characters, only letters and numbers allowed</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Example@1256"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-11 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters long</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="Enter mobile number"
                autoComplete="tel"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={sendOtp}
              disabled={sendingOtp}
              className="w-full rounded-lg bg-zinc-400 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-500 disabled:opacity-60"
            >
              {sendingOtp ? 'Sending…' : 'Send OTP'}
            </button>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit OTP"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-slate-400"
              />
              <p className="mt-1 text-xs text-slate-500">Tap Send OTP, then enter the code you receive</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting ? 'Please wait…' : 'Register'}
            </button>

            <Link
              to="/login"
              className="flex w-full items-center justify-center rounded-lg border border-black bg-white py-3 text-sm font-semibold text-black transition hover:bg-slate-50"
            >
              Login
            </Link>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">Gaming Platform Management System</p>
        </div>
      </div>
      <WhatsAppFab />
    </div>
  );
}

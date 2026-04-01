import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import WhatsAppFab from '../components/WhatsAppFab';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate(from, { replace: true });
  }, [loading, isAuthenticated, navigate, from]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const id = identifier.trim();
    if (!id) {
      toast.error('Enter phone number or username');
      return;
    }
    setSubmitting(true);
    try {
      await login({ identifier: id, password });
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'Cannot reach server. Check API / network.'
          : err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-black px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center">
        <div className="mb-8 text-center">
          <p className="text-[42px] font-black leading-none tracking-tight text-white">MAHADEV</p>
          <div className="mx-auto mt-1.5 w-[170px] rounded-md bg-amber-400 px-2 py-1 shadow-inner">
            <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-black">BOOK</p>
          </div>
        </div>

        <div className="w-full rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          {location.state?.message && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-900">
              {location.state.message}
            </p>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number or Username</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your phone number or username"
                autoComplete="username"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>

            <Link
              to="/register"
              className="flex w-full items-center justify-center rounded-lg border border-black bg-white py-3 text-sm font-semibold text-black transition hover:bg-slate-50"
            >
              Register
            </Link>
          </form>

          <p className="mt-5 text-center">
            <Link to="/forgot-password" className="text-sm font-medium text-sky-600 hover:underline">
              Forgot Password?
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-slate-400">Gaming Platform Management System</p>
        </div>
      </div>
      <WhatsAppFab />
    </div>
  );
}

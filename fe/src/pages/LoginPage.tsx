import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Waves } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type LoginMode = 'user' | 'admin';

const fieldClass =
  'h-11 w-full border border-slate-200 bg-white px-10 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const signedInUser = await login(email, password);

      if (mode === 'admin' && signedInUser.role !== 'ADMIN') {
        setError('Tài khoản này không có quyền truy cập Admin Portal');
        setLoading(false);
        return;
      }

      navigate(mode === 'admin' && signedInUser.role === 'ADMIN' ? '/admin' : '/reports');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setEmail('');
    setPassword('');
    setError('');
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
          {mode === 'admin' ? 'Admin ID' : 'Email hoặc username'}
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={mode === 'admin' ? 'superadmin@billiard.saas' : 'manager@billiardpro.com'}
            className={fieldClass}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhap mat khau"
            className={`${fieldClass} pr-10`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-sky-600"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <label className="flex items-center gap-2 text-slate-500">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-3.5 w-3.5 border-slate-300 text-sky-600 focus:ring-sky-400"
          />
          Ghi nhớ đăng nhập
        </label>
        <button type="button" className="font-semibold text-sky-700 hover:text-sky-800">
          Quên mật khẩu?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Đang đăng nhập...' : mode === 'admin' ? 'Sign In to Dashboard' : 'Login'}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );

  if (mode === 'admin') {
    return (
      <main className="grid min-h-screen grid-cols-1 bg-white text-slate-900 lg:grid-cols-[44%_56%]">
        <section className="flex min-h-screen flex-col px-8 py-6 sm:px-16">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-sky-700 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-base font-bold leading-none text-slate-800">Billiard Admin</p>
              <button
                type="button"
                onClick={() => switchMode('user')}
                className="mt-1 text-[11px] font-semibold text-sky-700 hover:text-sky-800"
              >
                Chuyển sang user app
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center">
            <div className="w-full max-w-[380px]">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Super Portal Access</h1>
              <p className="mt-3 max-w-[280px] text-sm leading-6 text-slate-500">
                Đăng nhập để quản lý cửa hàng thuê ứng dụng, gia hạn dịch vụ và gửi thông báo.
              </p>
              <div className="mt-9">{form}</div>
            </div>
          </div>

          <p className="text-center text-[11px] font-medium text-slate-400">Secure Administrative Session - v2.4.1</p>
        </section>

        <section
          className="relative hidden min-h-screen overflow-hidden bg-slate-700 lg:block"
          style={{
            backgroundImage:
              'linear-gradient(120deg, rgba(14, 116, 144, 0.82), rgba(15, 23, 42, 0.72)), radial-gradient(circle at 55% 45%, rgba(125, 211, 252, 0.45), transparent 32%), linear-gradient(135deg, #1f3b52, #71889a)',
          }}
        >
          <div className="absolute inset-0 opacity-40">
            <div className="absolute left-[12%] top-[22%] h-px w-[76%] rotate-12 bg-sky-200" />
            <div className="absolute left-[18%] top-[35%] h-px w-[64%] -rotate-12 bg-sky-200" />
            <div className="absolute left-[28%] top-[20%] h-px w-[48%] rotate-45 bg-sky-200" />
            <div className="absolute left-[20%] top-[52%] h-px w-[60%] -rotate-45 bg-sky-200" />
            {Array.from({ length: 22 }).map((_, index) => (
              <span
                key={index}
                className="absolute h-2 w-2 bg-sky-300 shadow-[0_0_18px_rgba(125,211,252,0.9)]"
                style={{
                  left: `${16 + ((index * 17) % 68)}%`,
                  top: `${18 + ((index * 29) % 60)}%`,
                }}
              />
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 w-[460px] -translate-x-1/2 -translate-y-1/2 bg-white/86 p-9 shadow-2xl backdrop-blur">
            <div className="mb-8 flex h-10 w-10 items-center justify-center bg-sky-100 text-sky-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Enterprise-Grade Security</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Mọi thao tác trong Admin Portal được theo dõi để đảm bảo vận hành tài khoản cửa hàng minh bạch.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-slate-900"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(2, 6, 23, 0.76), rgba(2, 6, 23, 0.34)), radial-gradient(ellipse at 52% 62%, rgba(20, 184, 166, 0.72) 0 18%, rgba(7, 89, 133, 0.86) 19% 44%, rgba(68, 64, 60, 0.86) 45% 52%, rgba(15, 23, 42, 0.92) 53% 100%)',
      }}
    >
      <div className="absolute inset-x-0 top-[14%] h-16 bg-[linear-gradient(90deg,transparent,rgba(252,211,77,0.7),transparent)] opacity-60 blur-xl" />
      <section className="relative w-full max-w-[360px] bg-white p-7 shadow-2xl">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-sky-50 text-sky-700">
            <Waves className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billiard Pro</h1>
          <p className="mt-1 text-sm text-slate-500">Đăng nhập để quản lý câu lạc bộ của bạn.</p>
        </div>

        {form}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
          <span className="text-slate-400">User workspace</span>
          <button
            type="button"
            onClick={() => switchMode('admin')}
            className="font-semibold text-sky-700 hover:text-sky-800"
          >
            Admin Portal
          </button>
        </div>
      </section>
    </main>
  );
}

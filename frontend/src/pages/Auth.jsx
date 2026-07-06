import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!', { style: { background: '#1a1a2e', color: '#e2e8f0', border: '1px solid #10b981' } });
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created successfully!', { style: { background: '#1a1a2e', color: '#e2e8f0', border: '1px solid #10b981' } });
      }
      navigate('/');
    } catch {}
  };

  const fillDemo = (email, password) => {
    setForm(f => ({ ...f, email, password }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-950 to-slate-950 flex-col items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <Link to="/" className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className="text-3xl font-black gradient-text">NexaShop</span>
          </Link>

          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            The Future of<br />Shopping is Here
          </h2>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            AI-powered personalization, gamified rewards,<br />and exclusive deals — all in one place.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { title: 'Mood Shopping', desc: 'Products curated by your vibe' },
              { title: 'Loyalty Rewards', desc: 'Earn points on every order' },
              { title: 'Flash Deals', desc: 'Live countdown discounts' },
              { title: 'AI Assistant', desc: 'Powered by Groq LLaMA 3' },
            ].map(f => (
              <div key={f.title} className="glass rounded-2xl p-4 border border-white/8">
                <div className="w-8 h-8 bg-emerald-600/30 rounded-lg flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
                <p className="font-semibold text-sm text-white">{f.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <span className="text-2xl font-black gradient-text">NexaShop</span>
            </Link>
          </div>

          <h1 className="text-2xl font-black mb-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {mode === 'login' ? 'No account yet? ' : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>

          {/* Tab switcher */}
          <div className="flex glass rounded-xl p-1 mb-6 border border-white/8">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm capitalize transition-all ${
                  mode === m ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-400 hover:text-white'
                }`}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base font-bold mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Please wait...
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo accounts */}
          {mode === 'login' && (
            <div className="mt-6 p-4 glass rounded-2xl border border-white/8">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Demo Accounts</p>
              <div className="space-y-2">
                <button onClick={() => fillDemo('admin@nexashop.com', 'admin123')}
                  className="w-full flex items-center justify-between glass rounded-xl px-4 py-2.5 hover:bg-white/8 transition group">
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Admin Account</p>
                    <p className="text-xs text-slate-500">admin@nexashop.com</p>
                  </div>
                  <span className="badge bg-emerald-500/20 text-purple-400 border border-emerald-500/30">Admin</span>
                </button>

              </div>
            </div>
          )}

          <p className="text-center text-xs text-slate-600 mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-emerald-500 hover:text-emerald-400">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-emerald-500 hover:text-emerald-400">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}




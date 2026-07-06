import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import api from '../api/axios';

const LEVEL_COLORS = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#ffd700', Platinum: '#e5e4e2' };

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items, toggleCart } = useCartStore();
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestTimer = useRef(null);
  const navigate = useNavigate();
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/products?q=${encodeURIComponent(query.trim())}`); setShowSuggestions(false); }
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(suggestTimer.current);
    if (val.trim().length >= 2) {
      suggestTimer.current = setTimeout(() => {
        api.get('/ai/suggestions', { params: { q: val } })
          .then(r => { setSuggestions(r.data.suggestions || []); setShowSuggestions(true); })
          .catch(() => {});
      }, 400);
    } else {
      setSuggestions([]); setShowSuggestions(false);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={scrolled
        ? { background: 'rgba(2,2,5,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }
        : { background: 'transparent' }
      }
    >
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span className="text-[17px] font-black tracking-tight gradient-text">NexaShop</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className="relative flex items-center">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#475569' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={query}
              onChange={handleQueryChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search products, brands..."
              className="w-full text-sm"
              style={{ paddingLeft: '2.25rem', paddingRight: '5.5rem', paddingTop: '0.55rem', paddingBottom: '0.55rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.625rem' }}
            />
            <button type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-semibold px-3 py-1.5 rounded-md transition"
              style={{ background: 'rgba(16,185,129,0.9)', color: '#fff' }}>
              Search
            </button>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                style={{ background: '#0c0c12', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
                {suggestions.map((s, i) => (
                  <button key={i} type="button"
                    onMouseDown={() => { setQuery(s); setShowSuggestions(false); navigate(`/products?q=${encodeURIComponent(s)}`); }}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition"
                    style={{ color: '#94a3b8', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                    <svg className="w-3 h-3 shrink-0" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Nav links + actions */}
        <div className="flex items-center gap-1">

          {/* Loyalty badge — regular users only */}
          {user && user.role !== 'admin' && (
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mr-1"
              style={{ background: `${LEVEL_COLORS[user.loyaltyLevel]}12`, color: LEVEL_COLORS[user.loyaltyLevel], border: `1px solid ${LEVEL_COLORS[user.loyaltyLevel]}30` }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {user.loyaltyPoints} · {user.loyaltyLevel}
            </div>
          )}

          {user?.role !== 'admin' && (
            <Link to="/" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition"
              style={{ color: '#64748b' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>
          )}

          {user?.role !== 'admin' && (
            <Link to="/products" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition"
              style={{ color: '#64748b' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Products
            </Link>
          )}

          {user && user.role !== 'admin' && (
            <Link to="/orders" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition"
              style={{ color: '#64748b' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              Orders
            </Link>
          )}

          {/* Cart — hide for admin */}
          {user?.role !== 'admin' && (
            <button onClick={toggleCart}
              className="relative p-2.5 rounded-lg transition ml-1"
              style={{ color: '#64748b', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-[9px] min-w-[16px] min-h-[16px] rounded-full flex items-center justify-center font-bold"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 2px 8px rgba(16,185,129,0.5)' }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Auth section */}
          {user ? (
            user.role === 'admin' ? (
              /* Admin: direct panel link + sign out */
              <div className="flex items-center gap-2 ml-1">
                <Link to="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                  Admin Panel
                </Link>
                <button onClick={() => { logout(); navigate('/'); }}
                  className="p-2.5 rounded-lg transition"
                  style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                  title="Sign Out">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
              </div>
            ) : (
              /* Regular user: dropdown */
              <div className="relative ml-1">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition text-sm"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: '#cbd5e1' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden md:block font-medium">{user.name.split(' ')[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#475569' }}><polyline points="6 9 12 15 18 9"/></svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-12 rounded-xl p-1.5 min-w-48 z-50"
                    style={{ background: '#0c0c12', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                    <div className="px-3 py-2 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs font-semibold text-white">{user.name}</p>
                      <p className="text-[11px]" style={{ color: '#475569' }}>{user.email}</p>
                    </div>
                    {[
                      { to: '/profile', label: 'Profile', icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>, icon2: <circle cx="12" cy="7" r="4"/> },
                      { to: '/orders', label: 'Orders', icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/> },
                    ].map(({ to, label, icon, icon2 }) => (
                      <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition"
                        style={{ color: '#94a3b8' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e2e8f0'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{icon}{icon2}</svg>
                        {label}
                      </Link>
                    ))}
                    <hr className="divider my-1" />
                    <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm transition"
                      style={{ color: '#f87171' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2 px-4 ml-1">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

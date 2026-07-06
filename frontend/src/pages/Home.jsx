import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const FlashDeals    = lazy(() => import('../components/FlashDeals'));
const LoyaltySection = lazy(() => import('../components/LoyaltySection'));
const SpinWheel     = lazy(() => import('../components/SpinWheel'));

function useCountdown(target) {
  const [t, setT] = useState({ d: '00', h: '00', m: '00', s: '00' });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(target) - new Date());
      setT({
        d: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

const SALE_END = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

const OFFERS = [
  {
    title: 'Flat 20% Off', sub: 'On orders above ₹999', color: '#10b981',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>,
  },
  {
    title: 'Free Delivery', sub: 'On orders above ₹499', color: '#10b981',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>,
  },
  {
    title: 'Spin & Win', sub: 'Up to 20% extra off', color: '#f59e0b',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  },
  {
    title: '2x Loyalty Points', sub: 'On all sale orders', color: '#a855f7',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>,
  },
];

const CATEGORIES = [
  { label: 'Electronics', color: '#10b981', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
  { label: 'Fashion', color: '#ec4899', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg> },
  { label: 'Sports', color: '#10b981', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24"/></svg> },
  { label: 'Home', color: '#f59e0b', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { label: 'Beauty', color: '#a855f7', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { label: 'Books', color: '#06b6d4', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> },
];

export default function Home() {
  const [showSpin, setShowSpin] = useState(false);
  const [trending, setTrending] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const navigate = useNavigate();
  const countdown = useCountdown(SALE_END);

  useEffect(() => {
    Promise.all([
      api.get('/products/trending'),
      api.get('/products', { params: { sort: 'popular', limit: 4 } }),
    ]).then(([t, f]) => {
      setTrending(t.data);
      setFeaturedProducts(f.data.products || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 25% 40%, rgba(16,185,129,0.10) 0%, transparent 55%), radial-gradient(ellipse at 75% 60%, rgba(16,185,129,0.06) 0%, transparent 55%), #020205' }} />
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Sale badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase border border-emerald-500/30 text-emerald-300" style={{ background: 'rgba(16,185,129,0.08)' }}>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Mega Sale — Limited Time
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-5 leading-[1.05] tracking-tight">
            <span className="text-white">Biggest Sale</span><br />
            <span className="gradient-text">of the Year</span>
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Up to <span className="text-emerald-400 font-black">70% off</span> on thousands of products.
            Earn loyalty points, spin for exclusive discounts, grab flash deals.
          </p>

          {/* Countdown */}
          <div className="flex justify-center gap-3 mb-10">
            {[['Days', countdown.d], ['Hours', countdown.h], ['Mins', countdown.m], ['Secs', countdown.s]].map(([label, val]) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="glass rounded-xl px-5 py-3 min-w-[68px] border border-white/10">
                  <span className="text-3xl font-black text-white tabular-nums">{val}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center mb-14">
            <Link to="/products"
              className="btn-primary px-8 py-3.5 text-base flex items-center gap-2">
              Shop the Sale
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <button onClick={() => setShowSpin(true)}
              className="btn-outline px-8 py-3.5 text-base flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              Spin for Discount
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-12">
            {[['70%', 'Max Discount'], ['50K+', 'Orders Today'], ['340K+', 'Customers']].map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-black gradient-text">{n}</div>
                <div className="text-slate-500 text-sm mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>


      </section>

      {/* ── TRENDING TICKER ── */}
      {trending.length > 0 && (
        <div className="bg-emerald-600/10 border-y border-emerald-500/15 py-3 overflow-hidden">
          <div className="flex gap-10 ticker-track whitespace-nowrap">
            {[...trending, ...trending].map((p, i) => (
              <span key={i}
                className="text-sm cursor-pointer hover:text-emerald-400 transition shrink-0 text-slate-400"
                onClick={() => navigate(`/product/${p._id}`)}>
                <span className="text-emerald-400 font-semibold">Trending</span> — {p.name}
                <span className="text-emerald-300 font-bold ml-2">₹{Number(p.price).toLocaleString('en-IN')}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── OFFER CARDS ── */}
      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black">Sale Offers</h2>
              <p className="text-slate-500 text-sm mt-1">Exclusive deals for this season</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 glass px-3 py-1.5 rounded-full border border-emerald-500/25 uppercase tracking-wider">Limited Time</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {OFFERS.map(o => (
              <div key={o.title}
                onClick={() => navigate('/products')}
                className="glass rounded-2xl p-6 border border-white/8 hover:border-white/16 hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors"
                  style={{ background: `${o.color}15`, color: o.color }}>
                  {o.icon}
                </div>
                <p className="font-bold text-sm text-white mb-1">{o.title}</p>
                <p className="text-xs text-slate-500">{o.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH DEALS ── */}
      <Suspense fallback={null}><FlashDeals /></Suspense>

      {/* ── PROMO BANNER ── */}
      <section className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-9 border border-emerald-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 50%, rgba(16,185,129,0.07) 100%)' }}>
            {/* Subtle glow */}
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-2">Special Offer</p>
              <h3 className="text-2xl md:text-3xl font-black text-white">Get Extra 15% Off</h3>
              <p className="text-slate-400 mt-2 text-sm">
                On your first order — use code&nbsp;
                <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/25">SPIN15</span>
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <Link to="/products" className="btn-primary px-8 py-3 text-sm">
                Shop Now
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black">Shop by Category</h2>
              <p className="text-slate-500 text-sm mt-1">Browse our curated collections</p>
            </div>
            <Link to="/products" className="text-sm text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map(({ label, icon, color }) => (
              <Link key={label} to={`/products?category=${label.toLowerCase()}`}
                className="glass rounded-2xl p-4 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all border border-white/8 hover:border-white/18 group">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: `${color}15`, color }}>
                  {icon}
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP PICKS ── */}
      {featuredProducts.length > 0 && (
        <section className="py-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black">Top Picks This Season</h2>
                <p className="text-slate-500 text-sm mt-1">Most popular products right now</p>
              </div>
              <Link to="/products?sort=popular" className="text-sm text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1">
                See all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featuredProducts.map(p => {
                const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                return (
                  <div key={p._id} onClick={() => navigate(`/product/${p._id}`)}
                    className="glass rounded-2xl overflow-hidden card-hover cursor-pointer group border border-white/8 hover:border-white/16">
                    <div className="relative h-48 overflow-hidden bg-slate-900/50">
                      <img src={p.images?.[0]} alt={p.name} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => e.target.src = 'https://placehold.co/400x300/1e1e2e/10b981?text=Product'} />
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold line-clamp-1 mb-3 text-slate-100">{p.name}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-emerald-400 font-black">₹{Number(p.price).toLocaleString('en-IN')}</span>
                          {p.originalPrice && <span className="text-xs text-slate-600 line-through ml-2">₹{Number(p.originalPrice).toLocaleString('en-IN')}</span>}
                        </div>
                        <div className="flex">
                          {[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= Math.round(p.rating) ? 'star-filled' : 'star-empty'}`}>★</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── LOYALTY ── */}
      <Suspense fallback={null}><LoyaltySection /></Suspense>

      {/* ── SPIN CTA ── */}
      <section className="py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-10 border border-white/10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.3) 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              </div>
              <h2 className="text-2xl font-black mb-2">Spin the Wheel Daily</h2>
              <p className="text-slate-400 mb-7 max-w-sm mx-auto text-sm leading-relaxed">Win up to 20% off, free shipping, or bonus loyalty points — one free spin every day.</p>
              <button onClick={() => setShowSpin(true)} className="btn-primary px-8 py-3.5 text-base">
                Spin Now — It's Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {showSpin && <Suspense fallback={null}><SpinWheel onClose={() => setShowSpin(false)} /></Suspense>}
    </div>
  );
}






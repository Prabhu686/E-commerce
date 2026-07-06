import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

function useCountdown(endTime) {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(endTime) - new Date());
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTime({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return time;
}

function DealCard({ product }) {
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const time = useCountdown(product.flashDealEnds);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleGrab = (e) => {
    e.stopPropagation();
    if (!user) { toast.error('Sign in to add items to cart'); navigate('/login'); return; }
    addItem(product);
    toast.success('Added to cart!');
  };

  return (
    <div className="rounded-2xl p-4 min-w-56 flex-shrink-0 card-hover cursor-pointer" style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)' }} onClick={() => navigate(`/product/${product._id}`)}>
      <div className="relative mb-3">
        <img src={product.images?.[0]} alt={product.name} className="w-full h-36 object-cover rounded-xl"
          onError={e => e.target.src='https://via.placeholder.com/200x150?text=Deal'} />
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full">-{discount}%</span>
      </div>
      <p className="font-semibold text-sm line-clamp-1 mb-1">{product.name}</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-emerald-400 font-black">₹{Number(product.price).toLocaleString('en-IN')}</span>
        <span className="text-slate-500 line-through text-xs">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>
      </div>
      <div className="flex gap-1 mb-3">
        {[time.h, time.m, time.s].map((v, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="bg-emerald-600/30 border border-emerald-500/30 rounded-lg px-2 py-1 text-center">
              <span className="text-sm font-black text-emerald-300">{v}</span>
            </div>
            {i < 2 && <span className="text-emerald-400 font-black">:</span>}
          </div>
        ))}
      </div>
      <button onClick={handleGrab}
        className="btn-primary w-full text-xs py-2 flex items-center justify-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
        Grab Deal
      </button>
    </div>
  );
}

export default function FlashDeals() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    api.get('/products?flash=true&limit=6').then(r => setDeals(r.data.products)).catch(() => {});
  }, []);

  if (!deals.length) return null;

  return (
    <section className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
            Flash Deals
          </h2>
          <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30 animate-pulse">LIVE</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {deals.map(p => <DealCard key={p._id} product={p} />)}
        </div>
      </div>
    </section>
  );
}




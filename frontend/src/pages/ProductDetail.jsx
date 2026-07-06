import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js';
import api from '../api/axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { user, toggleWishlist } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [recs, setRecs] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [tab, setTab] = useState('description');
  const [error, setError] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  useEffect(() => {
    window.scrollTo(0, 0);
    setError(null);
    setProduct(null);
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data);
      setWishlisted(user?.wishlist?.includes(r.data._id));
      api.get(`/ai/insight/${id}`).then(ins => setAiInsight(ins.data.insight)).catch(() => {});
    }).catch(err => setError(err.response?.data?.message || 'Failed to load product'));
    api.get(`/products/${id}/recommendations`).then(r => setRecs(r.data)).catch(() => {});
  }, [id]);

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
      <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <p>{error}</p>
      <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const priceChartData = {
    labels: product.priceHistory?.map(h => new Date(h.date).toLocaleDateString()) || [],
    datasets: [{
      label: 'Price (₹)',
      data: product.priceHistory?.map(h => h.price) || [],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
    }],
  };

  const handleAddToCart = () => {
    if (!user) { toast.error('Sign in to add items to cart'); navigate('/login'); return; }
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = async () => {
    if (!user) return toast.error('Login to save wishlist');
    await toggleWishlist(product._id);
    setWishlisted(!wishlisted);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  const submitReview = async () => {
    if (!user) return toast.error('Login to review');
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, review);
      toast.success('Review submitted');
      const r = await api.get(`/products/${id}`);
      setProduct(r.data);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-emerald-400">Home</button>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-slate-200 line-clamp-1">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div>
            <div className="glass rounded-3xl overflow-hidden mb-4 aspect-square">
              <img src={product.images?.[activeImg] || 'https://via.placeholder.com/500'}
                alt={product.name} className="w-full h-full object-cover"
                onError={e => e.target.src='https://via.placeholder.com/500'} />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${activeImg === i ? 'border-emerald-500' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {product.moods?.map(m => (
                <span key={m} className="text-xs glass px-3 py-1 rounded-full capitalize">{m}</span>
              ))}
              {product.isFlashDeal && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
                  Flash Deal
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-lg ${s <= Math.round(product.rating) ? 'star-filled' : 'star-empty'}`}>★</span>
                ))}
              </div>
              <span className="text-slate-400 text-sm">{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-black text-emerald-400">₹{Number(product.price).toLocaleString('en-IN')}</span>
              {product.originalPrice && <>
                <span className="text-xl text-slate-500 line-through">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>
                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold">-{discount}%</span>
              </>}
            </div>

            <p className="text-slate-300 mb-6 leading-relaxed">{product.description}</p>

            {aiInsight && (
              <div className="glass rounded-xl p-4 mb-6 border border-emerald-500/20" style={{ background: 'rgba(16,185,129,0.05)' }}>
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                  AI Insight
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{aiInsight}</p>
              </div>
            )}
            {/* Stock */}
            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Stock availability</span>
                <span className={product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}>
                  {product.stock > 10 ? `${product.stock} in stock` : product.stock > 0 ? `Only ${product.stock} left` : 'Out of stock'}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-500"
                  style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }} />
              </div>
            </div>

            {/* Qty & Actions */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3 glass rounded-xl px-4 py-2">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-lg hover:text-emerald-400">−</button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="text-lg hover:text-emerald-400">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="btn-primary flex-1 py-3 text-base disabled:opacity-50 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Add to Cart
              </button>
              <button onClick={handleWishlist}
                className={`glass p-3 rounded-xl transition hover:scale-110 ${wishlisted ? 'text-red-400' : 'text-slate-400'}`}>
                <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>

            <button onClick={() => { if (!user) { toast.error('Sign in to continue'); navigate('/login'); return; } handleAddToCart(); navigate('/checkout'); }}
              disabled={product.stock === 0}
              className="w-full btn-outline py-3 text-base disabled:opacity-50 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
              Buy Now
            </button>

            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.map(t => (
                  <span key={t} className="text-xs glass px-2 py-1 rounded-lg text-slate-400">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 mb-6 border-b border-white/10">
            {['description', 'reviews', 'price-history'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 font-semibold capitalize transition border-b-2 -mb-px ${tab === t ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <div className="glass rounded-2xl p-6">
              <p className="text-slate-300 leading-relaxed">{product.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>, title: 'Free Returns', sub: '30 days' },
                  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>, title: 'Fast Delivery', sub: '3-5 days' },
                  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, title: 'Secure Pay', sub: '256-bit SSL' },
                  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>, title: 'Loyalty Points', sub: `+${Math.floor(product.price / 100)} pts` },
                ].map(({ icon, title, sub }) => (
                  <div key={title} className="glass rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2 text-emerald-400">{icon}</div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-4">
              {user && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-bold mb-4">Write a Review</h3>
                  <div className="flex gap-2 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReview(r => ({ ...r, rating: s }))}
                        className={`text-2xl transition ${s <= review.rating ? 'star-filled' : 'star-empty'}`}>★</button>
                    ))}
                  </div>
                  <textarea value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                    placeholder="Share your experience..." rows={3} className="w-full mb-3 resize-none" />
                  <button onClick={submitReview} disabled={submitting} className="btn-primary">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}
              {product.reviews?.length === 0 ? (
                <div className="text-center py-10 text-slate-400">No reviews yet. Be the first!</div>
              ) : (
                product.reviews?.map((r, i) => (
                  <div key={i} className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {r.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.name}</p>
                        <div className="flex">{[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= r.rating ? 'star-filled' : 'star-empty'}`}>★</span>)}</div>
                      </div>
                      <span className="ml-auto text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'price-history' && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Price History
              </h3>
              {product.priceHistory?.length > 1 ? (
                <Line data={priceChartData} options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#94a3b8', callback: v => `₹${Number(v).toLocaleString('en-IN')}` }, grid: { color: 'rgba(255,255,255,0.05)' } },
                  },
                }} />
              ) : (
                <p className="text-slate-400 text-center py-8">Price history will appear after price changes.</p>
              )}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recs.length > 0 && (
          <div>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recs.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




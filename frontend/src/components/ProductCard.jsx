import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const { user, toggleWishlist } = useAuthStore();
  const [wishlisted, setWishlisted] = useState(user?.wishlist?.includes(product._id));
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) { toast.error('Sign in to add items to cart'); navigate('/login'); return; }
    setAdding(true);
    addItem(product);
    toast.success('Added to cart');
    setTimeout(() => setAdding(false), 800);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error('Sign in to save wishlist');
    await toggleWishlist(product._id);
    setWishlisted(w => !w);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group relative flex flex-col cursor-pointer rounded-xl overflow-hidden transition-all duration-300"
      style={{ background: '#0c0c12', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden" style={{ height: '196px', background: '#080810' }}>
        <img
          src={product.images?.[0] || 'https://placehold.co/400x300/0c0c12/10b981?text=Product'}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          onError={e => { e.target.src = 'https://placehold.co/400x300/0c0c12/10b981?text=Product'; }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(2,2,5,0.95) 0%, rgba(2,2,5,0.3) 50%, transparent 100%)' }}>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50"
            style={{ background: adding ? '#059669' : 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 4px 20px rgba(16,185,129,0.5)' }}
          >
            {adding ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            )}
            {adding ? 'Added!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide"
              style={{ background: 'rgba(239,68,68,0.92)', color: '#fff' }}>
              -{discount}%
            </span>
          )}
          {product.isFlashDeal && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide"
              style={{ background: 'rgba(245,158,11,0.92)', color: '#000' }}>
              ⚡ FLASH
            </span>
          )}
          {product.isTrending && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide"
              style={{ background: 'rgba(16,185,129,0.92)', color: '#fff' }}>
              TRENDING
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: wishlisted ? 'rgba(239,68,68,0.18)' : 'rgba(0,0,0,0.55)',
            border: wishlisted ? '1px solid rgba(239,68,68,0.45)' : '1px solid rgba(255,255,255,0.1)',
            color: wishlisted ? '#f87171' : '#64748b',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>

        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 capitalize" style={{ color: '#10b981' }}>
          {product.category}
        </p>

        <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-3" style={{ color: '#e2e8f0', minHeight: '2.5rem' }}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <svg key={s} className="w-3 h-3" fill={s <= Math.round(product.rating) ? '#f59e0b' : '#1e293b'} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <span className="text-[11px]" style={{ color: '#334155' }}>
            {product.rating?.toFixed(1)} · {product.numReviews?.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex-1" />

        {/* Stock bar */}
        <div className="mb-3">
          <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min((product.stock / 100) * 100, 100)}%`,
                background: product.stock > 20 ? '#10b981' : product.stock > 5 ? '#f59e0b' : '#ef4444',
              }} />
          </div>
          <p className="text-[10px] mt-1 font-medium" style={{ color: product.stock > 20 ? '#10b981' : product.stock > 5 ? '#f59e0b' : '#ef4444' }}>
            {product.stock > 20 ? 'In stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of stock'}
          </p>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black" style={{ color: '#f1f5f9' }}>
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-xs line-through" style={{ color: '#1e293b' }}>
                ₹{Number(product.originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="lg:hidden flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-40"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}





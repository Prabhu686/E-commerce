import { useEffect, useState } from 'react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQty, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [recs, setRecs] = useState([]);
  const navigate = useNavigate();
  const cartTotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  useEffect(() => {
    if (items.length > 0) {
      api.get(`/products/${items[0]._id}/recommendations`)
        .then(r => setRecs(r.data.slice(0, 3)))
        .catch(() => {});
    }
  }, [items]);

  const handleCheckout = () => {
    toggleCart();
    if (!user) navigate('/login');
    else navigate('/checkout');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={toggleCart} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-[400px] z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.07)', boxShadow: '-20px 0 60px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <svg className="w-4.5 h-4.5" style={{ color: '#10b981', width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="font-bold text-base" style={{ color: '#f1f5f9' }}>
              Cart
              {items.length > 0 && (
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                  {items.reduce((s, i) => s + i.qty, 0)}
                </span>
              )}
            </h2>
          </div>
          <button onClick={toggleCart} className="w-8 h-8 rounded-lg flex items-center justify-center transition"
            style={{ color: '#475569', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <svg className="w-7 h-7" style={{ color: '#1e293b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: '#475569' }}>Your cart is empty</p>
              <p className="text-xs" style={{ color: '#334155' }}>Add items to get started</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img src={item.images?.[0]} alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg shrink-0"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  onError={e => e.target.src = 'https://via.placeholder.com/64'} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1 mb-0.5" style={{ color: '#e2e8f0' }}>{item.name}</p>
                  <p className="text-sm font-bold mb-2" style={{ color: '#34d399' }}>₹{Number(item.price).toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item._id, item.qty - 1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold transition"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                      −
                    </button>
                    <span className="text-sm font-semibold w-6 text-center" style={{ color: '#e2e8f0' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item._id, item.qty + 1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold transition"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                      +
                    </button>
                  </div>
                </div>
                <button onClick={() => removeItem(item._id)}
                  className="self-start p-1.5 rounded-lg transition"
                  style={{ color: '#334155' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = 'transparent'; }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))
          )}

          {/* Recommendations */}
          {recs.length > 0 && items.length > 0 && (
            <div className="mt-2 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: '#334155' }}>
                <svg className="w-3 h-3" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                You might also like
              </p>
              <div className="space-y-2">
                {recs.map(r => (
                  <div key={r._id} className="flex items-center gap-3 p-2.5 rounded-xl transition"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img src={r.images?.[0]} alt={r.name} className="w-10 h-10 object-cover rounded-lg"
                      onError={e => e.target.src = 'https://via.placeholder.com/40'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs line-clamp-1 font-medium" style={{ color: '#94a3b8' }}>{r.name}</p>
                      <p className="text-xs font-bold" style={{ color: '#34d399' }}>₹{Number(r.price).toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => useCartStore.getState().addItem(r)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}>
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {cartTotal < 10000 && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <svg className="w-3.5 h-3.5 shrink-0" style={{ color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                <p className="text-xs" style={{ color: '#f59e0b' }}>Add ₹{(10000 - cartTotal).toLocaleString('en-IN')} more for free shipping</p>
              </div>
            )}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium" style={{ color: '#64748b' }}>Total</span>
              <span className="text-xl font-black" style={{ color: '#f1f5f9' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full py-3 text-sm font-bold mb-2">
              Proceed to Checkout
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button onClick={clearCart} className="w-full text-xs py-2 transition" style={{ color: '#334155' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = '#334155'}>
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}




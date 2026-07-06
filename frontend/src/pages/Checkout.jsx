import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    sub: 'Visa, Mastercard, Rupay',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.8}/>
        <path d="M2 10h20" strokeWidth={1.8}/>
        <path d="M6 15h4" strokeWidth={1.8} strokeLinecap="round"/>
      </svg>
    ),
    color: '#10b981',
    badge: 'Popular',
  },
  {
    id: 'upi',
    label: 'UPI',
    sub: 'GPay, PhonePe, Paytm',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth={1.8} strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" strokeWidth={1.8} strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" strokeWidth={1.8} strokeLinejoin="round"/>
      </svg>
    ),
    color: '#f59e0b',
    badge: 'Instant',
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    sub: 'All major banks',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#6ee7b7',
    badge: null,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    sub: 'Pay when delivered',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#94a3b8',
    badge: null,
  },
];

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(user?.discountCoupon || '');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [address, setAddress] = useState({ fullName: user?.name || '', address: '', city: '', postalCode: '', country: '' });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 10000 ? 0 : 99;
  const DISCOUNTS = { SPIN5: 5, SPIN10: 10, SPIN15: 15, SPIN20: 20, FREESHIP: 0 };
  const discountPct = appliedCoupon && DISCOUNTS[appliedCoupon] !== undefined ? DISCOUNTS[appliedCoupon] : 0;
  const discountAmt = appliedCoupon === 'FREESHIP' ? 0 : (subtotal * discountPct) / 100;
  const freeShip = appliedCoupon === 'FREESHIP';
  const total = subtotal - discountAmt + (freeShip ? 0 : shipping);

  const applyCoupon = () => {
    if (DISCOUNTS[coupon.toUpperCase()] !== undefined) {
      setAppliedCoupon(coupon.toUpperCase());
      toast.success(`Coupon applied! ${coupon === 'FREESHIP' ? 'Free shipping!' : `${DISCOUNTS[coupon.toUpperCase()]}% off!`}`);
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const placeOrder = async () => {
    if (!address.address || !address.city || !address.country)
      return toast.error('Please fill in shipping address');
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(i => ({ product: i._id, name: i.name, image: i.images?.[0], price: i.price, qty: i.qty })),
        shippingAddress: address,
        paymentMethod: paymentMethod === 'card' ? 'Card' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'netbanking' ? 'Net Banking' : 'Cash on Delivery',
        couponUsed: appliedCoupon,
      });
      await api.put(`/orders/${data._id}/pay`);
      clearCart();
      toast.success(`Order placed! +${data.loyaltyEarned} loyalty points earned!`, { duration: 5000 });
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    }
    setLoading(false);
  };

  if (items.length === 0) { navigate('/'); return null; }

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-8">Checkout</h1>
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left */}
          <div className="md:col-span-3 space-y-6">
            {/* Shipping */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input value={address.fullName} onChange={e => setAddress(a => ({ ...a, fullName: e.target.value }))}
                    placeholder="Full Name" className="w-full" />
                </div>
                <div className="col-span-2">
                  <input value={address.address} onChange={e => setAddress(a => ({ ...a, address: e.target.value }))}
                    placeholder="Street Address" className="w-full" />
                </div>
                <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                  placeholder="City" className="w-full" />
                <input value={address.postalCode} onChange={e => setAddress(a => ({ ...a, postalCode: e.target.value }))}
                  placeholder="Postal Code" className="w-full" />
                <div className="col-span-2">
                  <input value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
                    placeholder="Country" className="w-full" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.8}/>
                  <path d="M2 10h20" strokeWidth={1.8}/>
                </svg>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {PAYMENT_METHODS.map(({ id, label, sub, icon, color, badge }) => (
                  <button key={id} onClick={() => setPaymentMethod(id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left"
                    style={{
                      background: paymentMethod === id ? `${color}10` : 'rgba(255,255,255,0.02)',
                      border: paymentMethod === id ? `1.5px solid ${color}` : '1.5px solid rgba(255,255,255,0.07)',
                      boxShadow: paymentMethod === id ? `0 0 0 3px ${color}15` : 'none',
                    }}>
                    {/* Radio */}
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{ borderColor: paymentMethod === id ? color : 'rgba(255,255,255,0.2)' }}>
                      {paymentMethod === id && (
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      )}
                    </div>
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}15`, color }}>
                      {icon}
                    </div>
                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{label}</p>
                        {badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${color}20`, color }}>
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{sub}</p>
                    </div>
                    {/* Check */}
                    {paymentMethod === id && (
                      <svg className="w-5 h-5 shrink-0" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Card details form — only show when card selected */}
              {paymentMethod === 'card' && (
                <div className="mt-4 space-y-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <input placeholder="Card Number (1234 5678 9012 3456)" className="w-full font-mono" maxLength={19}
                    onChange={e => { let v = e.target.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim(); e.target.value = v; }} />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="MM / YY" className="w-full font-mono" maxLength={7} />
                    <input placeholder="CVV" className="w-full font-mono" maxLength={3} type="password" />
                  </div>
                  <input placeholder="Name on Card" className="w-full" />
                </div>
              )}

              {/* UPI ID input */}
              {paymentMethod === 'upi' && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <input placeholder="Enter UPI ID (e.g. name@upi)" className="w-full" />
                  <p className="text-xs mt-2" style={{ color: '#475569' }}>You'll receive a payment request on your UPI app</p>
                </div>
              )}

              {/* Net banking bank select */}
              {paymentMethod === 'netbanking' && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <select className="w-full">
                    <option value="">Select your bank</option>
                    {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank', 'Bank of Baroda'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* COD note */}
              {paymentMethod === 'cod' && (
                <div className="mt-4 pt-4 flex items-start gap-3 p-3 rounded-xl" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.12)' }}>
                  <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth={1.8}/>
                    <path d="M12 8v4M12 16h.01" strokeWidth={1.8} strokeLinecap="round"/>
                  </svg>
                  <p className="text-xs" style={{ color: '#64748b' }}>Pay in cash when your order is delivered. Extra ₹49 COD fee applies.</p>
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Coupon Code
              </h2>
              {user?.discountCoupon && !appliedCoupon && (
                <p className="text-xs text-amber-400 mb-2">
                  You have a spin coupon: <span className="font-mono font-bold">{user.discountCoupon}</span>
                </p>
              )}
              <div className="flex gap-2">
                <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code" className="flex-1 font-mono" />
                <button onClick={applyCoupon} className="btn-outline px-4">Apply</button>
              </div>
              {appliedCoupon && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {appliedCoupon} applied!
                </p>
              )}
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="md:col-span-2">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Order Summary
              </h2>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img src={item.images?.[0]} alt={item.name} className="w-12 h-12 object-cover rounded-lg"
                      onError={e => e.target.src='https://via.placeholder.com/48'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs line-clamp-1">{item.name}</p>
                      <p className="text-xs text-slate-400">×{item.qty}</p>
                    </div>
                <span className="text-sm font-bold text-emerald-400">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <hr className="border-white/10 mb-4" />
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Shipping</span><span className={freeShip || shipping === 0 ? 'text-green-400' : ''}>{freeShip || shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                {discountAmt > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{Math.round(discountAmt).toLocaleString('en-IN')}</span></div>}
              </div>
              <div className="flex justify-between text-xl font-black mb-6">
                <span>Total</span>
                <span className="text-emerald-400">₹{Math.round(total).toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs text-amber-400 mb-4 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                You'll earn ~{Math.floor(total / 100)} loyalty points!
              </div>
              <button onClick={placeOrder} disabled={loading} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing Order...</>
                ) : (
                  <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg> Place Order</>
                )}
              </button>
              <p className="text-xs text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Secured by 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




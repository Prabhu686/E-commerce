import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const TABS = ['analytics', 'products', 'users', 'orders', 'returns'];

const STATUS_STYLES = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  return_requested: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  returned: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '', category: 'electronics',
  stock: '', moods: [], images: [''], isFeatured: false, isTrending: false,
  isFlashDeal: false, flashDiscount: 0,
};
const MOODS_LIST = ['energetic', 'chill', 'luxurious', 'adventurous', 'creative', 'romantic'];

export default function Admin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('analytics');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [trackingInputs, setTrackingInputs] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    const [p, o, u] = await Promise.all([
      api.get('/products?limit=100').then(r => r.data.products),
      api.get('/orders').then(r => r.data),
      api.get('/auth/users').then(r => r.data),
    ]);
    setProducts(p);
    setOrders(o);
    setUsers(u);
    // Compute analytics
    const totalRevenue = o.filter(x => x.isPaid).reduce((s, x) => s + x.totalPrice, 0);
    const totalOrders = o.length;
    const paidOrders = o.filter(x => x.isPaid).length;
    const productSales = {};
    o.forEach(ord => ord.items?.forEach(item => {
      productSales[item.name] = (productSales[item.name] || 0) + item.qty;
    }));
    const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const revenueByDay = {};
    o.filter(x => x.isPaid).forEach(ord => {
      const day = new Date(ord.paidAt || ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      revenueByDay[day] = (revenueByDay[day] || 0) + ord.totalPrice;
    });
    const last7 = Object.entries(revenueByDay).slice(-7);
    setAnalytics({ totalRevenue, totalOrders, paidOrders, topProducts, last7, totalUsers: u.length });
  };

  // ── Products ──────────────────────────────────────────────
  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Deleted');
    loadData();
  };

  const openEdit = (p) => {
    setEditId(p._id);
    setForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice || '', category: p.category, stock: p.stock, moods: p.moods || [], images: p.images?.length ? p.images : [''], isFeatured: p.isFeatured, isTrending: p.isTrending, isFlashDeal: p.isFlashDeal, flashDiscount: p.flashDiscount || 0 });
    setShowForm(true);
  };

  const resetForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); };

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: +form.price, originalPrice: +form.originalPrice, stock: +form.stock };
      if (editId) { await api.put(`/products/${editId}`, payload); toast.success('Product updated!'); }
      else { await api.post('/products', payload); toast.success('Product created!'); }
      resetForm(); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const toggleMood = (m) => setForm(f => ({ ...f, moods: f.moods.includes(m) ? f.moods.filter(x => x !== m) : [...f.moods, m] }));

  // ── Orders ────────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    toast.success('Status updated');
    loadData();
  };

  const saveTracking = async (id) => {
    const order = orders.find(o => o._id === id);
    await api.put(`/orders/${id}/status`, { status: order.status, trackingNumber: trackingInputs[id] });
    toast.success('Tracking saved');
    loadData();
  };

  const handleReturnAction = async (id, action) => {
    await api.put(`/orders/${id}/status`, { status: action });
    toast.success(`Order marked as ${action}`);
    loadData();
  };

  const returnOrders = orders.filter(o => ['return_requested', 'returned'].includes(o.status));

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin Dashboard
          </h1>
          {tab === 'products' && (
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Product
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl font-semibold capitalize transition ${tab === t ? 'bg-emerald-600 text-white' : 'glass hover:bg-white/10'}`}>
              {t === 'returns' ? `Returns${returnOrders.length ? ` (${returnOrders.length})` : ''}` : t}
            </button>
          ))}
        </div>

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: `₹${Math.round(analytics.totalRevenue).toLocaleString('en-IN')}`, color: '#10b981', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 8v1m0-9a9 9 0 110 18A9 9 0 0112 3z"/> },
                { label: 'Total Orders', value: analytics.totalOrders, color: '#6366f1', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/> },
                { label: 'Paid Orders', value: analytics.paidOrders, color: '#f59e0b', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/> },
                { label: 'Total Users', value: analytics.totalUsers, color: '#ec4899', icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></> },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className="glass rounded-2xl p-5 border border-white/8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                    </div>
                  </div>
                  <p className="text-2xl font-black" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Revenue Bar Chart */}
              <div className="glass rounded-2xl p-6 border border-white/8">
                <h3 className="font-bold mb-4 text-sm text-slate-300">Revenue (Last 7 Days)</h3>
                {analytics.last7.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No paid orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const max = Math.max(...analytics.last7.map(([, v]) => v));
                      return analytics.last7.map(([day, val]) => (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-16 shrink-0">{day}</span>
                          <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden">
                            <div className="h-full rounded-lg flex items-center px-2 transition-all"
                              style={{ width: `${(val / max) * 100}%`, background: 'linear-gradient(90deg, #10b981, #059669)', minWidth: '2px' }}>
                              <span className="text-[10px] text-white font-bold whitespace-nowrap">₹{Math.round(val).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {/* Top Products */}
              <div className="glass rounded-2xl p-6 border border-white/8">
                <h3 className="font-bold mb-4 text-sm text-slate-300">Top Selling Products</h3>
                {analytics.topProducts.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.topProducts.map(([name, qty], i) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                          style={{ background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.1)', color: i < 3 ? '#000' : '#64748b' }}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-slate-300 line-clamp-1">{name}</span>
                        <span className="text-xs font-bold text-emerald-400">{qty} sold</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="glass rounded-2xl p-6 border border-white/8">
              <h3 className="font-bold mb-4 text-sm text-slate-300">Order Status Breakdown</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(
                  orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})
                ).map(([status, count]) => (
                  <div key={status} className={`px-4 py-2 rounded-xl border text-sm font-semibold ${STATUS_STYLES[status]}`}>
                    {status.replace('_', ' ')} <span className="font-black ml-1">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <div>
            {showForm && (
              <form onSubmit={submitProduct} className="glass rounded-2xl p-6 mb-6">
                <h2 className="font-bold text-lg mb-4">{editId ? 'Edit Product' : 'Add New Product'}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product Name" required className="w-full" />
                  <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price" type="number" required className="w-full" />
                  <input value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="Original Price" type="number" className="w-full" />
                  <input value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="Stock" type="number" required className="w-full" />
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full">
                    {['electronics', 'fashion', 'sports', 'home', 'beauty', 'books'].map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                  </select>
                  <input value={form.images[0]} onChange={e => setForm(f => ({ ...f, images: [e.target.value] }))} placeholder="Image URL" className="w-full" />
                  <div className="col-span-2">
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} required className="w-full resize-none" />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-2">Moods</p>
                    <div className="flex flex-wrap gap-2">
                      {MOODS_LIST.map(m => (
                        <button type="button" key={m} onClick={() => toggleMood(m)}
                          className={`px-3 py-1 rounded-full text-xs capitalize transition ${form.moods.includes(m) ? 'bg-emerald-600 text-white' : 'glass'}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 flex gap-4 flex-wrap">
                    {[['isFeatured', 'Featured'], ['isTrending', 'Trending'], ['isFlashDeal', 'Flash Deal']].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 accent-emerald-500" />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="btn-primary">{editId ? 'Update Product' : 'Create Product'}</button>
                  <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>
                </div>
              </form>
            )}

            <div className="glass rounded-2xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr className="text-slate-400 text-xs uppercase">
                    <th className="p-4 text-left">Product</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-left">Stock</th>
                    <th className="p-4 text-left">Sold</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg"
                            onError={e => e.target.src = 'https://via.placeholder.com/40'} />
                          <span className="line-clamp-1 max-w-32">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 capitalize text-slate-400">{p.category}</td>
                      <td className="p-4 text-emerald-400 font-bold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={p.stock > 10 ? 'text-green-400' : p.stock > 0 ? 'text-amber-400' : 'text-red-400'}>{p.stock}</span>
                      </td>
                      <td className="p-4 text-slate-400">{p.sold}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="text-emerald-400 hover:text-emerald-300 text-xs glass px-2 py-1 rounded-lg">Edit</button>
                          <button onClick={() => deleteProduct(p._id)} className="text-red-400 hover:text-red-300 text-xs glass px-2 py-1 rounded-lg">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div className="glass rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-slate-400 text-xs uppercase">
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Loyalty</th>
                  <th className="p-4 text-left">Points</th>
                  <th className="p-4 text-left">Coupon</th>
                  <th className="p-4 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        u.loyaltyLevel === 'Platinum' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                        u.loyaltyLevel === 'Gold' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        u.loyaltyLevel === 'Silver' ? 'bg-slate-400/20 text-slate-300 border-slate-400/30' :
                        'bg-orange-800/20 text-orange-400 border-orange-700/30'
                      }`}>{u.loyaltyLevel}</span>
                    </td>
                    <td className="p-4 text-emerald-400 font-bold">{u.loyaltyPoints}</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">{u.discountCoupon || '—'}</td>
                    <td className="p-4 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o._id} className="glass rounded-2xl overflow-hidden">
                {/* Order Row */}
                <div
                  className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition"
                  onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-slate-400">#{o._id.slice(-8).toUpperCase()}</p>
                    <p className="font-semibold truncate">{o.user?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-400">{o.user?.email}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="font-bold text-emerald-400">₹{Number(o.totalPrice).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Payment</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${o.isPaid ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {o.isPaid ? `Paid` : 'Unpaid'}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[o.status]}`}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Date</p>
                    <p className="text-xs">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedOrder === o._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded Payment + Details */}
                {expandedOrder === o._id && (
                  <div className="border-t border-white/10 p-4 grid md:grid-cols-2 gap-6">
                    {/* Payment Details */}
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-3">Payment Details</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">Method</span><span>{o.paymentMethod}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Items Total</span><span>₹{Number(o.itemsPrice).toLocaleString('en-IN')}</span></div>
                        {o.discountAmount > 0 && (
                          <div className="flex justify-between"><span className="text-slate-400">Discount {o.couponUsed && <span className="text-emerald-400">({o.couponUsed})</span>}</span><span className="text-red-400">-₹{Number(o.discountAmount).toLocaleString('en-IN')}</span></div>
                        )}
                        <div className="flex justify-between"><span className="text-slate-400">Shipping</span><span>{o.shippingPrice === 0 ? <span className="text-emerald-400">Free</span> : `₹${o.shippingPrice}`}</span></div>
                        <div className="flex justify-between font-bold border-t border-white/10 pt-2"><span>Total Paid</span><span className="text-emerald-400">₹{Number(o.totalPrice).toLocaleString('en-IN')}</span></div>
                        {o.isPaid && o.paidAt && (
                          <div className="flex justify-between text-xs"><span className="text-slate-400">Paid At</span><span className="text-green-400">{new Date(o.paidAt).toLocaleString()}</span></div>
                        )}
                        <div className="flex justify-between text-xs"><span className="text-slate-400">Loyalty Earned</span><span className="text-yellow-400">+{o.loyaltyEarned} pts</span></div>
                      </div>

                      {/* Shipping Address */}
                      <p className="text-xs text-slate-400 uppercase font-semibold mt-4 mb-2">Shipping Address</p>
                      <div className="text-sm text-slate-300 glass rounded-xl px-3 py-2">
                        <p>{o.shippingAddress?.fullName}</p>
                        <p>{o.shippingAddress?.address}</p>
                        <p>{o.shippingAddress?.city}, {o.shippingAddress?.postalCode}</p>
                        <p>{o.shippingAddress?.country}</p>
                      </div>
                    </div>

                    {/* Items + Controls */}
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-3">Items Ordered</p>
                      <div className="space-y-2 mb-4">
                        {o.items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 glass rounded-xl px-3 py-2">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg"
                              onError={e => e.target.src = 'https://via.placeholder.com/40'} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{item.name}</p>
                              <p className="text-xs text-slate-400">×{item.qty} · ₹{Number(item.price).toLocaleString('en-IN')} each</p>
                            </div>
                            <p className="text-emerald-400 font-bold text-sm">₹{Number(item.price * item.qty).toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>

                      {/* Tracking */}
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Tracking</p>
                      <div className="flex gap-2 mb-4">
                        <input
                          value={trackingInputs[o._id] ?? (o.trackingNumber || '')}
                          onChange={e => setTrackingInputs(t => ({ ...t, [o._id]: e.target.value }))}
                          placeholder="Tracking number"
                          className="text-sm rounded-xl px-3 py-2 flex-1"
                        />
                        <button onClick={() => saveTracking(o._id)} className="btn-primary text-sm px-3">Save</button>
                      </div>

                      {/* Status Update */}
                      <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Update Status</p>
                      <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)} className="w-full rounded-xl px-3 py-2 text-sm">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'].map(s => (
                          <option key={s} value={s} className="bg-gray-900">{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── RETURNS TAB ── */}
        {tab === 'returns' && (
          <div>
            {returnOrders.length === 0 ? (
              <div className="text-center py-20 text-slate-400">No return requests</div>
            ) : (
              <div className="space-y-4">
                {returnOrders.map(o => (
                  <div key={o._id} className="glass rounded-2xl p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Order ID</p>
                        <p className="font-mono text-sm">{o._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-slate-400 mt-1">{o.user?.name} · {o.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="font-bold text-emerald-400">₹{Number(o.totalPrice).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Date</p>
                        <p className="text-sm">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[o.status]}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>
                    {o.returnReason && (
                      <div className="mt-3 text-sm glass rounded-xl px-4 py-2 text-orange-300">
                        <span className="text-slate-400">Reason: </span>{o.returnReason}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {o.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 glass rounded-xl px-3 py-2">
                          <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-lg"
                            onError={e => e.target.src = 'https://via.placeholder.com/32'} />
                          <span className="text-xs">{item.name} ×{item.qty}</span>
                        </div>
                      ))}
                    </div>
                    {o.status === 'return_requested' && (
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => handleReturnAction(o._id, 'returned')} className="btn-primary text-sm">Approve Return</button>
                        <button onClick={() => handleReturnAction(o._id, 'delivered')} className="btn-outline text-sm">Reject Return</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

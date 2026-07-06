import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  return_requested: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  returned: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export default function Orders() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnModal, setReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders/mine').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cancelOrder = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrders(o => o.map(x => x._id === id ? data : x));
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const submitReturn = async () => {
    try {
      const { data } = await api.put(`/orders/${returnModal}/return`, { reason: returnReason });
      setOrders(o => o.map(x => x._id === returnModal ? data : x));
      toast.success('Return requested');
      setReturnModal(null); setReturnReason('');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          My Orders
        </h1>
        {/* Return Modal */}
        {returnModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-bold text-lg mb-3">Request Return</h3>
              <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)}
                placeholder="Reason for return..." rows={3} className="w-full resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={submitReturn} className="btn-primary flex-1">Submit</button>
                <button onClick={() => { setReturnModal(null); setReturnReason(''); }} className="btn-outline flex-1">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <p>No orders yet. Start shopping!</p>
            <button onClick={() => navigate('/')} className="btn-primary mt-4">Shop Now</button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="glass rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-400">Order ID</p>
                    <p className="font-mono text-sm">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Date</p>
                    <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="font-bold text-emerald-400">₹{Number(order.totalPrice).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Points Earned</p>
                    <p className="text-amber-400 font-bold flex items-center gap-1">
                      +{order.loyaltyEarned}
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[order.status]}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    {['pending', 'processing'].includes(order.status) && (
                      <button onClick={() => cancelOrder(order._id)}
                        className="px-3 py-1 rounded-full text-xs font-bold border border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition">
                        Cancel
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button onClick={() => setReturnModal(order._id)}
                        className="px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition">
                        Return
                      </button>
                    )}
                  </div>
                </div>

                {/* Tracking */}
                {order.trackingNumber && (
                  <div className="mb-3 flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    <span className="text-slate-400">Tracking:</span>
                    <span className="font-mono text-emerald-400">{order.trackingNumber}</span>
                  </div>
                )}

                {/* Return reason */}
                {order.returnReason && (
                  <div className="mb-3 text-xs text-orange-400 glass rounded-lg px-3 py-2">
                    Return reason: {order.returnReason}
                  </div>
                )}

                {/* Progress bar */}
                <div className="flex items-center gap-1 mb-4">
                  {['pending','processing','shipped','delivered'].map((s, i) => {
                    const steps = ['pending','processing','shipped','delivered'];
                    const currentIdx = steps.indexOf(order.status);
                    const active = i <= currentIdx && order.status !== 'cancelled';
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${active ? 'bg-emerald-600' : 'bg-white/10'}`}>
                          {i + 1}
                        </div>
                        {i < 3 && <div className={`flex-1 h-1 ${active && i < currentIdx ? 'bg-emerald-600' : 'bg-white/10'}`} />}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 glass rounded-xl px-3 py-2">
                      <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-lg"
                        onError={e => e.target.src='https://via.placeholder.com/32'} />
                      <span className="text-xs">{item.name} ×{item.qty}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="glass rounded-xl px-3 py-2 text-xs text-slate-400">+{order.items.length - 3} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




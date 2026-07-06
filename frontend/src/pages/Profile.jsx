import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import SpinWheel from '../components/SpinWheel';
import api from '../api/axios';
import toast from 'react-hot-toast';

const MOODS = ['all','energetic','chill','luxurious','adventurous','creative','romantic'];
const LEVEL_COLORS = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#ffd700', Platinum: '#e5e4e2' };
const LEVELS = [{ name: 'Bronze', min: 0 }, { name: 'Silver', min: 500 }, { name: 'Gold', min: 2000 }, { name: 'Platinum', min: 5000 }];

export default function Profile() {
  const { user, logout, refreshProfile } = useAuthStore();
  const navigate = useNavigate();
  const [showSpin, setShowSpin] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: '', mood: 'all', password: '' });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    refreshProfile();
    api.get('/auth/profile').then(r => {
      setWishlist(r.data.wishlist || []);
      setProfileForm({ name: r.data.name, mood: r.data.mood || 'all', password: '' });
    }).catch(() => {});
  }, []);

  const saveProfile = async () => {
    try {
      await api.put('/auth/profile', { name: profileForm.name, mood: profileForm.mood, ...(profileForm.password ? { password: profileForm.password } : {}) });
      await refreshProfile();
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
  };

  if (!user) return null;

  const levelColor = LEVEL_COLORS[user.loyaltyLevel] || '#10b981';
  const nextLevel = LEVELS.find(l => l.min > user.loyaltyPoints);
  const pct = nextLevel ? Math.min(((user.loyaltyPoints - (LEVELS[LEVELS.indexOf(nextLevel) - 1]?.min || 0)) / (nextLevel.min - (LEVELS[LEVELS.indexOf(nextLevel) - 1]?.min || 0))) * 100, 100) : 100;

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass rounded-3xl p-8 mb-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black"
            style={{ background: `${levelColor}22`, border: `3px solid ${levelColor}` }}>
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-black">{user.name}</h1>
            <p className="text-slate-400">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
              <span className="font-bold" style={{ color: levelColor }}>{user.loyaltyLevel}</span>
              <span className="text-slate-400">·</span>
              <span className="text-emerald-400 font-bold">{user.loyaltyPoints.toLocaleString()} pts</span>
            </div>
            {nextLevel && (
              <div className="mt-3 max-w-xs">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: levelColor }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{nextLevel.min - user.loyaltyPoints} pts to {nextLevel.name}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {user.discountCoupon && (
              <div className="glass rounded-xl p-3 text-center border border-amber-500/30">
                <p className="text-xs text-slate-400">Your Coupon</p>
                <p className="font-mono font-black text-amber-400">{user.discountCoupon}</p>
              </div>
            )}
            <button onClick={() => setShowSpin(true)} className="btn-primary text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Daily Spin
            </button>
            <button onClick={() => { logout(); navigate('/'); }}
              className="btn-outline text-sm text-red-400 border-red-400/50 hover:bg-red-500/10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('profile')}
            className={`px-5 py-2 rounded-xl font-semibold capitalize transition flex items-center gap-2 ${tab === 'profile' ? 'bg-emerald-600 text-white' : 'glass hover:bg-white/10'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Profile
          </button>
          <button onClick={() => setTab('wishlist')}
            className={`px-5 py-2 rounded-xl font-semibold capitalize transition flex items-center gap-2 ${tab === 'wishlist' ? 'bg-emerald-600 text-white' : 'glass hover:bg-white/10'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            Wishlist ({wishlist.length})
          </button>
          <button onClick={() => navigate('/orders')}
            className="glass px-5 py-2 rounded-xl font-semibold hover:bg-white/10 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            Orders
          </button>
        </div>

        {tab === 'profile' && (
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">Account Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="text-xs text-slate-400 block mb-1">Name</label><input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} className="w-full" /></div>
              <div><label className="text-xs text-slate-400 block mb-1">Email</label><input defaultValue={user.email} disabled className="w-full opacity-60" /></div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Preferred Mood</label>
                <select value={profileForm.mood} onChange={e => setProfileForm(f => ({ ...f, mood: e.target.value }))} className="w-full">
                  {MOODS.map(m => <option key={m} value={m} className="bg-gray-900 capitalize">{m}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-slate-400 block mb-1">New Password</label><input type="password" value={profileForm.password} onChange={e => setProfileForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep" className="w-full" /></div>
            </div>
            <button className="btn-primary mt-4" onClick={saveProfile}>Save Changes</button>
          </div>
        )}

        {tab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <p>Your wishlist is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {wishlist.map(p => (
                  <div key={p._id} className="glass rounded-2xl overflow-hidden card-hover cursor-pointer"
                    onClick={() => navigate(`/product/${p._id}`)}>
                    <img src={p.images?.[0]} alt={p.name} className="w-full h-40 object-cover"
                      onError={e => e.target.src='https://via.placeholder.com/200x160'} />
                    <div className="p-3">
                      <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                      <p className="text-emerald-400 font-bold">₹{Number(p.price).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {showSpin && <SpinWheel onClose={() => setShowSpin(false)} />}
    </div>
  );
}




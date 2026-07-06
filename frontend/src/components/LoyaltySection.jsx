import useAuthStore from '../store/authStore';

const LEVELS = [
  { name: 'Bronze', min: 0, max: 500, color: '#cd7f32' },
  { name: 'Silver', min: 500, max: 2000, color: '#c0c0c0' },
  { name: 'Gold', min: 2000, max: 5000, color: '#ffd700' },
  { name: 'Platinum', min: 5000, max: 5000, color: '#e5e4e2' },
];

const LevelIcon = ({ color, size = 6 }) => (
  <svg className={`w-${size} h-${size}`} fill="none" stroke={color} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const PERKS = [
  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>, label: 'Free Shipping', level: 'Silver' },
  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>, label: 'Birthday Gift', level: 'Gold' },
  { icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>, label: 'Early Access', level: 'Gold' },
  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>, label: 'VIP Support', level: 'Platinum' },
];

export default function LoyaltySection() {
  const { user } = useAuthStore();
  const pts = user?.loyaltyPoints || 0;
  const current = LEVELS.find(l => pts < l.max || l.name === 'Platinum') || LEVELS[3];
  const next = LEVELS[LEVELS.indexOf(current) + 1];
  const pct = next ? Math.min(((pts - current.min) / (next.min - current.min)) * 100, 100) : 100;

  return (
    <section className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-3xl p-8" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.07) 100%)' }}>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                Loyalty Journey
              </h2>
              <p className="text-slate-400 mb-4">Earn points on every purchase. Unlock exclusive perks!</p>

              <div className="flex items-center gap-3 mb-3">
                <LevelIcon color={current.color} size={8} />
                <div>
                  <p className="font-bold" style={{ color: current.color }}>{current.name}</p>
                  <p className="text-2xl font-black text-emerald-400">{pts.toLocaleString()} pts</p>
                </div>
              </div>

              {next && (
                <>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${current.color}, ${next.color})` }} />
                  </div>
                  <p className="text-xs text-slate-400">{next.min - pts} pts to {next.name}</p>
                </>
              )}
            </div>

            <div className="flex gap-4">
              {LEVELS.map(l => (
                <div key={l.name} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition ${pts >= l.min ? 'glass' : 'opacity-30'}`}
                  style={{ border: pts >= l.min ? `1px solid ${l.color}44` : '1px solid transparent' }}>
                  <LevelIcon color={l.color} size={6} />
                  <span className="text-xs font-bold" style={{ color: l.color }}>{l.name}</span>
                  <span className="text-xs text-slate-400">{l.min.toLocaleString()}+</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {PERKS.map(p => {
              const req = LEVELS.find(l => l.name === p.level);
              const unlocked = pts >= req.min;
              return (
                <div key={p.label} className={`glass rounded-xl p-3 text-center ${unlocked ? '' : 'opacity-40'}`}>
                  <div className="flex justify-center mb-1 text-emerald-400">{p.icon}</div>
                  <p className="text-xs font-semibold">{p.label}</p>
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                    {unlocked ? (
                      <><svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Unlocked</>
                    ) : (
                      <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> {p.level}</>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}




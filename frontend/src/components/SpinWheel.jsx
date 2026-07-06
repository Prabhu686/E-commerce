import { useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const PRIZES = [
  { label: '5% OFF',   color: '#10b981', subColor: '#059669' },
  { label: '10% OFF',  color: '#f59e0b', subColor: '#d97706' },
  { label: '50 Pts',   color: '#10b981', subColor: '#059669' },
  { label: 'Free Ship',color: '#06b6d4', subColor: '#0891b2' },
  { label: '15% OFF',  color: '#ec4899', subColor: '#db2777' },
  { label: '100 Pts',  color: '#a855f7', subColor: '#9333ea' },
  { label: 'Try Again',color: '#475569', subColor: '#334155' },
  { label: '20% OFF',  color: '#ef4444', subColor: '#dc2626' },
];

const TOTAL = PRIZES.length;
const ARC = (2 * Math.PI) / TOTAL;

export default function SpinWheel({ onClose }) {
  const canvasRef = useRef(null);
  const angleRef = useRef(-Math.PI / 2); // start so first segment is at top
  const rafRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const { spin, user } = useAuthStore();

  useEffect(() => {
    draw(angleRef.current);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const draw = (rotation) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const outerR = cx - 6;
    const innerR = outerR - 4;

    ctx.clearRect(0, 0, W, H);

    // Outer decorative ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 4, 0, 2 * Math.PI);
    const ringGrad = ctx.createLinearGradient(0, 0, W, H);
    ringGrad.addColorStop(0, '#10b981');
    ringGrad.addColorStop(0.5, '#a855f7');
    ringGrad.addColorStop(1, '#ec4899');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Segments
    PRIZES.forEach((p, i) => {
      const start = rotation + i * ARC;
      const end = start + ARC;
      const mid = start + ARC / 2;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, innerR, start, end);
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
      grad.addColorStop(0.3, p.subColor);
      grad.addColorStop(1, p.color);
      ctx.fillStyle = grad;
      ctx.fill();

      // Segment border
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, innerR, start, end);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.font = `bold ${innerR > 120 ? 13 : 11}px Inter, sans-serif`;
      ctx.fillText(p.label, innerR - 14, 5);
      ctx.restore();
    });

    // Center hub
    const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
    hubGrad.addColorStop(0, '#1e1b4b');
    hubGrad.addColorStop(1, '#0f0f1a');
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hub dot
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#10b981';
    ctx.fill();
  };

  const spinWheel = async () => {
    if (spinning || !user) return;
    setSpinning(true);
    setResult(null);

    let prizeData;
    try {
      prizeData = await spin(); // call API first to get the real prize
    } catch (err) {
      const msg = err?.response?.data?.message || 'Already spun today!';
      toast.error(msg);
      setAlreadySpun(true);
      setSpinning(false);
      return;
    }

    // Find which index the backend prize corresponds to
    const prizeLabel = prizeData.prize.label;
    // Backend labels: '5% OFF','10% OFF','50 Points','Free Ship','15% OFF','100 Points','Try Again','20% OFF'
    // Frontend labels: '5% OFF','10% OFF','50 Pts','Free Ship','15% OFF','100 Pts','Try Again','20% OFF'
    const labelMap = { '50 Points': '50 Pts', '100 Points': '100 Pts' };
    const displayLabel = labelMap[prizeLabel] || prizeLabel;
    const prizeIndex = PRIZES.findIndex(p => p.label === displayLabel);
    const targetIdx = prizeIndex === -1 ? 0 : prizeIndex;

    // Calculate target angle: we want targetIdx segment centered under the pointer (top = -PI/2)
    // Segment center angle = targetIdx * ARC + ARC/2
    // We need rotation such that: rotation + targetIdx*ARC + ARC/2 = -PI/2 (mod 2PI)
    // So: rotation = -PI/2 - targetIdx*ARC - ARC/2
    const targetRotation = -Math.PI / 2 - targetIdx * ARC - ARC / 2;
    // Add multiple full spins for effect (5-8 full rotations)
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
    // Normalize current angle
    const currentAngle = angleRef.current;
    // Final angle must land on targetRotation, approached from current + fullSpins
    const finalAngle = targetRotation - fullSpins * Math.sign(1) + Math.ceil((currentAngle - targetRotation + fullSpins) / (2 * Math.PI)) * 2 * Math.PI;
    // Simpler: just go forward enough full rotations to land on target
    const spinsToAdd = fullSpins;
    const rawTarget = targetRotation;
    // Ensure we always spin forward: final = current + spinsToAdd, adjusted to land on rawTarget
    const diff = ((rawTarget - currentAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const finalAngleClean = currentAngle + spinsToAdd + diff;

    const duration = 5000;
    const startTime = performance.now();
    const startAngle = currentAngle;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startAngle + (finalAngleClean - startAngle) * ease;
      angleRef.current = current;
      draw(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        angleRef.current = finalAngleClean;
        draw(finalAngleClean);
        setResult(prizeData.prize);
        toast.success(`You won: ${prizeData.prize.label}!`, { duration: 4000 });
        setSpinning(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1040 50%, #0f0f1a 100%)' }}>

          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative px-8 pt-8 pb-4 text-center">
            <button onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="inline-flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Daily Reward</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-1">Spin to Win</h2>
            <p className="text-slate-500 text-sm">One spin per day — try your luck!</p>
          </div>

          {/* Wheel area */}
          <div className="relative flex items-center justify-center px-8 py-4">
            {/* Pointer */}
            <div className="absolute top-2 left-1/2 z-20" style={{ transform: 'translateX(-50%)' }}>
              <div className="w-0 h-0" style={{
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '22px solid #10b981',
                filter: 'drop-shadow(0 2px 6px rgba(16,185,129,0.8))',
              }} />
            </div>

            {/* Outer glow ring */}
            <div className="absolute rounded-full pointer-events-none"
              style={{
                width: 'calc(100% - 32px)', aspectRatio: '1',
                background: 'transparent',
                boxShadow: spinning ? '0 0 40px rgba(16,185,129,0.4), 0 0 80px rgba(16,185,129,0.07)' : '0 0 20px rgba(16,185,129,0.15)',
                borderRadius: '50%',
                transition: 'box-shadow 0.3s',
              }} />

            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="rounded-full"
              style={{ maxWidth: '100%' }}
            />
          </div>

          {/* Bottom section */}
          <div className="px-8 pb-8 pt-2">
            {result ? (
              <div className="rounded-2xl border border-emerald-500/40 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.07))' }}>
                <div className="p-5 text-center">
                  <div className="w-12 h-12 bg-emerald-600/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                  </div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">You won</p>
                  <p className="text-3xl font-black text-white mb-2">{result.label}</p>
                  {result.coupon && (
                    <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-2 mt-1">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      <span className="font-mono font-black text-amber-400 tracking-widest">{result.coupon}</span>
                    </div>
                  )}
                  {result.type === 'points' && (
                    <p className="text-sm text-slate-400 mt-2">Points added to your account</p>
                  )}
                </div>
                <div className="border-t border-white/8 px-5 py-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Come back tomorrow for another spin</span>
                  <button onClick={onClose} className="btn-primary text-xs px-4 py-2">Done</button>
                </div>
              </div>
            ) : alreadySpun ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
                <svg className="w-8 h-8 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-bold text-amber-400">Already spun today</p>
                <p className="text-xs text-slate-500 mt-1">Come back tomorrow for your next spin</p>
              </div>
            ) : (
              <div className="space-y-3">
                {!user ? (
                  <p className="text-center text-sm text-slate-500 py-2">
                    <span className="text-emerald-400 font-semibold">Login</span> to spin and save your prize
                  </p>
                ) : null}
                <button
                  onClick={spinWheel}
                  disabled={spinning || !user}
                  className="w-full py-4 rounded-2xl font-black text-base text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  style={{
                    background: spinning ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg, #10b981, #a855f7)',
                    boxShadow: spinning ? 'none' : '0 8px 32px rgba(16,185,129,0.4)',
                  }}>
                  {spinning ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Spinning...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Spin the Wheel
                    </span>
                  )}
                </button>

                {/* Prize legend */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {PRIZES.map(p => (
                    <div key={p.label} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: `${p.color}18`, border: `1px solid ${p.color}30` }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <span className="text-xs text-slate-300 truncate">{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




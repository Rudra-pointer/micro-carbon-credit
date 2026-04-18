import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import CreditOrb from '../components/3d/CreditOrb';

// ── Mock Data ───────────────────────────────────────────
const mockHistory = [
  { month: '2025-12', unitsSaved: 40, savingPct: 12.1, streak: 5, credits: 42.5, grade: 'B', fanHrs: 533, phones: 2000, co2: 32.8, base: 20, bonus: 6.05, mult: 1.2 },
  { month: '2025-11', unitsSaved: 50, savingPct: 16.1, streak: 4, credits: 55.2, grade: 'A', fanHrs: 667, phones: 2500, co2: 41, base: 25, bonus: 8.05, mult: 1.2 },
  { month: '2025-10', unitsSaved: 50, savingPct: 14.3, streak: 3, credits: 48.0, grade: 'B', fanHrs: 667, phones: 2500, co2: 41, base: 25, bonus: 7.15, mult: 1.2 },
  { month: '2025-09', unitsSaved: 40, savingPct: 10.5, streak: 2, credits: 25.3, grade: 'B', fanHrs: 533, phones: 2000, co2: 32.8, base: 20, bonus: 5.25, mult: 1.0 },
  { month: '2025-08', unitsSaved: 40, savingPct: 10.3, streak: 1, credits: 25.1, grade: 'B', fanHrs: 533, phones: 2000, co2: 32.8, base: 20, bonus: 5.15, mult: 1.0 },
  { month: '2025-07', unitsSaved: 30, savingPct: 7.3, streak: 0, credits: 18.7, grade: 'C', fanHrs: 400, phones: 1500, co2: 24.6, base: 15, bonus: 3.65, mult: 1.0 },
  { month: '2025-06', unitsSaved: -10, savingPct: -2.1, streak: 0, credits: 0, grade: 'D', fanHrs: 0, phones: 0, co2: 0, base: 0, bonus: 0, mult: 1.0 },
  { month: '2025-05', unitsSaved: 60, savingPct: 11.8, streak: 2, credits: 35.9, grade: 'B', fanHrs: 800, phones: 3000, co2: 49.2, base: 30, bonus: 5.9, mult: 1.0 },
];

const mockRedemptions = [
  { date: '2025-12-05', credits: 200, amount: 20, status: 'completed' },
  { date: '2025-11-18', credits: 100, amount: 10, status: 'completed' },
  { date: '2025-10-02', credits: 100, amount: 10, status: 'pending' },
];

const badges = [
  { name: '3-Month Streak', icon: '🔥', unlocked: true, progress: 100 },
  { name: 'Top 10% Saver', icon: '🏆', unlocked: true, progress: 100 },
  { name: 'Solar User', icon: '☀️', unlocked: false, progress: 0 },
  { name: '100kg CO₂ Offset', icon: '🌍', unlocked: false, progress: 72 },
];

const leaderboard = [
  { rank: 1, name: 'Anonymous ★★★', credits: 1240 },
  { rank: 2, name: 'Anonymous ★★', credits: 1180 },
  { rank: 3, name: 'Anonymous ★', credits: 1050 },
];

const TOTAL_CREDITS = 850;
const TOTAL_REDEEMED = 400;
const AVAILABLE = TOTAL_CREDITS - TOTAL_REDEEMED;
const NEXT_MILESTONE = 500;

const StatusBadge = ({ status }) => {
  const colors = { completed: 'bg-green-500/20 text-green-400', pending: 'bg-yellow-500/20 text-yellow-400', failed: 'bg-red-500/20 text-red-400' };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors[status]}`}>{status}</span>;
};

const GradeColor = (g) => {
  if (g === 'A+' || g === 'A') return 'text-green-400';
  if (g === 'B') return 'text-blue-400';
  if (g === 'C') return 'text-yellow-400';
  return 'text-red-400';
};

export default function Credits() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [redeemCredits, setRedeemCredits] = useState(100);
  const [upiId, setUpiId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const upiValid = /^[a-zA-Z0-9.]+@[a-zA-Z0-9]+$/.test(upiId);

  const handleRedeem = () => {
    setShowConfirm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-white p-8 font-sans">
      <Link to="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors w-max">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </Link>

      {/* Conversion Info */}
      <div className="glass-card rounded-lg px-4 py-2 mb-8 text-center text-sm text-theme-teal border border-theme-teal/30 max-w-md mx-auto">
        💡 Conversion Rate: <strong>100 Credits = ₹10</strong>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* ── LEFT (2 cols): Wallet + History ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* WALLET OVERVIEW */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48 flex-shrink-0">
                <Canvas camera={{ position: [0, 0, 4] }}>
                  <ambientLight intensity={1} />
                  <pointLight position={[5, 5, 5]} intensity={0.5} color="#00D4AA" />
                  <CreditOrb credits={AVAILABLE} />
                </Canvas>
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Available Balance</p>
                <h2 className="text-5xl font-black text-theme-green neon-text">{AVAILABLE.toFixed(1)}</h2>
                <p className="text-gray-300 mt-1">= <strong className="text-white text-xl">₹{(AVAILABLE / 10).toFixed(2)}</strong></p>
                <p className="text-xs text-gray-500 mt-1">Total Earned: {TOTAL_CREDITS} · Redeemed: {TOTAL_REDEEMED}</p>
                {/* Progress to milestone */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{AVAILABLE} / {NEXT_MILESTONE} credits</span>
                    <span>₹{NEXT_MILESTONE / 10} milestone</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-theme-green to-theme-teal rounded-full transition-all" style={{ width: `${Math.min((AVAILABLE / NEXT_MILESTONE) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CREDITS HISTORY TABLE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10"><h3 className="text-xl font-bold">Credit History</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-gray-400 text-xs uppercase border-b border-white/5">
                  <th className="px-6 py-3 text-left">Month</th><th className="px-4 py-3">Units Saved</th><th className="px-4 py-3">Saving %</th><th className="px-4 py-3">Streak</th><th className="px-4 py-3">Credits</th><th className="px-4 py-3">Grade</th>
                </tr></thead>
                <tbody>
                  {mockHistory.map((r, i) => {
                    const rowColor = r.unitsSaved > 0 ? 'hover:bg-green-500/5' : r.unitsSaved < 0 ? 'hover:bg-red-500/5 bg-red-500/[0.02]' : 'hover:bg-white/5';
                    const isExpanded = expandedRow === i;
                    return (
                      <React.Fragment key={i}>
                        <tr onClick={() => setExpandedRow(isExpanded ? null : i)} className={`border-b border-white/5 cursor-pointer transition-colors ${rowColor}`}>
                          <td className="px-6 py-4 font-medium">{r.month}</td>
                          <td className={`px-4 py-4 text-center font-bold ${r.unitsSaved > 0 ? 'text-green-400' : r.unitsSaved < 0 ? 'text-red-400' : 'text-gray-400'}`}>{r.unitsSaved > 0 ? '+' : ''}{r.unitsSaved} kWh</td>
                          <td className="px-4 py-4 text-center">{r.savingPct}%</td>
                          <td className="px-4 py-4 text-center">{r.streak > 0 ? `${r.streak} 🔥` : '—'}</td>
                          <td className="px-4 py-4 text-center font-bold text-theme-teal">{r.credits}</td>
                          <td className={`px-4 py-4 text-center font-black ${GradeColor(r.grade)}`}>{r.grade}</td>
                        </tr>
                        <AnimatePresence>
                          {isExpanded && (
                            <tr><td colSpan={6}>
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="p-6 bg-white/[0.02] grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                  <div className="glass-card p-3 rounded-xl"><p className="text-gray-400">Base Credits</p><p className="text-lg font-bold">{r.base}</p></div>
                                  <div className="glass-card p-3 rounded-xl"><p className="text-gray-400">Bonus Credits</p><p className="text-lg font-bold">{r.bonus}</p></div>
                                  <div className="glass-card p-3 rounded-xl"><p className="text-gray-400">Multiplier</p><p className="text-lg font-bold">×{r.mult}</p></div>
                                  <div className="glass-card p-3 rounded-xl"><p className="text-gray-400">🌀 Fan Hours</p><p className="text-lg font-bold">{r.fanHrs.toLocaleString()}</p></div>
                                  <div className="glass-card p-3 rounded-xl"><p className="text-gray-400">📱 Phone Charges</p><p className="text-lg font-bold">{r.phones.toLocaleString()}</p></div>
                                  <div className="glass-card p-3 rounded-xl"><p className="text-gray-400">🌍 CO₂ Offset</p><p className="text-lg font-bold">{r.co2} kg</p></div>
                                </div>
                              </motion.div>
                            </td></tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* GAMIFICATION */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            {/* Badges */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Achievements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((b, i) => (
                  <div key={i} className={`glass-card p-4 rounded-xl text-center transition-transform hover:-translate-y-1 ${b.unlocked ? '' : 'opacity-40 grayscale'}`}>
                    <div className="text-4xl mb-2">{b.icon}</div>
                    <p className="text-sm font-semibold">{b.name}</p>
                    {!b.unlocked && <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-theme-teal rounded-full" style={{ width: `${b.progress}%` }} /></div>}
                    {!b.unlocked && <p className="text-xs text-gray-500 mt-1">{b.progress}%</p>}
                  </div>
                ))}
              </div>
            </div>
            {/* Leaderboard */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Mumbai Leaderboard</h3>
              <p className="text-gray-400 text-sm mb-4">You rank <strong className="text-theme-green">#47</strong> in Mumbai this month</p>
              <div className="space-y-2">
                {leaderboard.map(l => (
                  <div key={l.rank} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03]">
                    <span className="text-2xl w-10 text-center">{l.rank === 1 ? '👑' : l.rank === 2 ? '🥈' : '🥉'}</span>
                    <span className="flex-1 font-medium">{l.name}</span>
                    <span className="text-theme-green font-bold">{l.credits} MCC</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT: Redemption Panel ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sticky top-8">
            <h3 className="text-xl font-bold mb-6">Withdraw Credits</h3>
            <div className="glass-card rounded-lg px-3 py-2 mb-6 text-xs text-center text-theme-teal border border-theme-teal/20">100 Credits = ₹10</div>

            <label className="block text-sm text-gray-400 mb-2">Credits to Redeem</label>
            <input type="range" min={100} max={Math.floor(AVAILABLE / 100) * 100} step={100} value={redeemCredits} onChange={e => setRedeemCredits(Number(e.target.value))} className="w-full accent-emerald-500 mb-2" />
            <div className="flex justify-between text-sm mb-6">
              <span className="text-gray-400">{redeemCredits} credits</span>
              <span className="text-theme-green font-bold">= ₹{(redeemCredits / 10).toFixed(0)}</span>
            </div>

            <label className="block text-sm text-gray-400 mb-2">UPI ID</label>
            <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" className={`w-full bg-black/50 border rounded-lg px-4 py-3 mb-1 outline-none transition-colors ${upiId && !upiValid ? 'border-red-500' : 'border-white/20 focus:border-theme-green'}`} />
            {upiId && !upiValid && <p className="text-red-400 text-xs mb-4">Enter a valid UPI ID (e.g. name@bank)</p>}
            {upiValid && <p className="text-green-400 text-xs mb-4">✓ Valid UPI ID</p>}

            <button disabled={!upiValid || redeemCredits > AVAILABLE} onClick={() => setShowConfirm(true)} className="w-full py-3 bg-theme-green text-black font-bold rounded-lg neon-glow hover:bg-opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Withdraw ₹{(redeemCredits / 10).toFixed(0)} Now
            </button>

            {/* Redemption History */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-sm font-bold text-gray-300 mb-4">Redemption History</h4>
              <div className="space-y-3">
                {mockRedemptions.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white/[0.03] rounded-lg p-3">
                    <div><p className="font-medium">{r.date}</p><p className="text-gray-500">{r.credits} credits</p></div>
                    <div className="text-right"><p className="font-bold">₹{r.amount}</p><StatusBadge status={r.status} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="glass-card rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Confirm Withdrawal</h3>
              <p className="text-gray-300 mb-2">You are redeeming <strong className="text-theme-green">{redeemCredits} credits</strong></p>
              <p className="text-3xl font-black text-white mb-2">₹{(redeemCredits / 10).toFixed(0)}</p>
              <p className="text-gray-400 text-sm mb-6">To UPI: <strong>{upiId}</strong></p>
              <div className="flex gap-4">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleRedeem} className="flex-1 py-3 bg-theme-green text-black font-bold rounded-lg neon-glow">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.6 }} className="text-8xl mb-6">🎉</motion.div>
              <h2 className="text-3xl font-black text-theme-green mb-2 neon-text">Withdrawal Successful!</h2>
              <p className="text-xl text-white mb-2">₹{(redeemCredits / 10).toFixed(0)} will be credited to your UPI</p>
              <p className="text-gray-400">within 2-3 business days</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

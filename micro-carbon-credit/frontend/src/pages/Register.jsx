import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', confirm: '', consumer_number: '', discom_name: 'MSEDCL', household_size: 1 });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const pwMatch = form.password === form.confirm && form.password.length >= 6;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { window.location.href = '/login'; }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black text-[#00FF88] inline-flex items-center gap-2">⚡ MicroCarbon</Link>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-6 justify-center">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${step >= s ? 'w-16 bg-[#00FF88]' : 'w-8 bg-white/10'}`} />
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
          className="rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@example.com"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00FF88] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password</label>
                  <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Min 6 characters"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00FF88] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
                  <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required placeholder="Re-enter password"
                    className={`w-full bg-black/50 border rounded-lg px-4 py-3 text-white outline-none transition-colors ${form.confirm && !pwMatch ? 'border-red-500' : 'border-white/20 focus:border-[#00FF88]'}`} />
                </div>
                <button type="button" onClick={() => setStep(2)} disabled={!pwMatch || !form.email}
                  className="w-full py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-30">Next →</button>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">DISCOM Provider</label>
                  <select value={form.discom_name} onChange={e => set('discom_name', e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00FF88]">
                    <option value="MSEDCL">MSEDCL (Maharashtra)</option>
                    <option value="BESCOM">BESCOM (Karnataka)</option>
                    <option value="TPDDL">TPDDL (Delhi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Consumer Number</label>
                  <input type="text" value={form.consumer_number} onChange={e => set('consumer_number', e.target.value)} placeholder="From your electricity bill"
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00FF88] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Household Size</label>
                  <input type="number" min={1} max={20} value={form.household_size} onChange={e => set('household_size', Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00FF88] transition-colors" />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5">← Back</button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex justify-center">
                    {loading ? <span className="animate-spin inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full" /> : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account? <Link to="/login" className="text-[#00FF88] font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

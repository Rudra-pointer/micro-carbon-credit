import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('access_token', 'mock_token_xyz');
      if (remember) localStorage.setItem('refresh_token', 'mock_refresh_xyz');
      window.location.href = '/dashboard';
    }, 1500);
  };

  const handleForgotSubmit = () => {
    if (!otpSent) { setOtpSent(true); return; }
    alert('Password reset successful (mock). You can now login.');
    setShowForgot(false); setOtpSent(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black text-[#00FF88] inline-flex items-center gap-2">⚡ MicroCarbon</Link>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
          className="rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00FF88] transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00FF88] transition-colors" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4" /> Remember me
              </label>
              <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-[#00D4AA] hover:underline">Forgot password?</button>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#00FF88] text-black font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex justify-center">
              {loading ? <span className="animate-spin inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full" /> : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account? <Link to="/register" className="text-[#00FF88] font-bold hover:underline">Sign Up</Link>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowForgot(false); setOtpSent(false); }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)' }}
              className="rounded-2xl p-8 max-w-sm w-full text-white">
              <h3 className="text-xl font-bold mb-4">{otpSent ? 'Enter OTP' : 'Forgot Password'}</h3>
              {!otpSent ? (
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Your email"
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#00D4AA]" />
              ) : (
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6}
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#00D4AA] text-center tracking-[0.5em] text-xl" />
              )}
              <button onClick={handleForgotSubmit} className="w-full py-3 bg-[#00FF88] text-black font-bold rounded-lg">
                {otpSent ? 'Verify & Reset' : 'Send OTP'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

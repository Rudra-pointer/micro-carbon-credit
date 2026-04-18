import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Mock admin state — in production, derive from auth store
const IS_ADMIN = true;

const mockStats = { total_users: 1247, credits_issued: 18340.5, pending_payouts: 23, kwh_saved: 94200 };

const mockUsers = [
  { id: 1, email: 'rudra@example.com', consumer_number: '00012345', discom_name: 'MSEDCL', total_credits: 850, is_active: true, last_bill_date: '2025-12-05' },
  { id: 2, email: 'priya@example.com', consumer_number: '00067890', discom_name: 'BESCOM', total_credits: 620, is_active: true, last_bill_date: '2025-12-01' },
  { id: 3, email: 'arjun@example.com', consumer_number: '00011223', discom_name: 'TPDDL', total_credits: 430, is_active: false, last_bill_date: '2025-11-20' },
  { id: 4, email: 'meena@example.com', consumer_number: '00044556', discom_name: 'MSEDCL', total_credits: 290, is_active: true, last_bill_date: '2025-12-03' },
  { id: 5, email: 'kiran@example.com', consumer_number: '00078901', discom_name: 'BESCOM', total_credits: 150, is_active: false, last_bill_date: null },
];

const mockRedemptions = [
  { id: 1, user_email: 'rudra@example.com', credits_redeemed: 200, amount_inr: 20, upi_id: 'rudra@upi', status: 'pending', created_at: '2025-12-08' },
  { id: 2, user_email: 'priya@example.com', credits_redeemed: 100, amount_inr: 10, upi_id: 'priya@upi', status: 'pending', created_at: '2025-12-07' },
  { id: 3, user_email: 'arjun@example.com', credits_redeemed: 300, amount_inr: 30, upi_id: 'arjun@upi', status: 'completed', created_at: '2025-12-01' },
  { id: 4, user_email: 'meena@example.com', credits_redeemed: 100, amount_inr: 10, upi_id: 'meena@upi', status: 'failed', created_at: '2025-11-28' },
];

const StatusBadge = ({ status }) => {
  const c = { pending: 'bg-yellow-500/20 text-yellow-400', completed: 'bg-green-500/20 text-green-400', failed: 'bg-red-500/20 text-red-400' };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${c[status] || 'bg-gray-500/20 text-gray-400'}`}>{status}</span>;
};

export default function Admin() {
  const [search, setSearch] = useState('');
  const [rdFilter, setRdFilter] = useState('pending');
  const [activeTab, setActiveTab] = useState('users');
  const [issueModal, setIssueModal] = useState(null); // user obj or null
  const [issueAmt, setIssueAmt] = useState('');

  if (!IS_ADMIN) return <Navigate to="/login" replace />;

  const filteredUsers = mockUsers.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.consumer_number && u.consumer_number.includes(search))
  );

  const filteredRedemptions = mockRedemptions.filter(r =>
    rdFilter === 'all' ? true : r.status === rdFilter
  );

  const stats = [
    { label: 'Total Users', value: mockStats.total_users.toLocaleString(), icon: '👥', color: 'text-blue-400' },
    { label: 'Credits Issued (Month)', value: mockStats.credits_issued.toLocaleString(), icon: '💎', color: 'text-theme-teal' },
    { label: 'Pending Payouts', value: mockStats.pending_payouts, icon: '⏳', color: 'text-yellow-400' },
    { label: 'Total kWh Saved', value: mockStats.kwh_saved.toLocaleString(), icon: '⚡', color: 'text-theme-green' },
  ];

  return (
    <div className="min-h-screen bg-theme-bg text-white p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-400 mt-1">Platform overview and management</p>
        </div>
        <Link to="/dashboard" className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-all text-sm">← Back to Dashboard</Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{s.label}</span>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-white/10 mb-6">
        {['users', 'redemptions'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`pb-3 px-2 font-bold capitalize transition-colors ${activeTab === t ? 'text-theme-green border-b-2 border-theme-green' : 'text-gray-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-wrap gap-4 items-center justify-between">
            <h3 className="text-xl font-bold">User Management</h3>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email or consumer no…"
              className="bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-sm w-64 outline-none focus:border-theme-green transition-colors" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 text-xs uppercase border-b border-white/5">
                <th className="px-6 py-3 text-left">User</th><th className="px-4 py-3">Consumer No</th>
                <th className="px-4 py-3">DISCOM</th><th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3">Status</th><th className="px-4 py-3">Last Bill</th><th className="px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 font-medium">{u.email}</td>
                    <td className="px-4 py-4 text-center text-gray-300">{u.consumer_number || '—'}</td>
                    <td className="px-4 py-4 text-center">{u.discom_name}</td>
                    <td className="px-4 py-4 text-center font-bold text-theme-teal">{u.total_credits}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-400 text-xs">{u.last_bill_date || '—'}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button className="px-2 py-1 text-xs border border-white/20 rounded hover:bg-white/10 transition-colors">Bills</button>
                        {!u.is_active && <button className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">Verify</button>}
                        <button onClick={() => setIssueModal(u)} className="px-2 py-1 text-xs bg-theme-teal/20 text-theme-teal rounded hover:bg-theme-teal/30 transition-colors">Issue</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
            <span>Showing {filteredUsers.length} of {mockUsers.length} users</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-white/20 rounded hover:bg-white/5">← Prev</button>
              <span className="px-3 py-1 bg-theme-green/20 text-theme-green rounded">1</span>
              <button className="px-3 py-1 border border-white/20 rounded hover:bg-white/5">Next →</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* REDEMPTIONS TAB */}
      {activeTab === 'redemptions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-wrap gap-4 items-center justify-between">
            <h3 className="text-xl font-bold">Redemptions</h3>
            <div className="flex gap-2">
              {['pending', 'completed', 'failed', 'all'].map(s => (
                <button key={s} onClick={() => setRdFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors ${rdFilter === s ? 'bg-theme-green/20 text-theme-green' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 text-xs uppercase border-b border-white/5">
                <th className="px-6 py-3 text-left">User</th><th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">UPI ID</th><th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {filteredRedemptions.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 font-medium">{r.user_email}</td>
                    <td className="px-4 py-4 text-center"><span className="font-bold">₹{r.amount_inr}</span><br/><span className="text-xs text-gray-500">{r.credits_redeemed} credits</span></td>
                    <td className="px-4 py-4 text-center text-gray-300">{r.upi_id}</td>
                    <td className="px-4 py-4 text-center text-gray-400 text-xs">{r.created_at}</td>
                    <td className="px-4 py-4 text-center"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-4 text-center">
                      {r.status === 'pending' && (
                        <div className="flex gap-2 justify-center">
                          <button className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors font-bold">✓ Paid</button>
                          <button className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors font-bold">✗ Fail</button>
                        </div>
                      )}
                      {r.status !== 'pending' && <span className="text-gray-500 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Issue Credits Modal */}
      <AnimatePresence>
        {issueModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIssueModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="glass-card rounded-2xl p-8 max-w-md w-full border border-white/20">
              <h3 className="text-xl font-bold mb-4">Issue Credits</h3>
              <p className="text-gray-400 text-sm mb-6">To: <strong className="text-white">{issueModal.email}</strong></p>
              <label className="block text-sm text-gray-400 mb-1">Amount</label>
              <input type="number" value={issueAmt} onChange={e => setIssueAmt(e.target.value)} placeholder="e.g. 50"
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 mb-4 outline-none focus:border-theme-green" />
              <div className="flex gap-4">
                <button onClick={() => setIssueModal(null)} className="flex-1 py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={() => { alert(`Issued ${issueAmt} credits to ${issueModal.email}`); setIssueModal(null); setIssueAmt(''); }}
                  className="flex-1 py-3 bg-theme-green text-black font-bold rounded-lg neon-glow">Issue</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

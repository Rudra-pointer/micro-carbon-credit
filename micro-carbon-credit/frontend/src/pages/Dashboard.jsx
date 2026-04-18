import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ReferenceDot 
} from 'recharts';
import CreditOrb from '../components/3d/CreditOrb';

// ── Mock Data ──────────────────────────────────────────────────
const mockTimelineData = [
  { month: 'Jan', currentYear: 320, lastYear: 350 },
  { month: 'Feb', currentYear: 280, lastYear: 340 },
  { month: 'Mar', currentYear: 310, lastYear: 380 },
  { month: 'Apr', currentYear: 390, lastYear: 420 },
  { month: 'May', currentYear: 450, lastYear: 510 }, // Summer Peak
  { month: 'Jun', currentYear: 420, lastYear: 480 },
  { month: 'Jul', currentYear: 380, lastYear: 410 },
  { month: 'Aug', currentYear: 350, lastYear: 390 },
  { month: 'Sep', currentYear: 340, lastYear: 380 },
  { month: 'Oct', currentYear: 300, lastYear: 350 },
  { month: 'Nov', currentYear: 260, lastYear: 310 }, // Best Month
  { month: 'Dec', currentYear: 290, lastYear: 330 },
];

const Sidebar = () => {
  const location = useLocation();
  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Upload Bill', path: '/upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    { name: 'Credits', path: '/credits', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="w-64 bg-white bg-opacity-5 backdrop-blur-xl border-r border-white border-opacity-10 min-h-screen flex flex-col p-6 flex-shrink-0">
      <Link to="/" className="text-2xl font-bold text-theme-green mb-12 flex items-center gap-2">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        MicroCarbon
      </Link>
      
      <nav className="flex-1 space-y-2">
        {links.map(link => {
          const isActive = location.pathname.includes(link.path.split('/')[1]);
          return (
            <Link 
              key={link.name} 
              to={link.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-theme-green bg-opacity-20 text-theme-green border border-theme-green border-opacity-50' : 'text-gray-400 hover:bg-white hover:bg-opacity-5 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} /></svg>
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white border-opacity-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-theme-green to-theme-teal flex items-center justify-center text-black font-bold">
          R
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Rudra Narayan</p>
          <p className="text-xs text-theme-teal">Premium User</p>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const [animatedCredits, setAnimatedCredits] = useState(0);

  useEffect(() => {
    // Simulate credit load
    setTimeout(() => setAnimatedCredits(42.5), 500);
  }, []);

  return (
    <div className="flex min-h-screen bg-theme-bg text-white font-sans overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, Rudra!</h1>
            <p className="text-gray-400 mt-1">Here is your energy saving impact.</p>
          </div>
          <Link to="/upload" className="px-6 py-2 bg-theme-green text-black font-semibold rounded-lg neon-glow hover:bg-opacity-90 transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add Bill
          </Link>
        </header>

        {/* SECTION A: This Month's Summary */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Consumed This Month", value: "290", unit: "kWh", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "text-blue-400" },
            { title: "Saved vs Last Year", value: "40", unit: "kWh", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "text-theme-green", positive: true },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-400 text-sm font-medium">{item.title}</h3>
                <svg className={`w-5 h-5 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/></svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${item.positive ? 'text-theme-green' : 'text-white'}`}>{item.value}</span>
                <span className="text-gray-400">{item.unit}</span>
              </div>
            </motion.div>
          ))}

          {/* Card 3: Credits Earned this month (3D Canvas) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform relative overflow-hidden"
          >
            <h3 className="text-gray-400 text-sm font-medium mb-2 relative z-10">Credits Earned (Dec)</h3>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 z-0 opacity-80">
              <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={1} />
                <CreditOrb credits={animatedCredits} newCredits={true} />
              </Canvas>
            </div>
            <div className="relative z-10 mt-6">
              <span className="text-4xl font-black text-theme-teal">42.5</span>
              <span className="text-theme-teal ml-1 text-sm font-bold uppercase">MCC</span>
            </div>
          </motion.div>

          {/* Card 4: Running Total */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform bg-gradient-to-br from-white/5 to-theme-green/5"
          >
            <h3 className="text-gray-400 text-sm font-medium mb-4">Total Balance</h3>
            <div className="text-4xl font-black text-[#FFD700] neon-text">850.0</div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-10 flex justify-between items-center">
              <span className="text-sm text-gray-400">Equivalent to</span>
              <span className="text-lg font-bold text-green-400">₹85.00</span>
            </div>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* SECTION C: 12-Month Consumption Timeline */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-card p-6 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">12-Month Consumption Tracker</h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-theme-green"></span> This Year</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-500"></span> Last Year</div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00FF88" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0F1E', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="lastYear" stroke="#6b7280" strokeWidth={2} fillOpacity={1} fill="url(#colorLast)" />
                  <Area type="monotone" dataKey="currentYear" stroke="#00FF88" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
                  {/* Annotations using ReferenceDot */}
                  <ReferenceDot x="May" y={450} r={5} fill="#ef4444" stroke="none" />
                  <ReferenceDot x="Nov" y={260} r={5} fill="#00FF88" stroke="none" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-between px-10 text-xs text-gray-400 mt-2">
                <span><span className="text-red-400">●</span> Summer Peak</span>
                <span><span className="text-theme-green">●</span> Best Savings Month</span>
              </div>
            </div>
          </motion.div>

          {/* SECTION B: Efficiency Grade */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
            className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center relative"
          >
            <h3 className="text-lg font-medium text-gray-300 mb-2">Efficiency Grade</h3>
            
            <div className="relative w-48 h-48 my-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: 23 }, { value: 77 }]}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={90}
                    startAngle={90} endAngle={-270}
                    dataKey="value" stroke="none"
                  >
                    <Cell fill="#00FF88" />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-6xl font-black text-theme-green neon-text">A+</span>
              </div>
            </div>

            <p className="text-sm text-gray-400 max-w-[200px]">
              You are in the <strong className="text-theme-green">top 23%</strong> of households in Mumbai
            </p>
          </motion.div>
        </div>

        {/* SECTION D: Tangible Equivalents */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-4">Your impact this month =</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Ceiling Fan Hours", val: 533, icon: "M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z", color: "text-blue-300" },
              { label: "Smartphone Charges", val: 2000, icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z", color: "text-theme-teal" },
              { label: "kg CO₂ Offset", val: 32.8, icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-green-500" },
            ].map((item, i) => (
              <div key={i} className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform group">
                <div className={`p-4 rounded-xl bg-white bg-opacity-5 ${item.color} group-hover:bg-opacity-10 transition-colors`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon}/></svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{item.val.toLocaleString()}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </main>
    </div>
  );
}

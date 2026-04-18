import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion, useInView } from 'framer-motion';
import ParticleField from '../components/3d/ParticleField';
import EarthGlobe from '../components/3d/EarthGlobe';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      const percentage = Math.min(progress / (duration * 1000), 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - percentage, 3);
      
      setCount(Math.floor(easeProgress * end));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-theme-bg text-white overflow-hidden font-sans">
      <ParticleField />
      
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative container mx-auto px-6 pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col lg:flex-row items-center justify-between min-h-screen">
        
        {/* Left: Content */}
        <motion.div 
          className="lg:w-1/2 z-10 text-center lg:text-left mb-16 lg:mb-0"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-theme-green to-theme-teal">
            Turn Your Electricity Bill Into Green Credits
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0">
            Save energy. Earn credits. Withdraw real money. Join the revolution towards a sustainable future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/register" className="px-8 py-4 bg-theme-green text-black font-bold rounded-full text-lg hover:bg-opacity-90 transition-all neon-glow text-center">
              Get Started
            </Link>
            <a href="#how-it-works" className="px-8 py-4 border-2 border-theme-teal text-theme-teal font-bold rounded-full text-lg hover:bg-theme-teal hover:text-white transition-all text-center">
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Right: 3D Earth Globe */}
        <motion.div 
          className="lg:w-1/2 h-[400px] lg:h-[600px] w-full relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00D4AA" />
            <EarthGlobe />
          </Canvas>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS SECTION ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 relative z-10 container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Three simple steps to start earning.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Register with Consumer Number", desc: "Link your utility account securely to fetch your baseline energy consumption." },
            { step: "02", title: "System Auto-tracks Savings", desc: "Our engine automatically compares your new bills with your historical baseline." },
            { step: "03", title: "Earn Green Credits & Withdraw", desc: "Get rewarded for every kWh saved. Convert credits to real cash via UPI." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="glass-card p-8 rounded-2xl relative overflow-hidden group hover:border-theme-green transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="text-6xl font-black text-white opacity-10 absolute -top-4 -right-4 group-hover:text-theme-green transition-colors">
                {item.step}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-theme-teal">{item.title}</h3>
              <p className="text-gray-300 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────── */}
      <section className="py-20 bg-black bg-opacity-40 border-y border-white border-opacity-10 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <div className="text-5xl font-black text-theme-green mb-2 neon-text">
                <AnimatedCounter end={12430} />
              </div>
              <div className="text-gray-400 text-lg uppercase tracking-wider">Households</div>
            </div>
            <div>
              <div className="text-5xl font-black text-theme-green mb-2 neon-text">
                <AnimatedCounter end={2.4} suffix="M" duration={2.5} />
              </div>
              <div className="text-gray-400 text-lg uppercase tracking-wider">kWh Saved</div>
            </div>
            <div>
              <div className="text-5xl font-black text-theme-green mb-2 neon-text">
                <AnimatedCounter end={18} prefix="₹" suffix="L" duration={2} />
              </div>
              <div className="text-gray-400 text-lg uppercase tracking-wider">Distributed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────── */}
      <section className="py-32 relative z-10 text-center container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">Ready to make an impact?</h2>
          <Link to="/register" className="inline-block px-12 py-5 bg-gradient-to-r from-theme-green to-theme-teal text-black font-extrabold rounded-full text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,255,136,0.5)]">
            Join the Revolution
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function BillUpload() {
  const [activeTab, setActiveTab] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  
  const handleAutoFetch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult({
        status: 'success',
        amount: 1450.50,
        energy_consumed: 290,
        billing_month: '2025-12'
      });
    }, 2000);
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setLoading(true);
    // Simulate OCR processing
    setTimeout(() => {
      setLoading(false);
      setResult({
        status: 'ocr_success',
        amount: 1450.50,
        energy_consumed: 290,
        billing_month: '2025-12'
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-theme-bg text-white p-8">
      <Link to="/dashboard" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors w-max">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </Link>

      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Add Electricity Bill</h1>
          <p className="text-gray-400 text-lg">Connect your utility provider or manually upload a bill image.</p>
        </header>

        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-white border-opacity-10">
            <button 
              className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'auto' ? 'text-theme-green bg-white bg-opacity-5 border-b-2 border-theme-green' : 'text-gray-400 hover:text-white'}`}
              onClick={() => { setActiveTab('auto'); setResult(null); }}
            >
              Auto-Fetch from DISCOM
            </button>
            <button 
              className={`flex-1 py-4 text-center font-bold transition-colors ${activeTab === 'upload' ? 'text-theme-green bg-white bg-opacity-5 border-b-2 border-theme-green' : 'text-gray-400 hover:text-white'}`}
              onClick={() => { setActiveTab('upload'); setResult(null); }}
            >
              Upload Bill Image
            </button>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* TAB 1: AUTO FETCH */}
              {activeTab === 'auto' && !result && (
                <motion.div 
                  key="auto" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="w-full max-w-sm">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Consumer Number</label>
                    <input 
                      type="text" 
                      defaultValue="000123456789"
                      disabled
                      className="w-full bg-black bg-opacity-50 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-theme-green transition-colors mb-6"
                    />
                    
                    <button 
                      onClick={handleAutoFetch}
                      disabled={loading}
                      className="w-full py-4 bg-theme-green text-black font-bold rounded-lg neon-glow hover:bg-opacity-90 transition-all flex justify-center items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Fetching from DISCOM...
                        </>
                      ) : (
                        "Fetch Latest Bill"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: UPLOAD */}
              {activeTab === 'upload' && !result && (
                <motion.div 
                  key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                >
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileUpload}
                    className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-theme-green bg-theme-green bg-opacity-5' : 'border-gray-500 bg-black bg-opacity-30'}`}
                  >
                    <svg className={`w-16 h-16 mb-4 ${isDragging ? 'text-theme-green' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    
                    {loading ? (
                      <div className="text-center">
                        <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                          <motion.div 
                            className="h-full bg-theme-green"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5, ease: "linear" }}
                          />
                        </div>
                        <p className="text-theme-teal animate-pulse">Running OCR analysis...</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-medium mb-2">Drag and drop your bill here</p>
                        <p className="text-gray-500 text-sm mb-6">Supports PDF, JPG, PNG (Max 5MB)</p>
                        <button className="px-6 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded border border-white border-opacity-20 transition-all">
                          Browse Files
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* RESULT VIEW (Shared) */}
              {result && (
                <motion.div 
                  key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="py-6"
                >
                  <div className="flex items-center gap-3 text-theme-green mb-6 border-b border-white border-opacity-10 pb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h2 className="text-2xl font-bold">Bill Extracted Successfully</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Billing Month</label>
                      <input type="text" defaultValue={result.billing_month} className="w-full bg-black bg-opacity-50 border border-white border-opacity-20 rounded px-3 py-2 focus:border-theme-teal outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Total Amount (₹)</label>
                      <input type="number" defaultValue={result.amount} className="w-full bg-black bg-opacity-50 border border-white border-opacity-20 rounded px-3 py-2 focus:border-theme-teal outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Energy Consumed (kWh)</label>
                      <div className="flex relative">
                        <input type="number" defaultValue={result.energy_consumed} className="w-full bg-black bg-opacity-50 border border-theme-green border-opacity-50 rounded px-3 py-2 focus:border-theme-teal outline-none text-xl font-bold text-theme-green" />
                        <span className="absolute right-4 top-2 text-theme-green font-bold text-sm">UNITS</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setResult(null)} className="flex-1 py-3 border border-white border-opacity-20 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all font-semibold">
                      Discard
                    </button>
                    <Link to="/dashboard" className="flex-1 py-3 bg-theme-green text-black text-center rounded-lg hover:bg-opacity-90 neon-glow transition-all font-bold">
                      Confirm & Save
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

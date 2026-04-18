import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastProvider, useToast } from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PageTransition from './components/ui/PageTransition';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BillUpload from './pages/BillUpload';
import Credits from './pages/Credits';
import Admin from './pages/Admin';

function SessionExpiredListener() {
  const toast = useToast();
  useEffect(() => {
    const handler = () => {
      toast.error('Session expired. Please login again.');
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    };
    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, [toast]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/upload" element={<PageTransition><BillUpload /></PageTransition>} />
        <Route path="/credits" element={<PageTransition><Credits /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <SessionExpiredListener />
          <AnimatedRoutes />
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

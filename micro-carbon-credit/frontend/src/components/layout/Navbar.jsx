import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-400">MicroCarbon</Link>
        <div className="space-x-4">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
          {/* TODO: Add auth state dependent links */}
        </div>
      </div>
    </nav>
  );
}

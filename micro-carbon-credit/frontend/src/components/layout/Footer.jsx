import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 p-4 text-center text-gray-400">
      <p>&copy; {new Date().getFullYear()} Micro Carbon Credit. All rights reserved.</p>
    </footer>
  );
}

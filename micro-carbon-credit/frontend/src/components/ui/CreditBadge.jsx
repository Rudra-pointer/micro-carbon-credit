import React from 'react';

export default function CreditBadge({ amount }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
      {amount} MCC
    </span>
  );
}

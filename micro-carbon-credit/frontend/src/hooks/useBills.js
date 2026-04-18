import { useState } from 'react';

export function useBills() {
  const [bills, setBills] = useState([]);

  // TODO: Implement fetching and uploading bills

  return { bills, setBills };
}

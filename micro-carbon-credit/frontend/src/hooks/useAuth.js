import { useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);

  // TODO: Implement login, logout, register API calls

  return { user, setUser };
}

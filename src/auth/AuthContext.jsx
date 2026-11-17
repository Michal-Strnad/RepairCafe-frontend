import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('repairCafeSession') || 'null');
    } catch {
      return null;
    }
  });

  const value = useMemo(
    () => ({
      session,
      signIn: (data) => {
        const next = { token: data.token, user: data.user };
        localStorage.setItem('repairCafeSession', JSON.stringify(next));
        setSession(next);
      },
      signOut: () => {
        localStorage.removeItem('repairCafeSession');
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

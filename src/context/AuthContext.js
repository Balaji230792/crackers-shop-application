import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateCurrentSession();
  }, []);

  const validateCurrentSession = async () => {
    try {
      const sessionId = localStorage.getItem('crackerShopSession');
      if (!sessionId) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Handle offline admin session
      if (sessionId === 'offline-admin-session') {
        const adminUser = { email: 'admin@mahin.com', role: 'admin', name: 'Admin' };
        setUser(adminUser);
        setLoading(false);
        return;
      }

      // Try to validate with server
      try {
        const response = await fetch('/api/validate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        
        const result = await response.json();
        
        if (result.valid) {
          setUser(result.user);
        } else {
          throw new Error('Invalid session');
        }
      } catch (error) {
        // If server validation fails, check if it's the admin user
        const storedUser = localStorage.getItem('crackerShopUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role === 'admin') {
            setUser(parsedUser);
            return;
          }
        }
        
        // If not admin or no stored user, clear session
        localStorage.removeItem('crackerShopSession');
        localStorage.removeItem('crackerShopUser');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setUser(result.user);
        localStorage.setItem('crackerShopSession', result.sessionId);
        localStorage.setItem('crackerShopUser', JSON.stringify(result.user));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      // Fallback to hardcoded admin for offline mode
      if (email === 'admin@mahin.com' && password === 'admin123') {
        const adminUser = { email, role: 'admin', name: 'Admin' };
        setUser(adminUser);
        localStorage.setItem('crackerShopSession', 'offline-admin-session');
        localStorage.setItem('crackerShopUser', JSON.stringify(adminUser));
        return { success: true };
      }
      return { success: false, error: 'Server not available' };
    }
  };

  const logout = async () => {
    const sessionId = localStorage.getItem('crackerShopSession');
    
    if (sessionId && sessionId !== 'offline-admin-session') {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    setUser(null);
    localStorage.removeItem('crackerShopSession');
    localStorage.removeItem('crackerShopUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
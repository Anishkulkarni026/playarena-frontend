// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // 1. Import

// 2. Define the shape of the token payload
interface TokenPayload {
  id: number;
  email: string;
  role: string;
  exp: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  role: string | null;
  token: string | null;
  isLoading: boolean;
  user: TokenPayload | null; // 3. Use the payload type
  login: (token: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<TokenPayload | null>(null); // 4. Use payload type
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedRole = localStorage.getItem('role');

      if (savedToken && savedRole) {
        const decodedToken = jwtDecode<TokenPayload>(savedToken); // 5. Decode

        // Check if token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setRole(savedRole);
          setToken(savedToken);
          setUser(decodedToken); // 6. Set user
        } else {
          // Token is expired
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      }
    } catch (error) {
      console.error("Failed to load auth state:", error);
      // Clear broken token
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, role: string) => {
    try {
      const decodedToken = jwtDecode<TokenPayload>(token); // 7. Decode on login
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      setIsLoggedIn(true);
      setRole(role);
      setToken(token);
      setUser(decodedToken); // 8. Set user on login
    } catch (error) {
      console.error("Failed to decode token on login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setRole(null);
    setToken(null);
    setUser(null); // 9. Clear user on logout
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, token, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
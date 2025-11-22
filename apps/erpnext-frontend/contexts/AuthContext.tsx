'use client';
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has valid session on mount
    const checkSession = async () => {
      try {
        const response = await fetch('/api/method/frappe.auth.get_logged_user', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const username = data.message;
          
          // If not logged in, Frappe returns "Guest"
          if (username && username !== 'Guest') {
            // Try to get user info from localStorage first
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
              } catch (error) {
                // If localStorage parse fails, create basic user object
                setUser({ name: username, email: username });
                setIsAuthenticated(true);
              }
            } else {
              // No localStorage, create basic user object
              setUser({ name: username, email: username });
              setIsAuthenticated(true);
            }
          } else {
            // Guest user, clear localStorage
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Session check failed
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    // Frappe login requires application/x-www-form-urlencoded with cmd=login
    const formData = new URLSearchParams();
    formData.append('cmd', 'login');
    formData.append('usr', email);
    formData.append('pwd', password);

    const response = await fetch('/api/method/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: 'Incorrect username or password'
      }));
      throw new Error(error.message || error.exc || 'Login failed');
    }

    const data = await response.json();
    
    // Frappe returns 200 even on failure, check exc field
    if (data.exc) {
      throw new Error('Incorrect username or password');
    }

    const userData = {
      name: data.full_name || data.message?.full_name || email,
      email: email,
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    await fetch('/api/method/logout', {
      method: 'POST',
    });

    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
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

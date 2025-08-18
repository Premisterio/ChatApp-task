import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Change this to .env in prod

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const tokenExpiry = localStorage.getItem('token_expiry');
      
      if (savedToken && tokenExpiry) {
        const now = new Date().getTime();
        const expiryTime = parseInt(tokenExpiry);
        
        // Check if token is still valid (with 5 minute buffer)
        if (now < expiryTime - 300000) { // 5 minutes buffer
          setToken(savedToken);
          
          try {
            // Verify token and get user info
            const response = await axios.get(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${savedToken}` }
            });
            setUser(response.data);
          } catch (error) {
            console.error('Token verification failed:', error);
            // Clear invalid token
            localStorage.removeItem('auth_token');
            localStorage.removeItem('token_expiry');
            setToken(null);
          }
        } else {
          // Token expired, clear it
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token_expiry');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/auth/token`, formData);
      const { access_token } = response.data;

      // Calculate expiry time (30 minutes from now)
      const expiryTime = new Date().getTime() + (30 * 60 * 1000); // 30 minutes in milliseconds
      
      // Store token and expiry
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('token_expiry', expiryTime.toString());
      
      setToken(access_token);

      // Get user info
      const userResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      setUser(userResponse.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
    setToken(null);
    setUser(null);
  };

  // Auto-logout when token expires
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      const tokenExpiry = localStorage.getItem('token_expiry');
      if (tokenExpiry) {
        const now = new Date().getTime();
        const expiryTime = parseInt(tokenExpiry);
        
        if (now >= expiryTime) {
          console.log('Token expired, logging out...');
          logout();
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [token]);

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    register,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
import React, { createContext, useContext, useState, useEffect } from 'react';

// Unified user interface reflecting our rich backend model
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  title: string;
  bio?: string;
  bookmarks?: string[];
}

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, passwordString: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, passwordString: string, name: string, title?: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, passwordString: string, name: string, title?: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { name?: string; title?: string; avatar?: string; bio?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => Promise<void>;
  myQuestions: string[];
  addMyQuestion: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('v_token'));
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [myQuestions, setMyQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticate and load profile on mounting if token is in localStorage
  useEffect(() => {
    async function loadSession() {
      const savedToken = localStorage.getItem('v_token');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json'
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setBookmarks(data.user.bookmarks || []);
            setToken(savedToken);
          } else {
            // invalid code/stale token
            localStorage.removeItem('v_token');
            setUser(null);
            setToken(null);
          }
        } catch (e) {
          console.error('Session boot loading failed:', e);
        }
      }
      setLoading(false);
    }
    loadSession();
  }, []);

  const login = async (email: string, passwordString: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordString })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login session refused' };
      }

      setToken(data.token);
      setUser(data.user);
      setBookmarks(data.user.bookmarks || []);
      localStorage.setItem('v_token', data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection failed' };
    }
  };

  const signup = async (
    email: string,
    passwordString: string,
    name: string,
    title?: string,
    avatar?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: passwordString,
          name,
          title,
          avatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup session refused' };
      }

      setToken(data.token);
      setUser(data.user);
      setBookmarks(data.user.bookmarks || []);
      localStorage.setItem('v_token', data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server registration failed' };
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    title?: string;
    avatar?: string;
    bio?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: 'Authorization header offline' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Profile update failed' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network update error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setBookmarks([]);
    localStorage.removeItem('v_token');
  };

  const toggleBookmark = async (id: string) => {
    if (!token) return;
    // optimistic UI
    setBookmarks((prev) => {
      if (prev.includes(id)) {
        return prev.filter((bId) => bId !== id);
      } else {
        return [...prev, id];
      }
    });

    try {
      const res = await fetch(`/api/posts/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Server confirms final array, update if mismatch occurs
        if (data.bookmarks) {
          setBookmarks(data.bookmarks);
        }
      }
    } catch (err) {
      console.error('Failed to sync bookmark toggle with DB:', err);
    }
  };

  const addMyQuestion = (id: string) => {
    setMyQuestions((prev) => [...prev, id]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        isAuthenticated: !!user,
        token,
        login,
        signup,
        register: signup,
        updateProfile,
        logout,
        bookmarks,
        toggleBookmark,
        myQuestions,
        addMyQuestion,
      }}
    >
      {!loading && children}
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

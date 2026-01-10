import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  provider: 'email' | 'apple' | 'google';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Basit email/şifre kayıt (gerçek uygulamada backend'e gönderilmeli)
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      provider: 'email',
    };
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    // Basit email/şifre giriş (gerçek uygulamada backend'den doğrulanmalı)
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const savedUser = JSON.parse(userData);
      if (savedUser.email === email) {
        setUser(savedUser);
        return;
      }
    }
    throw new Error('Invalid email or password');
  };

  const signInWithApple = async () => {
    // Apple Sign-In (gerçek uygulamada expo-apple-authentication kullanılmalı)
    const newUser: User = {
      id: Date.now().toString(),
      email: `apple_${Date.now()}@example.com`,
      name: 'Apple User',
      provider: 'apple',
    };
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const signInWithGoogle = async () => {
    // Google Sign-In (gerçek uygulamada expo-auth-session ile Google OAuth kullanılmalı)
    const newUser: User = {
      id: Date.now().toString(),
      email: `google_${Date.now()}@example.com`,
      name: 'Google User',
      provider: 'google',
    };
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithApple,
        signInWithGoogle,
        signOut,
      }}>
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

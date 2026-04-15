import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import LoginPage from './pages/auth/Login';
import SignupPage from './pages/auth/Signup';
import OnboardingPage from './pages/auth/Onboarding';
import Dashboard from './pages/Dashboard';
import LoggerPage from './pages/Logger';
import HistoryPage from './pages/History';
import { useAppStore } from './lib/store';
import { supabase } from './lib/supabase';

export default function App() {
  const { isAuthenticated, setUser } = useAppStore();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUser({
                id: profile.id,
                name: profile.full_name,
                email: session.user.email || '',
                monthly_budget: profile.monthly_budget,
              });
            }
          });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <AppShell>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/onboarding" element={<OnboardingPage />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth/login" />} 
          />
          <Route 
            path="/history" 
            element={isAuthenticated ? <HistoryPage /> : <Navigate to="/auth/login" />} 
          />
          <Route 
            path="/logger" 
            element={isAuthenticated ? <LoggerPage /> : <Navigate to="/auth/login" />} 
          />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AppShell>
    </Router>
  );
}

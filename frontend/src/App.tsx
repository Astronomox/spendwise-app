import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import LoginPage from './pages/auth/Login';
import SignupPage from './pages/auth/Signup';
import OnboardingPage from './pages/auth/Onboarding';
import Dashboard from './pages/Dashboard';
import LoggerPage from './pages/Logger';
import HistoryPage from './pages/History';
import GoalsPage from './pages/Goals';
import AlertsPage from './pages/Alerts';
import SmsQueuePage from './pages/SmsQueue';
import { useAppStore } from './lib/store';
import { ToastContainer } from '@/src/components/ui/Toast';

export default function App() {
  const { isAuthenticated, setUser, clearUser } = useAppStore();


  return (
    <Router>
      <AppShell>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/auth/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />} />
          <Route path="/auth/onboarding" element={isAuthenticated ? <OnboardingPage /> : <Navigate to="/auth/login" />} />

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
          <Route
            path="/goals"
            element={isAuthenticated ? <GoalsPage /> : <Navigate to="/auth/login" />}
          />
          <Route
            path="/alerts"
            element={isAuthenticated ? <AlertsPage /> : <Navigate to="/auth/login" />}
          />
          <Route
            path="/sms-queue"
            element={isAuthenticated ? <SmsQueuePage /> : <Navigate to="/auth/login" />}
          />

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AppShell>
      <ToastContainer />
    </Router>
  );
}

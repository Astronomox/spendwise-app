// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell   from '@/components/layout/AppShell';
import Dashboard  from '@/pages/Dashboard';
import History    from '@/pages/History';
import Logger     from '@/pages/Logger';
import Goals      from '@/pages/Goals';
import Alerts     from '@/pages/Alerts';
import Login      from '@/pages/auth/Login';
import Signup     from '@/pages/auth/Signup';

// Auth guard: replace `true` with a real session check
// (e.g. read a Zustand store or call useAuth()) once the backend is wired up.
const isAuthenticated = true;

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"            element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"   element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth/login" replace />} />
          <Route path="/history"     element={isAuthenticated ? <History />   : <Navigate to="/auth/login" replace />} />
          <Route path="/logger"      element={isAuthenticated ? <Logger />    : <Navigate to="/auth/login" replace />} />
          <Route path="/goals"       element={isAuthenticated ? <Goals />     : <Navigate to="/auth/login" replace />} />
          <Route path="/alerts"      element={isAuthenticated ? <Alerts />    : <Navigate to="/auth/login" replace />} />
          <Route path="/auth/login"  element={<Login />}  />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="*"            element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

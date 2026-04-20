import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import Dashboard  from '@/pages/Dashboard';
import History    from '@/pages/History';
import Logger     from '@/pages/Logger';
import Goals      from '@/pages/Goals';
import Alerts     from '@/pages/Alerts';
import Login      from '@/pages/auth/Login';
import Signup     from '@/pages/auth/Signup';

// For this prototype all routes are accessible.
// Wire up a real auth store (Zustand / Context) to gate protected routes.
export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"              element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/history"       element={<History />} />
          <Route path="/logger"        element={<Logger />} />
          <Route path="/goals"         element={<Goals />} />
          <Route path="/alerts"        element={<Alerts />} />
          <Route path="/auth/login"    element={<Login />} />
          <Route path="/auth/signup"   element={<Signup />} />
          <Route path="*"              element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

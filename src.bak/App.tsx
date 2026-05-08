import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import AppShell   from '@/components/layout/AppShell';
import Dashboard  from '@/pages/Dashboard';
import History    from '@/pages/History';
import Logger     from '@/pages/Logger';
import Goals      from '@/pages/Goals';
import Alerts     from '@/pages/Alerts';
import SmsQueue   from '@/pages/SmsQueue';
import Onboarding from '@/pages/Onboarding';
import Profile    from '@/pages/Profile';
import Login      from '@/pages/auth/Login';
import Signup     from '@/pages/auth/Signup';
import Landing    from '@/pages/Landing';
import GoalDetail from '@/pages/GoalDetail';


function PrivateRoute({ element }: { element: React.JSX.Element }): React.JSX.Element {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  return isAuthenticated ? element : <Navigate to="/auth/login" replace />;
}

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Pages (NO Sidebar/Dashboard Features) --- */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* --- Dashboard Pages (WITH Sidebar/Nav Features) --- */}
        <Route element={<PrivateRoute element={<AppShell />} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/logger" element={<Logger />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/sms-queue" element={<SmsQueue />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
        </Route>

        {/* Catch-all: Send unknown paths back to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
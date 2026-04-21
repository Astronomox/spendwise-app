// src/App.tsx
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
import Login      from '@/pages/auth/Login';
import Signup     from '@/pages/auth/Signup';

function PrivateRoute({ element }: { element: React.JSX.Element }): React.JSX.Element {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  return isAuthenticated ? element : <Navigate to="/auth/login" replace />;
}

export default function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/"            element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"   element={<PrivateRoute element={<Dashboard />}  />} />
          <Route path="/history"     element={<PrivateRoute element={<History />}    />} />
          <Route path="/logger"      element={<PrivateRoute element={<Logger />}     />} />
          <Route path="/goals"       element={<PrivateRoute element={<Goals />}      />} />
          <Route path="/alerts"      element={<PrivateRoute element={<Alerts />}     />} />
          <Route path="/sms-queue"   element={<PrivateRoute element={<SmsQueue />}   />} />
          <Route path="/onboarding"  element={<Onboarding />} />
          <Route path="/auth/login"  element={<Login />}  />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="*"            element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

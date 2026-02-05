import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/Layout/AppLayout';
import './styles/global.css';

// Lazy load all pages for better performance (code splitting)
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const TreePage = lazy(() => import('./pages/Tree/TreePage'));
const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const MembersPage = lazy(() => import('./pages/Members/MembersPage'));
const NewsPage = lazy(() => import('./pages/News/NewsPage'));
const AlbumsPage = lazy(() => import('./pages/Albums/AlbumsPage'));
const MemorialPage = lazy(() => import('./pages/Memorial/MemorialPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const LunarCalendarPage = lazy(() => import('./pages/Calendar/LunarCalendarPage'));
const FundPage = lazy(() => import('./pages/Fund/FundPage'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex-center" style={{ height: '100vh' }}>
    <Spin size="large" tip="Đang tải..." />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Routes with Suspense
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes with Layout */}
        <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/tree" element={<AppLayout><TreePage /></AppLayout>} />
        <Route path="/members" element={<AppLayout><MembersPage /></AppLayout>} />
        <Route path="/news" element={<AppLayout><NewsPage /></AppLayout>} />
        <Route path="/news/:slug" element={<AppLayout><NewsPage /></AppLayout>} />
        <Route path="/albums" element={<AppLayout><AlbumsPage /></AppLayout>} />
        <Route path="/albums/:id" element={<AppLayout><AlbumsPage /></AppLayout>} />
        <Route path="/memorial" element={<AppLayout><MemorialPage /></AppLayout>} />
        <Route path="/memorial/:memberId" element={<AppLayout><MemorialPage /></AppLayout>} />

        {/* New Feature Pages */}
        <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/calendar" element={<AppLayout><LunarCalendarPage /></AppLayout>} />
        <Route path="/fund" element={<AppLayout><FundPage /></AppLayout>} />

        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout><ProfilePage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Protected Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin_toc']}>
            <AppLayout><AdminPage /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

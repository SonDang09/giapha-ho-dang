import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/Layout/AppLayout';
import HomePage from './pages/Home/HomePage';
import TreePage from './pages/Tree/TreePage';
import LoginPage from './pages/Login/LoginPage';
import MembersPage from './pages/Members/MembersPage';
import NewsPage from './pages/News/NewsPage';
import AlbumsPage from './pages/Albums/AlbumsPage';
import MemorialPage from './pages/Memorial/MemorialPage';
import ProfilePage from './pages/Profile/ProfilePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LunarCalendarPage from './pages/Calendar/LunarCalendarPage';
import FundPage from './pages/Fund/FundPage';
import AdminPage from './pages/Admin/AdminPage';
import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  return (
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

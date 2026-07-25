import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSocket } from './hooks/useSocket';
import useAuthStore from './store/authStore';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import SavedPage from './pages/SavedPage';
import ChatPage from './pages/ChatPage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import AddPropertyPage from './pages/owner/AddPropertyPage';
import EditPropertyPage from './pages/owner/EditPropertyPage';
import MaintenancePage from './pages/MaintenancePage';
import AIAdvisorPage from './pages/AIAdvisorPage';
import NotFoundPage from './pages/NotFoundPage';
import OwnerBookingsPage from "./pages/dashboard/OwnerBookingsPage";
import OwnerInquiriesPage from "./pages/dashboard/OwnerInquiriesPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";

const ProtectedRoute = ({ children, ownerOnly = false }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (ownerOnly && !['owner', 'admin'].includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  useSocket(); // Initialize socket connection
  
  return (
    <div className="min-h-screen flex flex-col bg-surface-secondary">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/ai-advisor" element={<AIAdvisorPage />} />
          
          {/* Protected routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
          
          {/* Owner routes */}
          <Route path="/dashboard" element={<ProtectedRoute ownerOnly><OwnerDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/add-property" element={<ProtectedRoute ownerOnly><AddPropertyPage /></ProtectedRoute>} />
          <Route path="/dashboard/edit-property/:id" element={<ProtectedRoute ownerOnly><EditPropertyPage /></ProtectedRoute>} />
          <Route path="/dashboard/bookings" element={<ProtectedRoute ownerOnly><OwnerBookingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/inquiries" element={<ProtectedRoute ownerOnly><OwnerInquiriesPage /></ProtectedRoute>} />
          <Route path="/dashboard/notifications" element={<ProtectedRoute ownerOnly><NotificationsPage /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '16px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#e8420f', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

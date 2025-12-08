import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { AdminLayout } from './components/layout/AdminLayout';
import { PageLayout } from './components/layout/PageLayout';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import DailyCheckIn from './pages/DailyCheckIn';
import GameCard from './pages/GameCard';
import Missions from './pages/Missions';
import MissionLanding from './pages/MissionLanding';
import InviteFriends from './pages/InviteFriends';
import ExchangeAccount from './pages/ExchangeAccount';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import MiniGame from './pages/MiniGame';
import BuyCoins from './pages/BuyCoins';
import FindAccountBySkin from './pages/FindAccountBySkin';
import BuyAuctionAccount from './pages/BuyAuctionAccount';
import CommunityChat from './pages/CommunityChat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTransactions from './pages/admin/Transactions';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminPaymentSettings from './pages/admin/PaymentSettings';
import AdminGiftTokens from './pages/admin/GiftTokens';
import APIProviders from './pages/admin/APIProviders';
import AdminMissions from './pages/admin/AdminMissions';
import './styles/globals.css';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  // Show loading or splash if needed
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" replace /> : <Register />
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Dashboard Routes with Sidebar */}
          <Route path="/dashboard/*" element={
            <div className="flex h-screen bg-black text-white overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                <Routes>
                  <Route path="/" element={<PageLayout><Home /></PageLayout>} />
                  <Route path="/profile" element={<PageLayout><Profile /></PageLayout>} />
                  <Route path="/daily-checkin" element={<PageLayout><DailyCheckIn /></PageLayout>} />
                  <Route path="/game-card" element={<PageLayout><GameCard /></PageLayout>} />
                  <Route path="/missions" element={<PageLayout><Missions /></PageLayout>} />
                  <Route path="/invite-friends" element={<PageLayout><InviteFriends /></PageLayout>} />
                  <Route path="/exchange-account" element={<PageLayout><ExchangeAccount /></PageLayout>} />
                  <Route path="/history" element={<PageLayout><History /></PageLayout>} />
                  <Route path="/leaderboard" element={<PageLayout><Leaderboard /></PageLayout>} />
                  <Route path="/minigame" element={<PageLayout><MiniGame /></PageLayout>} />
                  <Route path="/buy-coins" element={<PageLayout><BuyCoins /></PageLayout>} />
                  <Route path="/find-account" element={<PageLayout><FindAccountBySkin /></PageLayout>} />
                  <Route path="/buy-auction" element={<PageLayout><BuyAuctionAccount /></PageLayout>} />
                  <Route path="/chat" element={<PageLayout><CommunityChat /></PageLayout>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          } />

          {/* Admin Routes with AdminLayout - only for admin */}
          <Route path="/admin/*" element={
            user && user.role === 'admin' ? (
              <AdminLayout user={user}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="transactions" element={<AdminTransactions />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="payment-settings" element={<AdminPaymentSettings />} />
                  <Route path="missions" element={<AdminMissions />} />
                  <Route path="gift-tokens" element={<AdminGiftTokens />} />
                  <Route path="api-providers" element={<APIProviders />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Redirect all other routes to landing */}
          <Route path="/mission-landing/:id" element={<MissionLanding />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

import LoginPage from '@/components/pages/auth/LoginPage';
import RegisterPage from '@/components/pages/auth/RegisterPage';
import ChangePasswordPage from '@/components/pages/auth/ChangePasswordPage';
import Sidebar from '@/components/pages/customer/Sidebar';
import DashboardPage from '@/components/pages/customer/DashboardPage';
import TradePage from '@/components/pages/customer/TradePage';
import WalletPage from '@/components/pages/customer/WalletPage';
import ReferralPage from '@/components/pages/customer/ReferralPage';
import ProfilePage from '@/components/pages/customer/ProfilePage';
import AdminLockScreen from '@/components/pages/admin/AdminLockScreen';
import AdminSidebar from '@/components/pages/admin/AdminSidebar';
import AdminDashboard from '@/components/pages/admin/AdminDashboard';
import UserManagement from '@/components/pages/admin/UserManagement';
import AgentManagement from '@/components/pages/admin/AgentManagement';
import DepositManagement from '@/components/pages/admin/DepositManagement';
import WithdrawalManagement from '@/components/pages/admin/WithdrawalManagement';
import SettingsPage from '@/components/pages/admin/SettingsPage';

const ADMIN_PAGES = ['admin-dashboard', 'admin-users', 'admin-agents', 'admin-trading', 'admin-deposits', 'admin-withdrawals', 'admin-finance', 'admin-support', 'admin-coins', 'admin-notifications', 'admin-settings'];
const AUTH_PAGES = ['login', 'register', 'change-password'];

function PageContent() {
  const { currentPage } = useAppStore();

  const pageMap: Record<string, React.ReactNode> = {
    login: <LoginPage />,
    register: <RegisterPage />,
    'change-password': <ChangePasswordPage />,
    'admin-lock': <AdminLockScreen />,
    dashboard: <DashboardPage />,
    trade: <TradePage />,
    wallet: <WalletPage />,
    deposit: <WalletPage />,
    withdraw: <WalletPage />,
    'transaction-history': <WalletPage />,
    'deposit-history': <WalletPage />,
    'withdraw-history': <WalletPage />,
    referral: <ReferralPage />,
    profile: <ProfilePage />,
    security: <ProfilePage />,
    notifications: <ProfilePage />,
    'admin-dashboard': <AdminDashboard />,
    'admin-users': <UserManagement />,
    'admin-agents': <AgentManagement />,
    'admin-trading': <AdminDashboard />,
    'admin-deposits': <DepositManagement />,
    'admin-withdrawals': <WithdrawalManagement />,
    'admin-finance': <AdminDashboard />,
    'admin-support': <AdminDashboard />,
    'admin-coins': <SettingsPage />,
    'admin-notifications': <AdminDashboard />,
    'admin-settings': <SettingsPage />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className={AUTH_PAGES.includes(currentPage) || currentPage === 'admin-lock' ? '' : 'flex-1 min-h-0 overflow-auto'}
      >
        {pageMap[currentPage] || <DashboardPage />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  const { currentPage, isAuthenticated, isAdmin } = useAppStore();
  const isAuthPage = AUTH_PAGES.includes(currentPage);
  const isLockScreen = currentPage === 'admin-lock';

  if (isAuthPage || isLockScreen) {
    return <PageContent />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0e17]">
      {isAdmin ? <AdminSidebar /> : <Sidebar />}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageContent />
      </main>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/layout/Navbar';
import StatsBar from './components/layout/StatsBar';
import OverviewTab from './components/dashboard/OverviewTab';
import UserList from './components/users/UserList';
import AccountList from './components/accounts/AccountList';
import PaymentList from './components/payments/PaymentList';
import CreateUserModal from './components/users/CreateUserModal';
import UserDetailModal from './components/users/UserDetailModal';
import CreateAccountModal from './components/accounts/CreateAccountModal';
import AccountLookupModal from './components/accounts/AccountLookupModal';
import TransferMoneyModal from './components/payments/TransferMoneyModal';
import PaymentDetailModal from './components/payments/PaymentDetailModal';
import Toast from './components/common/Toast';
import { usersApi } from './api/usersApi';
import { accountsApi } from './api/accountsApi';
import { paymentsApi } from './api/paymentsApi';
import { checkBackendHealth } from './api/client';
import { seedDemoData } from './api/seedDemoData';
import { Layers, Users, CreditCard, ArrowRightLeft, ShieldCheck, Database, RefreshCw, Terminal } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loadingSeed, setLoadingSeed] = useState(false);

  // Modal States
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [preselectedUser, setPreselectedUser] = useState(null);
  const [isTransferMoneyOpen, setIsTransferMoneyOpen] = useState(false);
  const [preselectedSender, setPreselectedSender] = useState(null);
  const [isAccountLookupOpen, setIsAccountLookupOpen] = useState(false);
  const [lookupAccountNumber, setLookupAccountNumber] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // Toast System
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ type = 'info', title, message }) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all entities from backend
  const loadAllData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);

      if (isOnline) {
        const [usersData, accountsData, paymentsData] = await Promise.all([
          usersApi.getAllUsers().catch(() => []),
          accountsApi.getAllAccounts().catch(() => []),
          paymentsApi.getAllPayments().catch(() => []),
        ]);

        setUsers(Array.isArray(usersData) ? usersData : []);
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      }
    } catch (err) {
      setBackendOnline(false);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadAllData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  // Seed demo data helper
  const handleSeedDemoData = async () => {
    setLoadingSeed(true);
    try {
      await seedDemoData();
      showToast({
        type: 'success',
        title: 'Demo Data Seeded',
        message: 'Created sample customers, verified bank accounts, and executed initial transfer.',
      });
      await loadAllData(false);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Seeding Failed',
        message: err.message || 'Check if Spring Boot backend and PostgreSQL are running.',
      });
    } finally {
      setLoadingSeed(false);
    }
  };

  // Handlers for cross-component triggers
  const handleOpenCreateAccount = (user = null) => {
    setPreselectedUser(user);
    setIsCreateAccountOpen(true);
  };

  const handleOpenTransferMoney = (sender = null) => {
    setPreselectedSender(sender);
    setIsTransferMoneyOpen(true);
  };

  const handleOpenAccountLookup = (accountNumber = '') => {
    setLookupAccountNumber(accountNumber);
    setIsAccountLookupOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Layer */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          backendOnline={backendOnline}
          onOpenCreateUser={() => setIsCreateUserOpen(true)}
          onOpenCreateAccount={() => handleOpenCreateAccount()}
          onOpenTransferMoney={() => handleOpenTransferMoney()}
          onSeedDemoData={handleSeedDemoData}
          loadingSeed={loadingSeed}
        />

        {/* Backend Connectivity Warning Banner */}
        {!backendOnline && !loading && (
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-b border-rose-500/30 px-4 py-2.5 text-center text-xs text-rose-300">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="font-semibold">Backend Offline:</span>
              <span>Cannot connect to Spring Boot server on http://localhost:8080. Start the backend with:</span>
              <code className="bg-slate-900 px-2 py-0.5 rounded border border-rose-500/20 font-mono text-[11px] text-white">
                cd backend &amp;&amp; mvn spring-boot:run
              </code>
              <button
                onClick={() => loadAllData(false)}
                className="underline hover:text-white ml-2 text-[11px] font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Tri-Color Platform Stats */}
          <StatsBar
            users={users}
            accounts={accounts}
            payments={payments}
            loading={loading}
            onRefresh={() => loadAllData(false)}
          />

          {/* Active Tab Views */}
          {activeTab === 'overview' && (
            <OverviewTab
              users={users}
              accounts={accounts}
              payments={payments}
              setActiveTab={setActiveTab}
              onOpenCreateUser={() => setIsCreateUserOpen(true)}
              onOpenCreateAccount={handleOpenCreateAccount}
              onOpenTransferMoney={handleOpenTransferMoney}
              onOpenAccountLookup={handleOpenAccountLookup}
              onSelectUser={(id) => setSelectedUserId(id)}
              onSelectPayment={(id) => setSelectedPaymentId(id)}
            />
          )}

          {activeTab === 'users' && (
            <UserList
              users={users}
              accounts={accounts}
              loading={loading}
              onOpenCreateUser={() => setIsCreateUserOpen(true)}
              onOpenCreateAccount={handleOpenCreateAccount}
              onOpenTransferMoney={handleOpenTransferMoney}
              onSelectUser={(id) => setSelectedUserId(id)}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountList
              accounts={accounts}
              users={users}
              loading={loading}
              onOpenCreateAccount={() => handleOpenCreateAccount()}
              onOpenAccountLookup={handleOpenAccountLookup}
              onOpenTransferMoney={handleOpenTransferMoney}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentList
              payments={payments}
              accounts={accounts}
              users={users}
              loading={loading}
              onOpenTransferMoney={() => handleOpenTransferMoney()}
              onSelectPayment={(id) => setSelectedPaymentId(id)}
            />
          )}
        </main>
      </div>

      {/* Modals for All API Endpoints */}
      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onUserCreated={() => loadAllData(true)}
        showToast={showToast}
      />

      <UserDetailModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        accounts={accounts}
        onOpenCreateAccount={handleOpenCreateAccount}
      />

      <CreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        users={users}
        accounts={accounts}
        preselectedUser={preselectedUser}
        onAccountCreated={() => loadAllData(true)}
        showToast={showToast}
      />

      <AccountLookupModal
        isOpen={isAccountLookupOpen}
        onClose={() => setIsAccountLookupOpen(false)}
        initialAccountNumber={lookupAccountNumber}
      />

      <TransferMoneyModal
        isOpen={isTransferMoneyOpen}
        onClose={() => setIsTransferMoneyOpen(false)}
        users={users}
        accounts={accounts}
        preselectedSender={preselectedSender}
        onPaymentCreated={() => loadAllData(true)}
        onOpenCreateAccount={handleOpenCreateAccount}
        showToast={showToast}
      />

      <PaymentDetailModal
        paymentId={selectedPaymentId}
        isOpen={!!selectedPaymentId}
        onClose={() => setSelectedPaymentId(null)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-900 bg-slate-950/90 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-saffron-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="ml-1 text-white">Payflow Tri-Color Architecture</span>
            </div>
            <span>•</span>
            <span>REST API on port 8080</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>/api/users</span>
            <span>•</span>
            <span>/api/accounts</span>
            <span>•</span>
            <span>/api/payments</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import {
  Layers,
  Users,
  CreditCard,
  ArrowRightLeft,
  Activity,
  PlusCircle,
  SendHorizontal,
  Sparkles,
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  backendOnline,
  onOpenCreateUser,
  onOpenCreateAccount,
  onOpenTransferMoney,
  onSeedDemoData,
  loadingSeed,
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'payments', label: 'Transfers', icon: ArrowRightLeft },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      {/* Tri-Color Top Accent Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-saffron-500 via-white to-emerald-500 opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron-500 via-navy-800 to-emerald-500 p-[1.5px] shadow-lg shadow-emerald-950/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Pay<span className="text-gradient-tricolor">flow</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Fintech
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Core Banking & Payment Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-800 to-slate-800/90 text-white shadow-md border border-slate-700/60 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Side: Status Badge & Action CTAs */}
          <div className="flex items-center gap-3">
            {/* Backend Health Status */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-colors ${
                backendOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
              title={backendOnline ? 'Spring Boot API is running on :8080' : 'Cannot reach backend on :8080'}
            >
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="hidden sm:inline">{backendOnline ? 'API Connected' : 'API Offline'}</span>
            </div>

            {/* Quick Demo Data Seed Button */}
            <button
              onClick={onSeedDemoData}
              disabled={loadingSeed}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-saffron-300 border border-saffron-500/30 transition-all hover:scale-105"
              title="Populate demo users, accounts, and payments with one click"
            >
              <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
              <span>{loadingSeed ? 'Seeding...' : 'Seed Data'}</span>
            </button>

            {/* Transfer Money CTA */}
            <button
              onClick={onOpenTransferMoney}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <SendHorizontal className="w-3.5 h-3.5" />
              <span>Send Money</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

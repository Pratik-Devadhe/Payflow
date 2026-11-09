import React from 'react';
import { Users, CreditCard, ArrowRightLeft, DollarSign, RefreshCw, TrendingUp } from 'lucide-react';

export default function StatsBar({
  users = [],
  accounts = [],
  payments = [],
  loading,
  onRefresh,
}) {
  // Compute platform liquidity (sum of balances)
  const totalLiquidityINR = accounts
    .filter((a) => !a.currency || a.currency === 'INR')
    .reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

  const activeAccountsCount = accounts.filter((a) => a.status === 'ACTIVE').length;

  const totalTransferVolume = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Stat 1: Total Platform Liquidity (Emerald Tri-Color) */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-lg shadow-emerald-950/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Platform Liquidity
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            ₹{totalLiquidityINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">{accounts.length}</span> funded accounts in pool
          </p>
        </div>
      </div>

      {/* Stat 2: Registered Users (Navy / Blue Accent) */}
      <div className="glass-panel rounded-2xl p-5 border border-sky-500/20 relative overflow-hidden group hover:border-sky-500/40 transition-all shadow-lg shadow-sky-950/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
            Total Users
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {users.length}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-sky-400 font-semibold">{users.length - accounts.length > 0 ? users.length - accounts.length : 0}</span> unlinked onboarding
          </p>
        </div>
      </div>

      {/* Stat 3: Active Bank Accounts (Saffron Tri-Color) */}
      <div className="glass-panel rounded-2xl p-5 border border-saffron-500/20 relative overflow-hidden group hover:border-saffron-500/40 transition-all shadow-lg shadow-saffron-950/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-saffron-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-saffron-400 uppercase tracking-wider">
            Bank Accounts
          </span>
          <div className="w-8 h-8 rounded-lg bg-saffron-500/10 flex items-center justify-center text-saffron-400 border border-saffron-500/20">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {accounts.length}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-saffron-400 font-semibold">{activeAccountsCount}</span> active / 100% operational
          </p>
        </div>
      </div>

      {/* Stat 4: Total Payment Flows */}
      <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden group hover:border-indigo-500/40 transition-all shadow-lg shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Transfers Completed
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh all metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {payments.length}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            Total flow volume: <span className="text-indigo-300 font-semibold">₹{totalTransferVolume.toLocaleString('en-IN')}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

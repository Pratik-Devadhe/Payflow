import React from 'react';
import {
  Users,
  CreditCard,
  ArrowRightLeft,
  Sparkles,
  SendHorizontal,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function OverviewTab({
  users = [],
  accounts = [],
  payments = [],
  setActiveTab,
  onOpenCreateUser,
  onOpenCreateAccount,
  onOpenTransferMoney,
  onOpenAccountLookup,
  onSelectUser,
  onSelectPayment,
}) {
  const recentPayments = payments.slice(0, 5);
  const recentUsers = users.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Glow accents */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>High-Throughput Financial Ledger</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Seamless Banking & <span className="text-gradient-tricolor">Instant Transfers</span>
          </h1>

          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Welcome to <span className="text-white font-semibold">Payflow</span>. Manage customers, issue virtual bank
            accounts, and process idempotent peer-to-peer payments backed by pessimistic database locking.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onOpenTransferMoney}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Initiate Payment</span>
            </button>

            <button
              onClick={onOpenCreateUser}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-sky-400" />
              <span>Register Customer</span>
            </button>

            <button
              onClick={() => onOpenAccountLookup()}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            >
              <Search className="w-4 h-4 text-saffron-400" />
              <span>Lookup Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Flow Architecture Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div
          onClick={onOpenCreateUser}
          className="glass-panel rounded-2xl p-5 border border-sky-500/20 hover:border-sky-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold text-xs">
              01
            </span>
            <span className="text-[10px] font-mono text-sky-400 font-semibold">POST /api/users</span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
            1. Customer Identity
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Register user with unique name and email. UUID generated automatically for database indexing.
          </p>
        </div>

        {/* Step 2 */}
        <div
          onClick={() => onOpenCreateAccount()}
          className="glass-panel rounded-2xl p-5 border border-saffron-500/20 hover:border-saffron-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="w-7 h-7 rounded-lg bg-saffron-500/10 text-saffron-400 border border-saffron-500/20 flex items-center justify-center font-bold text-xs">
              02
            </span>
            <span className="text-[10px] font-mono text-saffron-400 font-semibold">POST /api/accounts</span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-saffron-300 transition-colors">
            2. Bank Account
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Issue unique bank account number with initial liquidity balance in INR or other currency.
          </p>
        </div>

        {/* Step 3 */}
        <div
          onClick={onOpenTransferMoney}
          className="glass-panel rounded-2xl p-5 border border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
              03
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">POST /api/payments</span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
            3. Instant Payment
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch peer-to-peer payment transfer with idempotency protection and atomic account locking.
          </p>
        </div>
      </div>

      {/* Split Section: Recent Activity & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <span>Recent Payment Transfers</span>
              </h3>
              <p className="text-xs text-slate-400">Live transaction stream</p>
            </div>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentPayments.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl">
              <p className="text-xs text-slate-400">No payment records yet.</p>
              <button
                onClick={onOpenTransferMoney}
                className="mt-2 text-xs font-semibold text-emerald-400 hover:underline"
              >
                + Create First Payment
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPayment(p.id)}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      ₹
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Ref: {p.id.substring(0, 8)}...
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Provider: {p.provider || 'INTERNAL'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white">
                      ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                      {p.status || 'SUCCESS'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Registered Users (1 col) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>New Customers</span>
              </h3>
              <p className="text-xs text-slate-400">Recently onboarded</p>
            </div>
            <button
              onClick={() => setActiveTab('users')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentUsers.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl">
              <p className="text-xs text-slate-400">No customers registered yet.</p>
              <button
                onClick={onOpenCreateUser}
                className="mt-2 text-xs font-semibold text-sky-400 hover:underline"
              >
                + Register First User
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentUsers.map((u) => {
                const initials = u.name
                  ? u.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2)
                  : 'U';
                return (
                  <div
                    key={u.id}
                    onClick={() => onSelectUser(u.id)}
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-navy-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-300 flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                          {u.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 transition-colors flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

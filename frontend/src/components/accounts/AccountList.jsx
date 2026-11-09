import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  Search,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

export default function AccountList({
  accounts = [],
  users = [],
  loading,
  onOpenCreateAccount,
  onOpenAccountLookup,
  onOpenTransferMoney,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(null);

  const handleCopy = (num, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  // Build map of users
  const userMap = {};
  users.forEach((u) => {
    userMap[u.id] = u;
  });

  const filteredAccounts = accounts.filter((a) => {
    const q = searchTerm.toLowerCase();
    const owner = userMap[a.userId]?.name?.toLowerCase() || '';
    return (
      a.accountNumber?.toLowerCase().includes(q) ||
      a.id?.toLowerCase().includes(q) ||
      owner.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-saffron-400" />
            <span>Bank Accounts Ledger</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {accounts.length} Accounts
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational deposit accounts and liquidity stores (GET /api/accounts)
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by account number..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500/30"
            />
          </div>

          {/* Account Number Lookup button */}
          <button
            onClick={() => onOpenAccountLookup()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors flex-shrink-0"
            title="Inspect account by exact number (GET /api/accounts/{number})"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lookup</span>
          </button>

          {/* Open Account button */}
          <button
            onClick={() => onOpenCreateAccount()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-saffron-500 to-amber-600 hover:from-saffron-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-lg shadow-saffron-950/40 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open Account</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-saffron-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading bank accounts ledger...</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No Bank Accounts Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm
              ? 'No accounts match your search filter.'
              : 'There are no active accounts registered. Open a new account for an existing customer to begin processing transactions.'}
          </p>
          <button
            onClick={() => onOpenCreateAccount()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-saffron-500 hover:bg-saffron-400 text-slate-950 rounded-xl transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open First Account</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAccounts.map((account, index) => {
            // Stylistic variation across tri-colors
            const isEmeraldCard = index % 2 === 0;

            return (
              <div
                key={account.id}
                onClick={() => onOpenAccountLookup(account.accountNumber)}
                className={`metallic-card rounded-2xl p-6 border transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-2xl ${
                  isEmeraldCard
                    ? 'border-emerald-500/30 hover:border-emerald-400/50 shadow-emerald-950/20'
                    : 'border-saffron-500/30 hover:border-saffron-400/50 shadow-saffron-950/20'
                }`}
              >
                {/* Card Top: Chip graphic & Status pill */}
                <div className="flex items-start justify-between mb-6">
                  {/* EMV Microchip Graphic */}
                  <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 p-[1px] shadow-sm">
                    <div className="w-full h-full bg-amber-400/20 rounded-[5px] border border-amber-600/40 grid grid-cols-2 gap-1 p-1">
                      <div className="border-r border-b border-amber-700/40 rounded-tl-sm" />
                      <div className="border-b border-amber-700/40 rounded-tr-sm" />
                      <div className="border-r border-amber-700/40 rounded-bl-sm" />
                      <div className="rounded-br-sm" />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{account.status || 'ACTIVE'}</span>
                  </div>
                </div>

                {/* Account Number */}
                <div className="mb-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                    Account Number
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-white tracking-widest">
                      {account.accountNumber}
                    </span>
                    <button
                      onClick={(e) => handleCopy(account.accountNumber, e)}
                      className="p-1 text-slate-400 hover:text-white transition-colors rounded"
                      title="Copy Account Number"
                    >
                      {copiedNumber === account.accountNumber ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="pt-3 border-t border-slate-700/60 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-0.5">
                      Available Balance
                    </span>
                    <div className="text-2xl font-black text-white tracking-tight">
                      ₹{parseFloat(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-saffron-400 uppercase bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
                    {account.currency || 'INR'}
                  </span>
                </div>

                {/* Card Bottom: Quick Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'Active'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAccountLookup(account.accountNumber);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px] flex items-center gap-1 group-hover:underline"
                  >
                    <span>Inspect Ledger</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

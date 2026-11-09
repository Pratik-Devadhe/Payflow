import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Copy,
  Check,
  CreditCard,
  SendHorizontal,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function UserList({
  users = [],
  accounts = [],
  loading,
  onOpenCreateUser,
  onOpenCreateAccount,
  onOpenTransferMoney,
  onSelectUser,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find linked account for a user (backend enforces 1 account per user)
  // Let's create a map for fast lookup
  const accountMap = {};
  accounts.forEach((acc) => {
    // If account has user reference or id
    if (acc.userId) accountMap[acc.userId] = acc;
  });

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>Customer Directory</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {users.length} Users
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered customer entities with verified Payflow ledger records (GET /api/users)
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            />
          </div>

          {/* New User Button */}
          <button
            onClick={onOpenCreateUser}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-sky-500 to-navy-700 hover:from-sky-400 hover:to-navy-600 text-white rounded-xl shadow-lg shadow-sky-950/40 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading customer directory...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No Customers Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm
              ? 'No users match your search criteria. Try a different query.'
              : 'The customer directory is currently empty. Create your first user to start managing bank accounts and payments.'}
          </p>
          <button
            onClick={onOpenCreateUser}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create First User</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const hasAccount = accounts.some((a) => a.userId === user.id || a.id === user.id);
            const initials = user.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2)
              : 'U';

            return (
              <div
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className="glass-panel rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar & Name */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy-800 via-slate-800 to-sky-900 border border-sky-500/20 flex items-center justify-center font-bold text-sky-300 text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                          {user.name}
                        </h4>
                        <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{user.email}</span>
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors flex-shrink-0" />
                  </div>

                  {/* UUID with Copy */}
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-900 flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[10px] text-slate-400 truncate select-all">{user.id}</span>
                    <button
                      onClick={(e) => handleCopy(user.id, e)}
                      className="p-1 text-slate-500 hover:text-white transition-colors rounded flex-shrink-0"
                      title="Copy User ID"
                    >
                      {copiedId === user.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Footer: Status & Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {hasAccount ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                        <CreditCard className="w-3 h-3" />
                        Account Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-saffron-500/10 text-saffron-400 border border-saffron-500/20 text-[10px] font-semibold">
                        No Account
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {!hasAccount && (
                      <button
                        onClick={() => onOpenCreateAccount(user)}
                        className="px-2 py-1 text-[11px] font-medium text-saffron-300 hover:bg-saffron-500/10 rounded-lg transition-colors border border-saffron-500/20"
                        title="Open Bank Account"
                      >
                        + Account
                      </button>
                    )}
                    <button
                      onClick={() => onOpenTransferMoney(user)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Send Money to or from this user"
                    >
                      <SendHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

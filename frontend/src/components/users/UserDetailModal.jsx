import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { usersApi } from '../../api/usersApi';
import { User, Mail, Calendar, CreditCard, Copy, Check, Loader2, ShieldCheck } from 'lucide-react';

export default function UserDetailModal({ userId, isOpen, onClose, accounts = [], onOpenCreateAccount }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetails(userId);
    } else {
      setUser(null);
      setError(null);
    }
  }, [isOpen, userId]);

  const loadUserDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getUserById(id);
      setUser(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find linked account for this user from accounts array if available
  const linkedAccount = accounts.find((acc) => acc.userId === userId || acc.id === user?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Identity Profile"
      subtitle="Details retrieved live via GET /api/users/{id}"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs text-slate-400">Fetching customer record from database...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      ) : user ? (
        <div className="space-y-5">
          {/* User Header Profile */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-navy-800 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-emerald-950/40">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-white truncate">{user.name}</h4>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span>{user.email}</span>
              </p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
          </div>

          {/* User ID with Copy */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Unique User Identifier (UUID)
              </span>
              <button
                onClick={() => handleCopy(user.id)}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy UUID'}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-slate-200 select-all break-all">{user.id}</div>
          </div>

          {/* Timestamp Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Registered On
              </span>
              <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Account Status
              </span>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Active Customer</span>
              </div>
            </div>
          </div>

          {/* Linked Bank Account Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-saffron-400" />
                Linked Bank Account
              </span>
            </div>

            {linkedAccount ? (
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-navy-900 border border-saffron-500/30 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-white tracking-wider">
                    {linkedAccount.accountNumber}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Status: <span className="text-emerald-400 font-semibold">{linkedAccount.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-saffron-400">
                    ₹{parseFloat(linkedAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">{linkedAccount.currency || 'INR'}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-700/80 text-center">
                <p className="text-xs text-slate-400 mb-2">No bank account linked to this customer identity yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreateAccount(user);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-saffron-500/10 hover:bg-saffron-500/20 text-saffron-300 border border-saffron-500/30 rounded-lg transition-colors"
                >
                  + Open Bank Account for {user.name}
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

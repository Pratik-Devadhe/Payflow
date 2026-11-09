import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { accountsApi } from '../../api/accountsApi';
import { Search, CreditCard, Calendar, Check, Copy, AlertCircle, Loader2 } from 'lucide-react';

export default function AccountLookupModal({
  isOpen,
  onClose,
  initialAccountNumber = '',
}) {
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAccountNumber(initialAccountNumber);
      if (initialAccountNumber) {
        handleSearch(initialAccountNumber);
      } else {
        setAccount(null);
        setError(null);
      }
    }
  }, [isOpen, initialAccountNumber]);

  const handleSearch = async (numToSearch) => {
    const num = numToSearch || accountNumber;
    if (!num.trim()) {
      setError('Please provide an account number');
      return;
    }

    setLoading(true);
    setError(null);
    setAccount(null);

    try {
      const data = await accountsApi.getByAccountNumber(num.trim());
      setAccount(data);
    } catch (err) {
      setError(err.message || 'Account not found with this number');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inspect Bank Account"
      subtitle="Query account ledger state via GET /api/accounts/{accountNumber}"
    >
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Account Number Search
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. ACC-1002-8491"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Lookup</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Account Details Result */}
        {account && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 border border-emerald-500/30 space-y-4 shadow-xl">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest block">
                  Verified Account Record
                </span>
                <h4 className="text-xl font-mono font-black text-white mt-0.5 tracking-wider">
                  {account.accountNumber}
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {account.status || 'ACTIVE'}
              </span>
            </div>

            {/* Balance Highlight */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block mb-1">Current Ledger Balance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  ₹{parseFloat(account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-mono text-saffron-400 font-bold uppercase">{account.currency || 'INR'}</span>
              </div>
            </div>

            {/* Account UUID & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Account UUID</span>
                  <button
                    onClick={() => handleCopy(account.id)}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-300 truncate select-all">{account.id}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Created At</span>
                <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {account.createdAt
                      ? new Date(account.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

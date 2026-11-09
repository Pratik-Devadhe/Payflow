import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { accountsApi } from '../../api/accountsApi';
import { CreditCard, User, Sparkles, ArrowRight, Loader2, IndianRupee } from 'lucide-react';

export default function CreateAccountModal({
  isOpen,
  onClose,
  users = [],
  accounts = [],
  preselectedUser,
  onAccountCreated,
  showToast,
}) {
  const [userId, setUserId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('5000');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Helper to generate a realistic account number
  const generateRandomAccountNumber = () => {
    const prefix = 'ACC';
    const rand1 = Math.floor(1000 + Math.random() * 9000);
    const rand2 = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${rand1}-${rand2}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (preselectedUser) {
        setUserId(preselectedUser.id);
      } else if (users.length > 0 && !userId) {
        // Pick first user who doesn't have an account
        const availableUser = users.find(
          (u) => !accounts.some((a) => a.userId === u.id || a.id === u.id)
        );
        if (availableUser) setUserId(availableUser.id);
        else setUserId(users[0].id);
      }
      setAccountNumber(generateRandomAccountNumber());
      setBalance('5000');
      setErrors({});
    }
  }, [isOpen, preselectedUser, users, accounts]);

  const validate = () => {
    const newErrors = {};
    if (!userId) newErrors.userId = 'Please select a customer';
    if (!accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    if (balance === '' || isNaN(balance) || parseFloat(balance) < 0) {
      newErrors.balance = 'Initial balance must be zero or a positive amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const newAcc = await accountsApi.createAccount({
        userId,
        accountNumber: accountNumber.trim(),
        balance: parseFloat(balance),
      });

      showToast({
        type: 'success',
        title: 'Bank Account Opened',
        message: `Account ${newAcc.accountNumber} successfully activated with ₹${parseFloat(newAcc.balance).toLocaleString('en-IN')}`,
      });

      onAccountCreated(newAcc);
      onClose();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Failed to Open Account',
        message: err.message || 'Error occurred while creating bank account',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Open Bank Account"
      subtitle="Initialize an operational account ledger entry linked to a verified customer"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Account Holder (User) <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={`w-full pl-9 pr-8 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
                errors.userId
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            >
              <option value="" disabled>
                Select a registered customer...
              </option>
              {users.map((u) => {
                const hasExistingAccount = accounts.some(
                  (a) => a.userId === u.id || a.id === u.id
                );
                return (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name} ({u.email}) {hasExistingAccount ? '⚠️ Already has account' : '✅ Ready'}
                  </option>
                );
              })}
            </select>
          </div>
          {errors.userId && <p className="text-xs text-rose-400 mt-1">{errors.userId}</p>}
        </div>

        {/* Account Number with Auto-Generate Helper */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Account Number <span className="text-emerald-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => setAccountNumber(generateRandomAccountNumber())}
              className="text-[11px] text-saffron-400 hover:text-saffron-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Generate</span>
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <CreditCard className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. ACC-1002-8491"
              className={`w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.accountNumber
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
          </div>
          {errors.accountNumber && <p className="text-xs text-rose-400 mt-1">{errors.accountNumber}</p>}
        </div>

        {/* Initial Balance */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Initial Deposit Balance (INR) <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400 font-bold text-sm">
              ₹
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              className={`w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.balance
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
          </div>
          {errors.balance && <p className="text-xs text-rose-400 mt-1">{errors.balance}</p>}
          <p className="text-[11px] text-slate-500 mt-1">Default currency is set to INR with ACTIVE account status.</p>
        </div>

        {/* API Endpoint Note */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="font-mono text-[11px] text-emerald-400 font-medium">POST /api/accounts</span>
          <span className="text-[11px] text-slate-500">1:1 User to Account</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-saffron-500 to-emerald-500 hover:from-saffron-400 hover:to-emerald-400 text-slate-950 rounded-xl shadow-lg shadow-saffron-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Opening Account...</span>
              </>
            ) : (
              <>
                <span>Open Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

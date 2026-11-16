import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { paymentsApi } from '../../api/paymentsApi';
import {
  SendHorizontal,
  User,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  CreditCard,
  PlusCircle,
} from 'lucide-react';

export default function TransferMoneyModal({
  isOpen,
  onClose,
  users = [],
  accounts = [],
  preselectedSender,
  onPaymentCreated,
  onOpenCreateAccount,
  showToast,
}) {
  const [senderId, setSenderId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('500');
  const [currency, setCurrency] = useState('INR');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Generate a random UUID v4 for idempotency
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Helper to find linked account for a user ID
  const getAccountForUser = (uid) => {
    if (!uid) return null;
    return accounts.find((a) => a.userId === uid || a.id === uid) || null;
  };

  // Find users who have an active account
  const usersWithAccount = users.filter((u) => getAccountForUser(u.id) !== null);

  useEffect(() => {
    if (isOpen) {
      // 1. Determine sender
      let initialSenderId = '';
      if (preselectedSender && preselectedSender.id) {
        initialSenderId = preselectedSender.id;
      } else if (usersWithAccount.length > 0) {
        initialSenderId = usersWithAccount[0].id;
      } else if (users.length > 0) {
        initialSenderId = users[0].id;
      }
      setSenderId(initialSenderId);

      // 2. Determine receiver (different from sender, preferably with account)
      const potentialReceivers = users.filter((u) => u.id !== initialSenderId);
      const receiverWithAccount = potentialReceivers.find((u) => getAccountForUser(u.id) !== null);
      if (receiverWithAccount) {
        setReceiverId(receiverWithAccount.id);
      } else if (potentialReceivers.length > 0) {
        setReceiverId(potentialReceivers[0].id);
      } else {
        setReceiverId('');
      }

      setIdempotencyKey(generateUUID());
      setErrors({});
    }
  }, [isOpen, preselectedSender, users, accounts]);

  // Current selected accounts
  const senderAccount = getAccountForUser(senderId);
  const receiverAccount = getAccountForUser(receiverId);

  const selectedSenderUser = users.find((u) => u.id === senderId);
  const selectedReceiverUser = users.find((u) => u.id === receiverId);

  // Handle sender change safely
  const handleSenderChange = (newSenderId) => {
    setSenderId(newSenderId);
    setErrors((prev) => ({ ...prev, senderId: undefined }));

    // If new sender matches current receiver, pick a different receiver
    if (newSenderId === receiverId) {
      const alternativeReceiver = users.find(
        (u) => u.id !== newSenderId && getAccountForUser(u.id) !== null
      ) || users.find((u) => u.id !== newSenderId);
      if (alternativeReceiver) {
        setReceiverId(alternativeReceiver.id);
        setErrors((prev) => ({ ...prev, receiverId: undefined }));
      } else {
        setReceiverId('');
      }
    }
  };

  const handleReceiverChange = (newReceiverId) => {
    setReceiverId(newReceiverId);
    setErrors((prev) => ({ ...prev, receiverId: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (!senderId) {
      newErrors.senderId = 'Please select a sender';
    } else if (!senderAccount) {
      newErrors.senderId = 'Selected sender does not have a bank account. Please open an account first.';
    }

    if (!receiverId) {
      newErrors.receiverId = 'Please select a receiver';
    } else if (senderId && receiverId && senderId === receiverId) {
      newErrors.receiverId = 'Sender and receiver cannot be the same customer';
    } else if (!receiverAccount) {
      newErrors.receiverId = 'Selected receiver does not have an active bank account';
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0.02) {
      newErrors.amount = 'Minimum transfer amount is 0.02';
    } else if (senderAccount && numAmount > parseFloat(senderAccount.balance)) {
      newErrors.amount = `Insufficient balance. Available: ₹${parseFloat(senderAccount.balance).toLocaleString('en-IN')}`;
    }

    if (!idempotencyKey.trim()) {
      newErrors.idempotencyKey = 'Idempotency key is required for transactional safety';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const paymentResponse = await paymentsApi.createPayment({
        senderId,
        receiverId,
        amount: parseFloat(amount),
        currency,
        idempotency_key: idempotencyKey.trim(),
      });

      showToast({
        type: 'success',
        title: 'Transfer Executed',
        message: `Successfully transferred ${currency} ${parseFloat(amount).toLocaleString('en-IN')} (Ref: ${paymentResponse.id.substring(0, 8)}...)`,
      });

      onPaymentCreated(paymentResponse);
      onClose();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Transfer Failed',
        message: err.message || 'Payment transfer could not be completed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Money & Dispatch Payment"
      subtitle="Execute atomic peer-to-peer transfer with pessimistic locking & idempotency protection"
      maxWidth="max-w-xl"
    >
      {/* If no users have accounts yet, show helpful prompt */}
      {accounts.length === 0 && (
        <div className="mb-4 p-4 rounded-xl bg-saffron-500/10 border border-saffron-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-saffron-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-saffron-200">
            <span className="font-bold block text-saffron-300">No Bank Accounts Found</span>
            Payflow requires active bank accounts for both sender and receiver. Please open at least two accounts or seed demo data first.
            {onOpenCreateAccount && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateAccount();
                }}
                className="mt-2 block text-xs font-semibold text-emerald-400 hover:underline"
              >
                + Open Bank Account Now
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sender & Receiver Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sender */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Sender (Payer) <span className="text-emerald-400">*</span>
            </label>
            <select
              value={senderId}
              onChange={(e) => handleSenderChange(e.target.value)}
              className={`w-full px-3 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.senderId
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            >
              <option value="" disabled>
                Select Sender...
              </option>
              {users.map((u) => {
                const acc = getAccountForUser(u.id);
                return (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name} {acc ? `• ₹${parseFloat(acc.balance).toLocaleString('en-IN')}` : '(No Account)'}
                  </option>
                );
              })}
            </select>
            {errors.senderId && <p className="text-xs text-rose-400 mt-1">{errors.senderId}</p>}

            {/* Sender Account Info Indicator */}
            {senderAccount ? (
              <div className="mt-1.5 text-[11px] text-slate-300 flex items-center justify-between px-2.5 py-1.5 bg-slate-900/80 rounded-lg border border-emerald-500/30">
                <span className="font-mono text-slate-400">{senderAccount.accountNumber}</span>
                <span className="text-emerald-400 font-bold font-mono">
                  ₹{parseFloat(senderAccount.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ) : senderId ? (
              <div className="mt-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  No account linked
                </span>
                {onOpenCreateAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreateAccount(selectedSenderUser);
                    }}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    + Open Account
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {/* Receiver */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Receiver (Payee) <span className="text-emerald-400">*</span>
            </label>
            <select
              value={receiverId}
              onChange={(e) => handleReceiverChange(e.target.value)}
              className={`w-full px-3 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.receiverId
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            >
              <option value="" disabled>
                Select Receiver...
              </option>
              {users.map((u) => {
                const acc = getAccountForUser(u.id);
                return (
                  <option
                    key={u.id}
                    value={u.id}
                    disabled={u.id === senderId}
                    className="bg-slate-900 text-white"
                  >
                    {u.name} {acc ? `• ${acc.accountNumber}` : '(No Account)'} {u.id === senderId ? '(Self)' : ''}
                  </option>
                );
              })}
            </select>
            {errors.receiverId && <p className="text-xs text-rose-400 mt-1">{errors.receiverId}</p>}

            {/* Receiver Account Info Indicator */}
            {receiverAccount ? (
              <div className="mt-1.5 text-[11px] text-slate-300 flex items-center justify-between px-2.5 py-1.5 bg-slate-900/80 rounded-lg border border-slate-800">
                <span className="font-mono text-slate-400">{receiverAccount.accountNumber}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            ) : receiverId ? (
              <div className="mt-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  No account linked
                </span>
                {onOpenCreateAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreateAccount(selectedReceiverUser);
                    }}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    + Open Account
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Amount & Currency Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Transfer Amount <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.02"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                placeholder="0.00"
                className={`w-full px-3 py-2.5 bg-slate-900/90 border rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.amount
                    ? 'border-rose-500/60 focus:ring-rose-500/30'
                    : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="INR">INR (₹)</option>
              <option value="USA">USA ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        {/* Idempotency Key with Regenerate Control */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Idempotency Key (UUID) <span className="text-emerald-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIdempotencyKey(generateUUID())}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Regenerate Key</span>
            </button>
          </div>
          <input
            type="text"
            value={idempotencyKey}
            onChange={(e) => setIdempotencyKey(e.target.value)}
            className={`w-full px-3 py-2 bg-slate-900/90 border rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:ring-2 transition-all ${
              errors.idempotencyKey
                ? 'border-rose-500/60 focus:ring-rose-500/30'
                : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
          {errors.idempotencyKey && <p className="text-xs text-rose-400 mt-1">{errors.idempotencyKey}</p>}
          <p className="text-[10px] text-slate-500 mt-1">
            Guarantees strict exactly-once payment processing even on network retries.
          </p>
        </div>

        {/* Transfer Breakdown Preview Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Transfer Amount:</span>
            <span className="font-mono text-white font-semibold">
              {currency} {parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Payflow Network Fee:</span>
            <span className="font-mono text-emerald-400 font-semibold">₹0.00 (Zero Fee)</span>
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-semibold text-slate-200">
            <span>Total Debit from Sender:</span>
            <span className="font-mono text-saffron-400 font-bold">
              {currency} {parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !senderAccount || !receiverAccount}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Transfer...</span>
              </>
            ) : (
              <>
                <span>Authorize & Send</span>
                <SendHorizontal className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

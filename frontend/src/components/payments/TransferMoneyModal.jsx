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
  ShieldAlert,
} from 'lucide-react';

export default function TransferMoneyModal({
  isOpen,
  onClose,
  users = [],
  accounts = [],
  preselectedSender,
  onPaymentCreated,
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

  useEffect(() => {
    if (isOpen) {
      if (preselectedSender) {
        setSenderId(preselectedSender.id);
      } else if (users.length > 0 && !senderId) {
        setSenderId(users[0].id);
      }

      // Pick another user for receiver if possible
      if (users.length > 1) {
        const potentialReceiver = users.find((u) => u.id !== (preselectedSender?.id || users[0]?.id));
        if (potentialReceiver) setReceiverId(potentialReceiver.id);
      }

      setIdempotencyKey(generateUUID());
      setErrors({});
    }
  }, [isOpen, preselectedSender, users]);

  // Find sender's linked account & balance
  const senderAccount = accounts.find((a) => a.userId === senderId || a.id === senderId);
  const receiverAccount = accounts.find((a) => a.userId === receiverId || a.id === receiverId);

  const validate = () => {
    const newErrors = {};
    if (!senderId) newErrors.senderId = 'Please select a sender';
    if (!receiverId) newErrors.receiverId = 'Please select a receiver';
    if (senderId && receiverId && senderId === receiverId) {
      newErrors.receiverId = 'Sender and receiver cannot be the same customer';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0.02) {
      newErrors.amount = 'Minimum transfer amount is 0.02';
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
              onChange={(e) => setSenderId(e.target.value)}
              className={`w-full px-3 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.senderId
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            >
              <option value="" disabled>
                Select Sender...
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name}
                </option>
              ))}
            </select>
            {errors.senderId && <p className="text-xs text-rose-400 mt-1">{errors.senderId}</p>}

            {/* Sender Account Info Indicator */}
            {senderAccount ? (
              <div className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between px-2 py-1 bg-slate-900/60 rounded-lg border border-slate-800">
                <span>Acc: {senderAccount.accountNumber}</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  ₹{parseFloat(senderAccount.balance).toLocaleString('en-IN')}
                </span>
              </div>
            ) : senderId ? (
              <div className="mt-1.5 text-[10px] text-amber-400/90 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Sender has no account yet (will fail in API)</span>
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
              onChange={(e) => setReceiverId(e.target.value)}
              className={`w-full px-3 py-2.5 bg-slate-900/90 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.receiverId
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            >
              <option value="" disabled>
                Select Receiver...
              </option>
              {users.map((u) => (
                <option
                  key={u.id}
                  value={u.id}
                  disabled={u.id === senderId}
                  className="bg-slate-900 text-white"
                >
                  {u.name} {u.id === senderId ? '(Self - Invalid)' : ''}
                </option>
              ))}
            </select>
            {errors.receiverId && <p className="text-xs text-rose-400 mt-1">{errors.receiverId}</p>}

            {/* Receiver Account Info Indicator */}
            {receiverAccount ? (
              <div className="mt-1.5 text-[11px] text-slate-400 flex items-center justify-between px-2 py-1 bg-slate-900/60 rounded-lg border border-slate-800">
                <span>Acc: {receiverAccount.accountNumber}</span>
                <span className="text-slate-300 font-mono">Ready to receive</span>
              </div>
            ) : receiverId ? (
              <div className="mt-1.5 text-[10px] text-amber-400/90 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Receiver has no account yet (will fail in API)</span>
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
                onChange={(e) => setAmount(e.target.value)}
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
            disabled={loading}
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

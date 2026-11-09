import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { paymentsApi } from '../../api/paymentsApi';
import {
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Copy,
  Check,
  Code,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function PaymentDetailModal({ paymentId, isOpen, onClose }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      loadPayment(paymentId);
    } else {
      setPayment(null);
      setError(null);
      setShowJson(false);
    }
  }, [isOpen, paymentId]);

  const loadPayment = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentsApi.getPaymentById(id);
      setPayment(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (field, text) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Transaction Receipt"
      subtitle="Complete ledger transaction receipt retrieved via GET /api/payments/{id}"
      maxWidth="max-w-lg"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs text-slate-400">Retrieving transactional record from ledger...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : payment ? (
        <div className="space-y-4">
          {/* Receipt Top Hero */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-navy-950 border border-slate-800 text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-3xl font-black text-white tracking-tight">
              {payment.currency === 'INR' ? '₹' : payment.currency === 'USA' ? '$' : '€'}
              {parseFloat(payment.amount).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {payment.status || 'SUCCESS'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                {payment.provider || 'INTERNAL'}
              </span>
            </div>
          </div>

          {/* Transaction Metadata Table */}
          <div className="space-y-2.5 text-xs">
            {/* Transaction UUID */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Transaction UUID</span>
                <span className="font-mono text-slate-300 text-[11px] select-all break-all">{payment.id}</span>
              </div>
              <button
                onClick={() => handleCopy('id', payment.id)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Copy ID"
              >
                {copiedField === 'id' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Sender Account ID */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sender Account UUID</span>
                <span className="font-mono text-slate-300 text-[11px] select-all break-all">
                  {payment.senderAccountId}
                </span>
              </div>
              <button
                onClick={() => handleCopy('sender', payment.senderAccountId)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Copy Sender Account ID"
              >
                {copiedField === 'sender' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Receiver Account ID */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Receiver Account UUID</span>
                <span className="font-mono text-slate-300 text-[11px] select-all break-all">
                  {payment.receiverAccountId}
                </span>
              </div>
              <button
                onClick={() => handleCopy('receiver', payment.receiverAccountId)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                title="Copy Receiver Account ID"
              >
                {copiedField === 'receiver' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Raw JSON Response Inspector */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowJson(!showJson)}
              className="w-full px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                <Code className="w-3.5 h-3.5" />
                Raw Backend JSON Payload
              </span>
              {showJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showJson && (
              <pre className="p-3 bg-slate-950 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-48 border-t border-slate-800 leading-relaxed">
                {JSON.stringify(payment, null, 2)}
              </pre>
            )}
          </div>

          {/* Close button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              Close Receipt
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

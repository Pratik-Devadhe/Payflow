import React, { useState } from 'react';
import {
  ArrowRightLeft,
  SendHorizontal,
  Search,
  Copy,
  Check,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export default function PaymentList({
  payments = [],
  accounts = [],
  users = [],
  loading,
  onOpenTransferMoney,
  onSelectPayment,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPayments = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.id?.toLowerCase().includes(q) ||
      p.senderAccountId?.toLowerCase().includes(q) ||
      p.receiverAccountId?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q) ||
      p.currency?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
            <span>Payment & Transfer Ledger</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {payments.length} Transactions
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of money transfers and balance adjustments (GET /api/payments)
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
              placeholder="Search by ID, account, status..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>

          {/* New Transfer button */}
          <button
            onClick={() => onOpenTransferMoney()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 rounded-xl shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <SendHorizontal className="w-4 h-4" />
            <span>Send Money</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading payment ledger...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No Transactions Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm
              ? 'No payments match your search query.'
              : 'The transfer ledger is currently empty. Execute your first money transfer between customer accounts.'}
          </p>
          <button
            onClick={() => onOpenTransferMoney()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all"
          >
            <SendHorizontal className="w-4 h-4" />
            <span>Initiate First Transfer</span>
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 uppercase text-[10px] font-semibold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-5 py-3.5">Sender Account</th>
                  <th className="px-5 py-3.5">Receiver Account</th>
                  <th className="px-5 py-3.5">Provider</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPayments.map((payment) => {
                  const isPending = payment.status === 'PENDING';
                  const isSuccess = payment.status === 'SUCCESS' || payment.status === 'COMPLETED';

                  return (
                    <tr
                      key={payment.id}
                      onClick={() => onSelectPayment(payment.id)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isPending
                              ? 'bg-saffron-500/10 text-saffron-400 border-saffron-500/30'
                              : isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {isPending ? (
                            <Clock className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          <span>{payment.status || 'PENDING'}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-baseline gap-1.5 font-bold">
                          <span className="text-sm font-black text-white">
                            {payment.currency === 'INR' ? '₹' : payment.currency === 'USA' ? '$' : '€'}
                            {parseFloat(payment.amount).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{payment.currency}</span>
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-300 text-[11px] group-hover:text-emerald-400 transition-colors">
                            {payment.id ? `${payment.id.substring(0, 8)}...${payment.id.substring(payment.id.length - 4)}` : 'N/A'}
                          </span>
                          <button
                            onClick={(e) => handleCopy(payment.id, e)}
                            className="p-1 text-slate-500 hover:text-white rounded transition-colors"
                            title="Copy UUID"
                          >
                            {copiedId === payment.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Sender Account */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-400">
                          {payment.senderAccountId ? `${payment.senderAccountId.substring(0, 8)}...` : 'N/A'}
                        </span>
                      </td>

                      {/* Receiver Account */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-400">
                          {payment.receiverAccountId ? `${payment.receiverAccountId.substring(0, 8)}...` : 'N/A'}
                        </span>
                      </td>

                      {/* Provider */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
                          {payment.provider || 'INTERNAL'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPayment(payment.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors border border-emerald-500/20"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

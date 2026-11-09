import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-slide-in ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
                : isError
                ? 'bg-slate-900/95 border-rose-500/40 text-rose-100 shadow-rose-950/40'
                : isWarning
                ? 'bg-slate-900/95 border-saffron-500/40 text-saffron-100 shadow-saffron-950/40'
                : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-black/50'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-saffron-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-400" />}
            </div>

            <div className="flex-1 text-sm">
              {toast.title && <div className="font-semibold">{toast.title}</div>}
              <div className="text-slate-300 text-xs mt-0.5 leading-relaxed">{toast.message}</div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

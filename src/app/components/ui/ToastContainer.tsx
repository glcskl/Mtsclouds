import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp, Toast } from '../../context/AppContext';

const toastConfig = {
  success: { icon: CheckCircle, bg: 'bg-white', border: 'border-[#16A34A]', iconColor: 'text-[#16A34A]', titleColor: 'text-[#0F172A]' },
  error:   { icon: AlertCircle, bg: 'bg-white', border: 'border-[#DC2626]', iconColor: 'text-[#DC2626]', titleColor: 'text-[#0F172A]' },
  warning: { icon: AlertTriangle, bg: 'bg-white', border: 'border-[#F59E0B]', iconColor: 'text-[#F59E0B]', titleColor: 'text-[#0F172A]' },
  info:    { icon: Info, bg: 'bg-white', border: 'border-[#0EA5E9]', iconColor: 'text-[#0EA5E9]', titleColor: 'text-[#0F172A]' },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useApp();
  const c = toastConfig[toast.type];
  const Icon = c.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${c.bg} border ${c.border} shadow-[0_8px_24px_rgba(0,0,0,0.12)] min-w-[300px] max-w-[380px]`}>
      <Icon size={18} className={`mt-0.5 flex-shrink-0 ${c.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-medium ${c.titleColor}`}>{toast.title}</p>
        {toast.message && <p className="text-[12px] text-[#475569] mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => removeToast(toast.id)} className="text-[#94A3B8] hover:text-[#475569] transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}

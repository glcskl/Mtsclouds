import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function DeleteModal() {
  const { showDeleteModal, setShowDeleteModal, deleteTarget, setDeleteTarget } = useApp();

  if (!showDeleteModal || !deleteTarget) return null;

  const handleConfirm = () => {
    deleteTarget.onConfirm();
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleCancel = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleCancel} />
      <div className="relative bg-white rounded-[10px] border border-[#E2E8F0] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-[440px] p-6">
        <button onClick={handleCancel} className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#475569] transition-colors">
          <X size={18} />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 bg-[#FEE2E2] rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-[#DC2626]" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#0F172A] mb-1">
              Удалить {deleteTarget.type} «{deleteTarget.name}»?
            </h3>
            <p className="text-[13px] text-[#475569]">
              Это действие необратимо. Все данные будут безвозвратно удалены.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 h-9 rounded-lg border border-[#E2E8F0] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 h-9 rounded-lg bg-[#DC2626] text-[13px] font-medium text-white hover:bg-[#B91C1C] transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

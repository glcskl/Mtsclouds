import React from 'react';
import { useNavigate } from 'react-router';
import { ShieldOff } from 'lucide-react';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[#FEE2E2] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldOff size={28} className="text-[#DC2626]" />
        </div>
        <h1 className="text-[22px] font-semibold text-[#0F172A] mb-2">Доступ запрещён</h1>
        <p className="text-[13px] text-[#475569] mb-6">
          У вас недостаточно прав для просмотра этой страницы.
          Обратитесь к администратору платформы.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-5 h-10 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors"
        >
          Вернуться к входу
        </button>
      </div>
    </div>
  );
}

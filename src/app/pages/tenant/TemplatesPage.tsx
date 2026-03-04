import React from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '../../components/layout/AppShell';
import { Plus, Server } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { templates } from '../../data/mockData';

const categoryColors: Record<string, { bg: string; text: string }> = {
  OS:         { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' },
  Web:        { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
  Database:   { bg: 'bg-[#F5F3FF]', text: 'text-[#6D28D9]' },
  Cache:      { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' },
  Monitoring: { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]' },
  Runtime:    { bg: 'bg-[#F1F5F9]', text: 'text-[#475569]' },
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { activeTenant } = useApp();

  return (
    <AppShell breadcrumbs={[activeTenant?.name || '', 'Шаблоны']}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#0F172A]">Шаблоны образов</h1>
            <p className="text-[13px] text-[#475569] mt-0.5">{templates.length} шаблонов доступно</p>
          </div>
          <button
            onClick={() => navigate('/tenant/vms/new')}
            className="flex items-center gap-2 px-4 h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors"
          >
            <Plus size={14} /> Создать ВМ
          </button>
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-3 gap-4">
          {templates.map(tpl => {
            const c = categoryColors[tpl.category] || { bg: 'bg-[#F1F5F9]', text: 'text-[#94A3B8]' };
            return (
              <div key={tpl.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl flex items-center justify-center">
                    <Server size={18} className="text-[#3B82F6]" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{tpl.category}</span>
                </div>
                <h3 className="text-[14px] font-semibold text-[#0F172A] mb-1">{tpl.name}</h3>
                <p className="text-[12px] text-[#94A3B8] mb-3 leading-relaxed">{tpl.description}</p>
                <p className="font-mono text-[11px] text-[#475569] bg-[#F8FAFC] rounded-lg px-3 py-2 mb-4">{tpl.image}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-[#94A3B8]">
                    <span>{tpl.defaultCpu} vCPU</span>
                    <span>·</span>
                    <span>{tpl.defaultRam} GB</span>
                    <span>·</span>
                    <span>{tpl.defaultDisk} GB</span>
                  </div>
                  <button
                    onClick={() => navigate('/tenant/vms/new')}
                    className="text-[12px] text-[#3B82F6] hover:text-[#2563EB] font-medium"
                  >
                    Создать →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

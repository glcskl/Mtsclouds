import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Activity, Search } from 'lucide-react';
import { auditLog } from '../../data/mockData';

const levelConfig = {
  info:    { label: 'INFO',    bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]' },
  warning: { label: 'WARN',   bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]' },
  danger:  { label: 'ERROR',  bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' },
};

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const filtered = auditLog.filter(a =>
    a.action.toLowerCase().includes(search.toLowerCase()) ||
    a.user.toLowerCase().includes(search.toLowerCase()) ||
    a.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell breadcrumbs={['Platform Admin', 'Журнал аудита']}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#0F172A]">Журнал аудита</h1>
            <p className="text-[13px] text-[#475569] mt-0.5">Все действия в платформе</p>
          </div>
        </div>

        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по действию, пользователю..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E2E8F0] text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none focus:border-[#3B82F6] bg-white"
          />
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['Уровень', 'Пользователь', 'Действие', 'Объект', 'Организация', 'Время'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {filtered.map(row => {
                const c = levelConfig[row.level as keyof typeof levelConfig] || levelConfig.info;
                return (
                  <tr key={row.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${c.bg} ${c.text}`}>{c.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white">{row.user.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className="text-[13px] text-[#0F172A]">{row.user}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#0F172A]">{row.action}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">{row.target}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{row.tenant}</td>
                    <td className="px-5 py-3.5 text-[12px] text-[#94A3B8]">
                      {new Date(row.time).toLocaleString('ru', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

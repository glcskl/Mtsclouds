import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Building2, Server, Cpu, AlertTriangle, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { auditLog as fallbackAuditLog, cpuChartData } from '../../data/mockData';
import { api } from '../../api/client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const levelColors: Record<string, string> = {
  info: 'text-[#0EA5E9]',
  warning: 'text-[#F59E0B]',
  danger: 'text-[#DC2626]',
};

export default function AdminOverviewPage() {
  const { tenants } = useApp();
  const [auditLog, setAuditLog] = useState(fallbackAuditLog);

  useEffect(() => {
    api.getAuditLog().then(setAuditLog).catch(() => {});
  }, []);

  const totalVMs = tenants.reduce((sum, t) => sum + t.vms.length, 0);
  const runningVMs = tenants.reduce((sum, t) => sum + t.vms.filter(v => v.status === 'RUNNING').length, 0);
  const totalCPU = tenants.reduce((sum, t) => sum + t.quota.cpu.allocated, 0);
  const alertCount = tenants.reduce((sum, t) => sum + t.vms.filter(v => v.status === 'ERROR').length, 0);
  const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;

  return (
    <AppShell breadcrumbs={['Platform Admin', 'Обзор']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#0F172A]">Обзор платформы</h1>
            <p className="text-[13px] text-[#475569] mt-0.5">Мониторинг инфраструктуры и активности</p>
          </div>
          <div className="text-[12px] text-[#94A3B8]">
            Обновлено: сегодня, 11:02
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="Организации"
            value={activeTenants}
            subtext={`${tenants.length} всего, ${tenants.filter(t => t.status === 'DISABLED').length} отключено`}
            icon={<Building2 size={16} className="text-[#3B82F6]" />}
            accent="bg-[#EFF6FF]"
            delta="+1 за месяц"
            deltaType="positive"
          />
          <MetricCard
            label="Виртуальные машины"
            value={totalVMs}
            subtext={`${runningVMs} запущено`}
            icon={<Server size={16} className="text-[#16A34A]" />}
            accent="bg-[#DCFCE7]"
            delta={`${totalVMs - runningVMs} остановлено`}
            deltaType="neutral"
          />
          <MetricCard
            label="Выделено CPU"
            value={`${totalCPU} vCPU`}
            subtext="Across all tenants"
            icon={<Cpu size={16} className="text-[#7C3AED]" />}
            accent="bg-[#F5F3FF]"
          />
          <MetricCard
            label="Алерты"
            value={alertCount}
            subtext="Требуют внимания"
            icon={<AlertTriangle size={16} className="text-[#DC2626]" />}
            accent="bg-[#FEE2E2]"
            delta={alertCount > 0 ? 'Критично' : 'Всё ОК'}
            deltaType={alertCount > 0 ? 'negative' : 'positive'}
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Загрузка CPU по организациям</h3>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">За последние 24 часа (%)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB]">24 часа</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={cpuChartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="%" width={36} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
                cursor={{ stroke: '#E2E8F0' }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Line type="monotone" dataKey="acme" name="Acme Telecom" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="beta" name="Beta Retail" stroke="#7C3AED" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Audit log table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#0F172A]">Последняя активность</h3>
            <button className="text-[12px] text-[#3B82F6] hover:text-[#2563EB] font-medium">Журнал аудита →</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {['Пользователь', 'Действие', 'Объект', 'Организация', 'Время'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {auditLog.map(row => (
                <tr key={row.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-white">
                          {row.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-[13px] text-[#0F172A]">{row.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <Activity size={13} className={levelColors[row.level] || 'text-[#94A3B8]'} />
                      <span className="text-[13px] text-[#0F172A]">{row.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-[12px] font-mono bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded">{row.target}</span>
                  </td>
                  <td className="px-6 py-3.5 text-[13px] text-[#475569]">{row.tenant}</td>
                  <td className="px-6 py-3.5 text-[12px] text-[#94A3B8]">
                    {new Date(row.time).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
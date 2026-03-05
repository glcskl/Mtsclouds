import React, { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';
import { Loader2, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatByn } from '../../utils/money';

type BillingItem = {
  vmId: string;
  vmName: string;
  cpu: number;
  ram: number;
  disk: number;
  hours: number;
  cost: number;
  cpuCost: number;
  ramCost: number;
  diskCost: number;
};

export default function BillingPage() {
  const { activeTenant, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [breakdown, setBreakdown] = useState<BillingItem[]>([]);

  const formatCurrency = (value: number) => formatByn(value, 2);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.getBillingSummary();
        setTotal(data.total || 0);
        setBreakdown(data.breakdown || []);
      } catch (err: any) {
        addToast({ type: 'error', title: 'Ошибка загрузки биллинга', message: err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const chartData = useMemo(
    () => breakdown.map(row => ({ name: row.vmName, total: row.cost })),
    [breakdown]
  );

  return (
    <AppShell breadcrumbs={[activeTenant?.name || 'Организация', 'Биллинг']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#0F172A]">Биллинг</h1>
          <p className="text-[13px] text-[#475569] mt-0.5">Стоимость рассчитана по фактическим параметрам ВМ</p>
        </div>

        <div className="bg-gradient-to-br from-[#E30613] to-[#FF3B4F] rounded-2xl p-7 text-white shadow-xl shadow-[#E30613]/20">
          <div className="flex items-center gap-2 mb-2 text-white/85">
            <CreditCard size={18} />
            <span className="text-[13px] font-medium">Итоговые расходы</span>
          </div>
          <p className="text-[36px] font-bold leading-none">{formatCurrency(total)}</p>
          <p className="text-[12px] mt-2 text-white/75">Текущий расчёт за весь период работы ВМ</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-[15px] font-semibold text-[#0F172A] mb-5">Стоимость по виртуальным машинам</h3>
          {loading ? (
            <div className="h-[220px] flex items-center justify-center gap-2 text-[#94A3B8] text-[13px]">
              <Loader2 size={16} className="animate-spin" />
              Загружаем данные...
            </div>
          ) : breakdown.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-[#94A3B8] text-[13px]">
              Нет данных для отображения
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="total" fill="#E30613" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['ВМ', 'CPU', 'RAM', 'Disk', 'Часы', 'Итого'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-[13px] text-[#94A3B8]">Загрузка...</td>
                </tr>
              ) : breakdown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-[13px] text-[#94A3B8]">Нет ВМ для расчёта</td>
                </tr>
              ) : breakdown.map(row => (
                <tr key={row.vmId} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#0F172A]">{row.vmName}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{formatCurrency(row.cpuCost)}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{formatCurrency(row.ramCost)}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{formatCurrency(row.diskCost)}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{row.hours.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-[13px] font-semibold text-[#0F172A]">{formatCurrency(row.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

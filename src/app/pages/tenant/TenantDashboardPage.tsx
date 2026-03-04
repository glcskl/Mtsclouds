import React from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '../../components/layout/AppShell';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { QuotaBar } from '../../components/ui/QuotaBar';
import { Plus, FileText, Server, Play, Square, MoreHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TenantDashboardPage() {
  const navigate = useNavigate();
  const { activeTenant, setSelectedVM, setShowVMDrawer } = useApp();

  if (!activeTenant) return null;
  const { quota, vms } = activeTenant;

  const runningCount = vms.filter(v => v.status === 'RUNNING').length;
  const cpuPct = Math.round((quota.cpu.used / quota.cpu.limit) * 100);
  const ramPct = Math.round((quota.ram.used / quota.ram.limit) * 100);

  const openDrawer = (vm: typeof vms[0]) => {
    setSelectedVM(vm);
    setShowVMDrawer(true);
  };

  return (
    <AppShell breadcrumbs={[activeTenant.name, 'Dashboard']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#0F172A]">Dashboard</h1>
            <p className="text-[13px] text-[#475569] mt-0.5">Обзор ресурсов организации {activeTenant.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tenant/templates')}
              className="flex items-center gap-2 px-4 h-9 border border-[#E2E8F0] rounded-lg text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
            >
              <FileText size={14} />
              Шаблоны
            </button>
            <button
              onClick={() => navigate('/tenant/vms/new')}
              className="flex items-center gap-2 px-4 h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors"
            >
              <Plus size={14} />
              Создать ВМ
            </button>
          </div>
        </div>

        {/* Quota metric cards */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="CPU"
            value={`${quota.cpu.used} / ${quota.cpu.limit}`}
            subtext={`Выделено: ${quota.cpu.allocated} vCPU`}
            icon={<span className="text-[11px] font-bold text-[#3B82F6]">CPU</span>}
            accent="bg-[#EFF6FF]"
            delta={`${cpuPct}% использовано`}
            deltaType={cpuPct > 90 ? 'negative' : cpuPct > 75 ? 'negative' : 'neutral'}
          />
          <MetricCard
            label="RAM"
            value={`${quota.ram.used} / ${quota.ram.limit}`}
            subtext={`Выделено: ${quota.ram.allocated} GB`}
            icon={<span className="text-[11px] font-bold text-[#7C3AED]">RAM</span>}
            accent="bg-[#F5F3FF]"
            delta={`${ramPct}% использовано`}
            deltaType={ramPct > 90 ? 'negative' : 'neutral'}
          />
          <MetricCard
            label="Диск"
            value={`${quota.disk.used} / ${quota.disk.limit}`}
            subtext={`Выделено: ${quota.disk.allocated} GB`}
            icon={<span className="text-[11px] font-bold text-[#0EA5E9]">HDD</span>}
            accent="bg-[#E0F2FE]"
          />
          <MetricCard
            label="Виртуальные машины"
            value={`${quota.vms.used} / ${quota.vms.limit}`}
            subtext={`${runningCount} запущено`}
            icon={<Server size={14} className="text-[#16A34A]" />}
            accent="bg-[#DCFCE7]"
          />
        </div>

        {/* Quotas detail */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-[15px] font-semibold text-[#0F172A] mb-5">Использование квот</h3>
          <div className="space-y-5">
            <QuotaBar label="CPU" used={quota.cpu.used} allocated={quota.cpu.allocated} limit={quota.cpu.limit} unit="vCPU" />
            <QuotaBar label="RAM" used={quota.ram.used} allocated={quota.ram.allocated} limit={quota.ram.limit} unit="GB" />
            <QuotaBar label="Диск" used={quota.disk.used} allocated={quota.disk.allocated} limit={quota.disk.limit} unit="GB" />
          </div>
        </div>

        {/* Recent VMs */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#0F172A]">Последние ВМ</h3>
            <button onClick={() => navigate('/tenant/vms')} className="text-[12px] text-[#3B82F6] hover:text-[#2563EB] font-medium">
              Все ВМ →
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {['Имя', 'Шаблон', 'Статус', 'CPU', 'RAM', 'Disk', 'Обновлено', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {vms.slice(0, 5).map(vm => (
                <tr
                  key={vm.id}
                  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                  onClick={() => openDrawer(vm)}
                >
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#0F172A]">{vm.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[11px] text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">{vm.template}</span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={vm.status} /></td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.cpu} vCPU</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.ram} GB</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.disk} GB</td>
                  <td className="px-5 py-3.5 text-[12px] text-[#94A3B8]">
                    {new Date(vm.updatedAt).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      {vm.status === 'STOPPED' && (
                        <button className="w-6 h-6 flex items-center justify-center rounded text-[#94A3B8] hover:text-[#16A34A] hover:bg-[#DCFCE7] transition-colors">
                          <Play size={11} />
                        </button>
                      )}
                      {vm.status === 'RUNNING' && (
                        <button className="w-6 h-6 flex items-center justify-center rounded text-[#94A3B8] hover:text-[#F59E0B] hover:bg-[#FEF3C7] transition-colors">
                          <Square size={11} />
                        </button>
                      )}
                    </div>
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

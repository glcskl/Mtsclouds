import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Server, Cpu, HardDrive, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function InfrastructurePage() {
  const { tenants } = useApp();

  const allVMs = tenants.flatMap(t => t.vms.map(v => ({ ...v, tenantName: t.name })));
  const totalCPU = tenants.reduce((s, t) => s + t.quota.cpu.used, 0);
  const totalDisk = tenants.reduce((s, t) => s + t.quota.disk.used, 0);
  const runningVMs = allVMs.filter(v => v.status === 'RUNNING').length;

  return (
    <AppShell breadcrumbs={['Platform Admin', 'Инфраструктура']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#0F172A]">Инфраструктура</h1>
          <p className="text-[13px] text-[#475569] mt-0.5">Провайдер: Docker · Все ресурсы платформы</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Server, label: 'Всего ВМ', value: allVMs.length, sub: `${runningVMs} запущено`, accent: 'bg-[#EFF6FF]', iconColor: 'text-[#3B82F6]' },
            { icon: Cpu, label: 'CPU используется', value: `${totalCPU} vCPU`, sub: 'По всем организациям', accent: 'bg-[#F5F3FF]', iconColor: 'text-[#7C3AED]' },
            { icon: HardDrive, label: 'Диск используется', value: `${totalDisk} GB`, sub: 'По всем организациям', accent: 'bg-[#DCFCE7]', iconColor: 'text-[#16A34A]' },
          ].map(({ icon: Icon, label, value, sub, accent, iconColor }) => (
            <div key={label} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[13px] text-[#475569]">{label}</span>
                <div className={`w-8 h-8 ${accent} rounded-lg flex items-center justify-center`}>
                  <Icon size={15} className={iconColor} />
                </div>
              </div>
              <p className="text-[24px] font-semibold text-[#0F172A] leading-none mb-1">{value}</p>
              <p className="text-[11px] text-[#94A3B8]">{sub}</p>
            </div>
          ))}
        </div>

        {/* All VMs table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h3 className="text-[15px] font-semibold text-[#0F172A]">Все виртуальные машины</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                {['Имя', 'Организация', 'Шаблон', 'CPU', 'RAM', 'Disk', 'IP', 'Статус'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {allVMs.map(vm => (
                <tr key={vm.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#0F172A]">{vm.name}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.tenantName}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[11px] text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">{vm.template}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.cpu}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.ram} GB</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.disk} GB</td>
                  <td className="px-5 py-3.5"><span className="font-mono text-[11px] text-[#475569]">{vm.ip}</span></td>
                  <td className="px-5 py-3.5"><StatusBadge status={vm.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
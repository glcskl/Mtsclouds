import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Server, Cpu, HardDrive, Boxes, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';

type DockerInfo = {
  dockerVersion: string;
  apiVersion: string;
  os: string;
  cpus: number;
  memoryTotalMb: number;
  storageDriver: string;
  images: number;
  containers: {
    total: number;
    running: number;
    stopped: number;
    managed: number;
  };
};

export default function InfrastructurePage() {
  const { tenants } = useApp();
  const [dockerInfo, setDockerInfo] = useState<DockerInfo | null>(null);
  const [dockerError, setDockerError] = useState('');
  const [dockerLoading, setDockerLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setDockerLoading(true);
      setDockerError('');
      try {
        const data = await api.getDockerInfo();
        setDockerInfo(data);
      } catch (err: any) {
        setDockerInfo(null);
        setDockerError(err.body?.details || err.body?.error || err.message || 'Docker unavailable');
      } finally {
        setDockerLoading(false);
      }
    })();
  }, []);

  const allVMs = tenants.flatMap(t => t.vms.map(v => ({ ...v, tenantName: t.name })));
  const totalCPU = tenants.reduce((sum, t) => sum + t.quota.cpu.used, 0);
  const totalDisk = tenants.reduce((sum, t) => sum + t.quota.disk.used, 0);
  const runningVMs = allVMs.filter(v => v.status === 'RUNNING').length;

  const memoryGb = dockerInfo ? (dockerInfo.memoryTotalMb / 1024).toFixed(1) : '0';

  return (
    <AppShell breadcrumbs={['Platform Admin', 'Инфраструктура']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#0F172A]">Инфраструктура</h1>
          <p className="text-[13px] text-[#475569] mt-0.5">Сводка по Docker-хосту и ресурсам платформы</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-[15px] font-semibold text-[#0F172A] mb-4">Docker Host</h3>
          {dockerLoading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-[13px] text-[#94A3B8]">
              <Loader2 size={16} className="animate-spin" />
              Получаем данные Docker...
            </div>
          ) : dockerInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: Boxes, label: 'Docker', value: dockerInfo.dockerVersion, sub: `API ${dockerInfo.apiVersion}` },
                  { icon: Server, label: 'ОС', value: dockerInfo.os, sub: `Storage: ${dockerInfo.storageDriver}` },
                  { icon: Cpu, label: 'CPU', value: `${dockerInfo.cpus}`, sub: 'Ядер доступно' },
                  { icon: HardDrive, label: 'Память', value: `${memoryGb} GB`, sub: `${dockerInfo.images} образов` },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-[#64748B]">{label}</span>
                      <Icon size={14} className="text-[#94A3B8]" />
                    </div>
                    <p className="text-[18px] font-semibold text-[#0F172A] leading-tight">{value}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Контейнеров всего', value: dockerInfo.containers.total },
                  { label: 'Running', value: dockerInfo.containers.running },
                  { label: 'Stopped', value: dockerInfo.containers.stopped },
                  { label: 'MTS-managed', value: dockerInfo.containers.managed },
                ].map(card => (
                  <div key={card.label} className="bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-4">
                    <p className="text-[12px] text-[#64748B] mb-1">{card.label}</p>
                    <p className="text-[20px] font-semibold text-[#0F172A] leading-none">{card.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4">
              <p className="text-[13px] font-medium text-[#B91C1C]">Docker unavailable</p>
              <p className="text-[12px] text-[#B91C1C]/80 mt-1">{dockerError}</p>
            </div>
          )}
        </div>

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

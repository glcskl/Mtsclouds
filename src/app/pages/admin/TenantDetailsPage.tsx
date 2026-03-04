import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppShell } from '../../components/layout/AppShell';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { QuotaBar } from '../../components/ui/QuotaBar';
import { Pencil, ArrowLeft, Server, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VMStatus } from '../../data/mockData';

const statusFilters: (VMStatus | 'ALL')[] = ['ALL', 'RUNNING', 'STOPPED', 'ERROR', 'CREATING', 'DELETING'];

export default function TenantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenants } = useApp();
  const [statusFilter, setStatusFilter] = useState<VMStatus | 'ALL'>('ALL');

  const tenant = tenants.find(t => t.id === id);

  if (!tenant) {
    return (
      <AppShell breadcrumbs={['Platform Admin', 'Организации', 'Не найдено']}>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-[16px] font-medium text-[#0F172A]">Организация не найдена</p>
          <button onClick={() => navigate('/admin/tenants')} className="mt-4 text-[13px] text-[#3B82F6] hover:underline">
            ← Назад к списку
          </button>
        </div>
      </AppShell>
    );
  }

  const vms = statusFilter === 'ALL' ? tenant.vms : tenant.vms.filter(v => v.status === statusFilter);

  return (
    <AppShell breadcrumbs={['Platform Admin', 'Организации', tenant.name]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button onClick={() => navigate('/admin/tenants')} className="mt-1 text-[#94A3B8] hover:text-[#475569] transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[22px] font-semibold text-[#0F172A]">{tenant.name}</h1>
                <StatusBadge status={tenant.status} />
              </div>
              <div className="flex items-center gap-3 text-[12px] text-[#94A3B8]">
                <span className="font-mono bg-[#F1F5F9] px-2 py-0.5 rounded text-[#475569]">{tenant.vdc}</span>
                <span>Создано {new Date(tenant.createdAt).toLocaleDateString('ru')}</span>
                <span>{tenant.vms.length} ВМ</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin/tenants/${tenant.id}/edit`)}
            className="flex items-center gap-2 px-4 h-9 border border-[#E2E8F0] rounded-lg text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
          >
            <Pencil size={14} />
            Изменить квоты
          </button>
        </div>

        {/* Quota section */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-[15px] font-semibold text-[#0F172A] mb-5">Квоты VDC</h3>
          <div className="grid grid-cols-2 gap-6">
            <QuotaBar label="CPU" used={tenant.quota.cpu.used} allocated={tenant.quota.cpu.allocated} limit={tenant.quota.cpu.limit} unit="vCPU" />
            <QuotaBar label="RAM" used={tenant.quota.ram.used} allocated={tenant.quota.ram.allocated} limit={tenant.quota.ram.limit} unit="GB" />
            <QuotaBar label="Диск" used={tenant.quota.disk.used} allocated={tenant.quota.disk.allocated} limit={tenant.quota.disk.limit} unit="GB" />
            <QuotaBar
              label="Виртуальные машины"
              used={tenant.quota.vms.used}
              allocated={tenant.quota.vms.allocated}
              limit={tenant.quota.vms.limit}
              unit="шт"
            />
          </div>
        </div>

        {/* VMs section */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Виртуальные машины</h3>
              <span className="text-[12px] text-[#94A3B8]">{tenant.vms.length} шт</span>
            </div>
            {/* Status filter pills */}
            <div className="flex items-center gap-1">
              {statusFilters.map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 h-7 rounded-lg text-[11px] font-medium transition-colors ${
                    statusFilter === f
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {f === 'ALL' ? 'Все' : f}
                </button>
              ))}
            </div>
          </div>

          {vms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 bg-[#F8FAFC] rounded-xl flex items-center justify-center mb-3">
                <Server size={22} className="text-[#CBD5E1]" />
              </div>
              <p className="text-[13px] font-medium text-[#475569]">Нет ВМ с таким статусом</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  {['Имя', 'Шаблон', 'CPU', 'RAM', 'Disk', 'IP', 'Статус', 'Обновлено'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {vms.map(vm => (
                  <tr key={vm.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-medium text-[#0F172A]">{vm.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">{vm.template}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.cpu} vCPU</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.ram} GB</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.disk} GB</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-[#475569]">{vm.ip}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={vm.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#94A3B8]">
                      {new Date(vm.updatedAt).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '../../components/layout/AppShell';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Plus, Search, Server, Play, Square, Maximize2, Trash2, MoreHorizontal, Eye, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VM, VMStatus } from '../../data/mockData';
import { api } from '../../api/client';

const statusFilters: (VMStatus | 'ALL')[] = ['ALL', 'RUNNING', 'STOPPED', 'ERROR', 'CREATING'];

export default function VMsListPage() {
  const navigate = useNavigate();
  const {
    activeTenant, tenants, setTenants, setSelectedVM, setShowVMDrawer,
    setShowDeleteModal, setDeleteTarget, addToast
  } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VMStatus | 'ALL'>('ALL');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  if (!activeTenant) return null;

  const vms = activeTenant.vms.filter(vm => {
    const matchSearch = vm.name.toLowerCase().includes(search.toLowerCase()) ||
      vm.template.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || vm.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openDrawer = (vm: VM) => {
    setSelectedVM(vm);
    setShowVMDrawer(true);
  };

  const { refreshTenants } = useApp();

  const updateVMStatus = async (vmId: string, newStatus: VMStatus) => {
    setLoading(l => ({ ...l, [vmId]: true }));
    try {
      if (newStatus === 'RUNNING') {
        await api.startVM(vmId);
      } else {
        await api.stopVM(vmId);
      }
      await refreshTenants();
      addToast({ type: 'success', title: `ВМ ${newStatus === 'RUNNING' ? 'запущена' : 'остановлена'}` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Ошибка', message: err.message });
    } finally {
      setLoading(l => ({ ...l, [vmId]: false }));
      setOpenMenu(null);
    }
  };

  const deleteVM = (vm: VM) => {
    setDeleteTarget({
      type: 'ВМ',
      name: vm.name,
      onConfirm: async () => {
        try {
          await api.deleteVM(vm.id);
          await refreshTenants();
          addToast({ type: 'success', title: 'ВМ удалена', message: vm.name });
        } catch (err: any) {
          addToast({ type: 'error', title: 'Ошибка удаления', message: err.message });
        }
      },
    });
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  return (
    <AppShell breadcrumbs={[activeTenant.name, 'Виртуальные машины']}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#0F172A]">Виртуальные машины</h1>
            <p className="text-[13px] text-[#475569] mt-0.5">
              {activeTenant.vms.length} ВМ · {activeTenant.vms.filter(v => v.status === 'RUNNING').length} запущено
            </p>
          </div>
          <button
            onClick={() => navigate('/tenant/vms/new')}
            className="flex items-center gap-2 px-4 h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors"
          >
            <Plus size={15} />
            Создать ВМ
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по имени или шаблону..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E2E8F0] text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 bg-white"
            />
          </div>
          <div className="flex items-center gap-1">
            {statusFilters.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 h-8 rounded-lg text-[12px] font-medium transition-colors ${
                  statusFilter === f ? 'bg-[#3B82F6] text-white' : 'bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                {f === 'ALL' ? 'Все' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-visible">
          {vms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-14 h-14 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-4">
                <Server size={26} className="text-[#CBD5E1]" />
              </div>
              <p className="text-[15px] font-medium text-[#0F172A] mb-1">
                {search || statusFilter !== 'ALL' ? 'Ничего не найдено' : 'Нет виртуальных машин'}
              </p>
              <p className="text-[13px] text-[#94A3B8] mb-5">
                {search || statusFilter !== 'ALL' ? 'Измените фильтры поиска' : 'Создайте первую ВМ для начала работы'}
              </p>
              {!search && statusFilter === 'ALL' && (
                <button
                  onClick={() => navigate('/tenant/vms/new')}
                  className="flex items-center gap-2 px-4 h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors"
                >
                  <Plus size={14} />
                  Создать ВМ
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {['Имя', 'Шаблон', 'Статус', 'CPU', 'RAM', 'Disk', 'IP', 'Uptime', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {vms.map(vm => (
                  <tr key={vm.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => openDrawer(vm)}
                        className="text-[13px] font-medium text-[#0F172A] hover:text-[#3B82F6] transition-colors text-left"
                      >
                        {vm.name}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">{vm.template}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={vm.status} />
                        {loading[vm.id] && <Loader2 size={12} className="animate-spin text-[#94A3B8]" />}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.cpu} vCPU</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.ram} GB</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{vm.disk} GB</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] text-[#475569]">{vm.ip}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#94A3B8]">{vm.uptime}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openDrawer(vm)}
                          className="w-7 h-7 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors"
                          title="Детали"
                        >
                          <Eye size={13} />
                        </button>
                        {vm.status === 'STOPPED' && (
                          <button
                            onClick={() => updateVMStatus(vm.id, 'RUNNING')}
                            disabled={loading[vm.id]}
                            className="w-7 h-7 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#DCFCE7] hover:text-[#16A34A] transition-colors"
                            title="Запустить"
                          >
                            <Play size={12} />
                          </button>
                        )}
                        {vm.status === 'RUNNING' && (
                          <button
                            onClick={() => updateVMStatus(vm.id, 'STOPPED')}
                            disabled={loading[vm.id]}
                            className="w-7 h-7 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#FEF3C7] hover:text-[#F59E0B] transition-colors"
                            title="Остановить"
                          >
                            <Square size={12} />
                          </button>
                        )}
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === vm.id ? null : vm.id)}
                            className="w-7 h-7 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#F1F5F9] transition-colors"
                          >
                            <MoreHorizontal size={13} />
                          </button>
                          {openMenu === vm.id && (
                            <div className="absolute right-0 top-8 z-30 bg-white border border-[#E2E8F0] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-1 w-44">
                              <button
                                onClick={() => { openDrawer(vm); setOpenMenu(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[#475569] hover:bg-[#F8FAFC]"
                              >
                                <Eye size={13} />Детали
                              </button>
                              <button
                                onClick={() => { navigate(`/tenant/vms/${vm.id}/resize`); setOpenMenu(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[#475569] hover:bg-[#F8FAFC]"
                              >
                                <Maximize2 size={13} />Изменить размер
                              </button>
                              <div className="border-t border-[#F1F5F9] my-1" />
                              <button
                                onClick={() => deleteVM(vm)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[#DC2626] hover:bg-[#FEE2E2]"
                              >
                                <Trash2 size={13} />Удалить
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {vms.length > 0 && (
            <div className="px-5 py-3 border-t border-[#F1F5F9] flex items-center justify-between">
              <p className="text-[12px] text-[#94A3B8]">Показано {vms.length} из {activeTenant.vms.length}</p>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 rounded text-[12px] font-medium bg-[#3B82F6] text-white">1</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

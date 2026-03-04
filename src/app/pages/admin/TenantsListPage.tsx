import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '../../components/layout/AppShell';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Ban, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Tenant } from '../../data/mockData';

type SortKey = 'name' | 'vdc' | 'status' | 'vms';
type SortDir = 'asc' | 'desc';

export default function TenantsListPage() {
  const navigate = useNavigate();
  const { tenants, setTenants, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = tenants
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.vdc.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';
      if (sortKey === 'name') { va = a.name; vb = b.name; }
      if (sortKey === 'vdc') { va = a.vdc; vb = b.vdc; }
      if (sortKey === 'status') { va = a.status; vb = b.status; }
      if (sortKey === 'vms') { va = a.vms.length; vb = b.vms.length; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleDisable = (tenant: Tenant) => {
    setTenants(tenants.map(t =>
      t.id === tenant.id ? { ...t, status: t.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : t
    ));
    addToast({ type: 'success', title: `Организация ${tenant.name} обновлена` });
    setOpenMenu(null);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-[#CBD5E1] opacity-50" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-[#3B82F6]" /> : <ChevronDown size={12} className="text-[#3B82F6]" />;
  };

  return (
    <AppShell breadcrumbs={['Platform Admin', 'Организации']}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#0F172A]">Организации</h1>
            <p className="text-[13px] text-[#475569] mt-0.5">{tenants.length} организации зарегистрировано</p>
          </div>
          <button
            onClick={() => navigate('/admin/tenants/new')}
            className="flex items-center gap-2 px-4 h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors"
          >
            <Plus size={15} />
            Создать организацию
          </button>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию или VDC..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#E2E8F0] text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {[
                  { key: 'name' as SortKey, label: 'Организация' },
                  { key: 'vdc' as SortKey, label: 'VDC' },
                  { key: null, label: 'Квота CPU' },
                  { key: null, label: 'Квота RAM' },
                  { key: null, label: 'Квота Disk' },
                  { key: 'vms' as SortKey, label: 'ВМ' },
                  { key: 'status' as SortKey, label: 'Статус' },
                  { key: null, label: '' },
                ].map(({ key, label }, i) => (
                  <th
                    key={i}
                    onClick={() => key && handleSort(key)}
                    className={`px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider ${key ? 'cursor-pointer hover:text-[#475569] select-none' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {key && <SortIcon col={key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <p className="text-[13px] text-[#94A3B8]">Организации не найдены</p>
                  </td>
                </tr>
              ) : (
                filtered.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-[13px] font-medium text-[#0F172A]">{tenant.name}</p>
                        <p className="text-[11px] text-[#94A3B8]">с {new Date(tenant.createdAt).toLocaleDateString('ru')}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-[12px] text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded">
                        {tenant.vdc}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <QuotaCell used={tenant.quota.cpu.used} alloc={tenant.quota.cpu.allocated} limit={tenant.quota.cpu.limit} unit="vCPU" />
                    </td>
                    <td className="px-5 py-4">
                      <QuotaCell used={tenant.quota.ram.used} alloc={tenant.quota.ram.allocated} limit={tenant.quota.ram.limit} unit="GB" />
                    </td>
                    <td className="px-5 py-4">
                      <QuotaCell used={tenant.quota.disk.used} alloc={tenant.quota.disk.allocated} limit={tenant.quota.disk.limit} unit="GB" />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] text-[#0F172A]">{tenant.vms.length} / {tenant.quota.vms.limit}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="px-5 py-4 relative">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                          className="w-7 h-7 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors"
                          title="Просмотр"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/tenants/${tenant.id}/edit`)}
                          className="w-7 h-7 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#EFF6FF] hover:text-[#3B82F6] transition-colors"
                          title="Редактировать"
                        >
                          <Pencil size={14} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenu(openMenu === tenant.id ? null : tenant.id)}
                            className="w-7 h-7 flex items-center justify-center rounded text-[#94A3B8] hover:bg-[#F1F5F9] transition-colors"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          {openMenu === tenant.id && (
                            <div className="absolute right-0 top-8 z-30 bg-white border border-[#E2E8F0] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-1 w-44">
                              <button
                                onClick={() => toggleDisable(tenant)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors"
                              >
                                <Ban size={13} />
                                {tenant.status === 'ACTIVE' ? 'Отключить' : 'Активировать'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-[#F1F5F9] flex items-center justify-between">
            <p className="text-[12px] text-[#94A3B8]">Показано {filtered.length} из {tenants.length}</p>
            <div className="flex items-center gap-1">
              {[1].map(p => (
                <button key={p} className="w-7 h-7 rounded text-[12px] font-medium bg-[#3B82F6] text-white">1</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function QuotaCell({ used, alloc, limit, unit }: { used: number; alloc: number; limit: number; unit: string }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct > 90 ? 'bg-[#DC2626]' : pct > 75 ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]';
  return (
    <div className="space-y-1 min-w-[100px]">
      <div className="flex justify-between text-[11px]">
        <span className="text-[#0F172A]">{used}/{alloc}</span>
        <span className="text-[#94A3B8]">{limit} {unit}</span>
      </div>
      <div className="h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

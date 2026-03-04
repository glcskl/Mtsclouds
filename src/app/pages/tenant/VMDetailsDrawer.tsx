import React, { useState, useEffect } from 'react';
import {
  X, Play, Square, Maximize2, Trash2, Copy, Terminal,
  Cpu, HardDrive, Clock, Server
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { vmMetricsData as fallbackMetrics } from '../../data/mockData';
import { api } from '../../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Tab = 'overview' | 'metrics' | 'logs';

export function VMDetailsDrawer() {
  const {
    showVMDrawer, setShowVMDrawer, selectedVM, setSelectedVM,
    activeTenant, tenants, setTenants, addToast,
    setShowDeleteModal, setDeleteTarget
  } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState(false);
  const [vmMetricsData, setVmMetricsData] = useState(fallbackMetrics);
  const { refreshTenants } = useApp();

  useEffect(() => {
    if (selectedVM) {
      api.getVMMetrics(selectedVM.id).then(setVmMetricsData).catch(() => {});
    }
  }, [selectedVM?.id]);

  if (!showVMDrawer || !selectedVM) return null;

  const close = () => {
    setShowVMDrawer(false);
    setSelectedVM(null);
  };

  const copySSH = () => {
    navigator.clipboard.writeText(`ssh user@vm-host -p ${selectedVM.port || 2222}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    try {
      await api.startVM(selectedVM.id);
      await refreshTenants();
      addToast({ type: 'success', title: 'ВМ запущена', message: selectedVM.name });
      close();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Ошибка', message: err.message });
    }
  };

  const handleStop = async () => {
    try {
      await api.stopVM(selectedVM.id);
      await refreshTenants();
      addToast({ type: 'success', title: 'ВМ остановлена', message: selectedVM.name });
      close();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Ошибка', message: err.message });
    }
  };

  const handleDelete = () => {
    setDeleteTarget({
      type: 'ВМ',
      name: selectedVM.name,
      onConfirm: async () => {
        try {
          await api.deleteVM(selectedVM.id);
          await refreshTenants();
          addToast({ type: 'success', title: 'ВМ удалена', message: selectedVM.name });
          close();
        } catch (err: any) {
          addToast({ type: 'error', title: 'Ошибка удаления', message: err.message });
        }
      }
    });
    setShowDeleteModal(true);
  };

  const isSSHTemplate = selectedVM.template.includes('sshd') || selectedVM.template.includes('ubuntu');

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={close} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[540px] bg-white border-l border-[#E2E8F0] shadow-[−8px_0_40px_rgba(0,0,0,0.1)] flex flex-col"
           style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-start justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[17px] font-semibold text-[#0F172A]">{selectedVM.name}</h2>
              <StatusBadge status={selectedVM.status} />
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#94A3B8]">
              <span className="flex items-center gap-1"><Server size={11} />{selectedVM.provider}</span>
              <span>·</span>
              <span className="font-mono bg-[#F1F5F9] px-2 py-0.5 rounded text-[#475569]">{selectedVM.id}</span>
            </div>
          </div>
          <button onClick={close} className="text-[#94A3B8] hover:text-[#475569] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Actions */}
        <div className="px-6 py-3 border-b border-[#E2E8F0] flex items-center gap-2 flex-shrink-0">
          {selectedVM.status === 'STOPPED' && (
            <button onClick={handleStart} className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#DCFCE7] text-[#15803D] text-[12px] font-medium hover:bg-[#BBF7D0] transition-colors">
              <Play size={12} /> Запустить
            </button>
          )}
          {selectedVM.status === 'RUNNING' && (
            <button onClick={handleStop} className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#FEF3C7] text-[#B45309] text-[12px] font-medium hover:bg-[#FDE68A] transition-colors">
              <Square size={12} /> Остановить
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#E2E8F0] text-[#475569] text-[12px] font-medium hover:bg-[#F8FAFC] transition-colors">
            <Maximize2 size={12} /> Resize
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#E2E8F0] text-[#DC2626] text-[12px] font-medium hover:bg-[#FEE2E2] hover:border-[#DC2626] transition-colors ml-auto"
          >
            <Trash2 size={12} /> Удалить
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-[#E2E8F0] flex flex-shrink-0">
          {(['overview', 'metrics', 'logs'] as Tab[]).map(t => {
            const labels = { overview: 'Обзор', metrics: 'Метрики', logs: 'Логи' };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 px-1 mr-5 text-[13px] font-medium border-b-2 transition-colors ${
                  tab === t ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#94A3B8] hover:text-[#475569]'
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {tab === 'overview' && (
            <>
              {/* Resources */}
              <div>
                <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Ресурсы</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Cpu, label: 'CPU', value: `${selectedVM.cpu} vCPU` },
                    { icon: HardDrive, label: 'RAM', value: `${selectedVM.ram} GB` },
                    { icon: HardDrive, label: 'Диск', value: `${selectedVM.disk} GB` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-[#F8FAFC] rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={13} className="text-[#94A3B8]" />
                        <span className="text-[11px] text-[#94A3B8]">{label}</span>
                      </div>
                      <p className="text-[15px] font-semibold text-[#0F172A]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Network */}
              <div>
                <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Сеть</p>
                <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[#475569]">IP-адрес</span>
                    <span className="font-mono text-[12px] text-[#0F172A]">{selectedVM.ip}</span>
                  </div>
                  {selectedVM.port && (
                    <div className="flex justify-between">
                      <span className="text-[12px] text-[#475569]">Порт</span>
                      <span className="font-mono text-[12px] text-[#0F172A]">{selectedVM.port}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[#475569]">Шаблон</span>
                    <span className="font-mono text-[12px] text-[#475569]">{selectedVM.template}</span>
                  </div>
                </div>
              </div>

              {/* Uptime */}
              <div>
                <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Время работы</p>
                <div className="bg-[#F8FAFC] rounded-lg p-4 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[#475569]">Uptime</span>
                    <span className="text-[12px] text-[#0F172A] font-medium">{selectedVM.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[#475569]">Создана</span>
                    <span className="text-[12px] text-[#0F172A]">{new Date(selectedVM.createdAt).toLocaleDateString('ru')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[#475569]">Обновлена</span>
                    <span className="text-[12px] text-[#0F172A]">
                      {new Date(selectedVM.updatedAt).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* SSH block */}
              {isSSHTemplate && selectedVM.status === 'RUNNING' && (
                <div>
                  <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">SSH-доступ</p>
                  <div className="bg-[#0F172A] rounded-lg p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal size={13} className="text-[#94A3B8]" />
                      <span className="text-[11px] text-[#64748B]">Команда подключения</span>
                    </div>
                    <p className="font-mono text-[13px] text-[#93C5FD]">
                      ssh user@vm-host -p {selectedVM.port || 2222}
                    </p>
                    <button
                      onClick={copySSH}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1E293B] hover:bg-[#334155] text-[11px] text-[#94A3B8] transition-colors"
                    >
                      <Copy size={11} />
                      {copied ? 'Скопировано' : 'Копировать'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'metrics' && (
            <>
              <div>
                <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">CPU (%)</p>
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={vmMetricsData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11 }} />
                      <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} dot={false} name="CPU %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">RAM (MB)</p>
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={vmMetricsData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit=" MB" />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11 }} />
                      <Line type="monotone" dataKey="ram" stroke="#7C3AED" strokeWidth={2} dot={false} name="RAM MB" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {tab === 'logs' && (
            <div>
              <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Системные логи</p>
              <div className="bg-[#0F172A] rounded-lg p-4 font-mono text-[11px] text-[#94A3B8] space-y-1 leading-relaxed">
                <p><span className="text-[#64748B]">2026-03-04 10:55:01</span> <span className="text-[#4ADE80]">INFO</span>  Container started</p>
                <p><span className="text-[#64748B]">2026-03-04 10:55:02</span> <span className="text-[#4ADE80]">INFO</span>  Health check: OK</p>
                <p><span className="text-[#64748B]">2026-03-04 10:55:05</span> <span className="text-[#4ADE80]">INFO</span>  Listening on port {selectedVM.port || 80}</p>
                <p><span className="text-[#64748B]">2026-03-04 11:00:00</span> <span className="text-[#93C5FD]">DEBUG</span> Metrics collected</p>
                <p><span className="text-[#64748B]">2026-03-04 11:00:00</span> <span className="text-[#4ADE80]">INFO</span>  cpu=12% mem=1.2GB</p>
                <p><span className="text-[#64748B]">2026-03-04 11:05:00</span> <span className="text-[#4ADE80]">INFO</span>  Request processed in 45ms</p>
                <p><span className="text-[#64748B]">2026-03-04 11:10:00</span> <span className="text-[#FBBF24]">WARN</span>  Memory usage above 70%</p>
                <p><span className="text-[#64748B]">2026-03-04 11:15:00</span> <span className="text-[#4ADE80]">INFO</span>  GC completed, freed 256MB</p>
                <p><span className="text-[#64748B]">2026-03-04 11:20:00</span> <span className="text-[#4ADE80]">INFO</span>  All systems nominal</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppShell } from '../../components/layout/AppShell';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Loader2, Server } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { templates } from '../../data/mockData';

type Step = 1 | 2 | 3;

interface Config {
  templateId: string;
  name: string;
  cpu: number;
  ram: number;
  disk: number;
}

export default function CreateVMPage() {
  const navigate = useNavigate();
  const { activeTenant, tenants, setTenants, addToast } = useApp();
  const [step, setStep] = useState<Step>(1);
  const [config, setConfig] = useState<Config>({ templateId: '', name: '', cpu: 1, ram: 1, disk: 10 });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!activeTenant) return null;
  const { quota } = activeTenant;

  const remainCPU = quota.cpu.allocated - quota.cpu.used;
  const remainRAM = quota.ram.allocated - quota.ram.used;
  const remainDisk = quota.disk.allocated - quota.disk.used;

  const selectedTemplate = templates.find(t => t.id === config.templateId);

  const selectTemplate = (tplId: string) => {
    const tpl = templates.find(t => t.id === tplId)!;
    setConfig(c => ({ ...c, templateId: tplId, cpu: tpl.defaultCpu, ram: tpl.defaultRam, disk: tpl.defaultDisk }));
    setErrors({});
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!config.name.trim()) errs.name = 'Укажите имя ВМ';
    if (config.cpu > remainCPU) errs.cpu = `Превышена квота (доступно ${remainCPU} vCPU)`;
    if (config.ram > remainRAM) errs.ram = `Превышена квота (доступно ${remainRAM} GB)`;
    if (config.disk > remainDisk) errs.disk = `Превышена квота (доступно ${remainDisk} GB)`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);

    const newVM = {
      id: `vm-${Date.now()}`,
      name: config.name,
      template: selectedTemplate!.image,
      status: 'CREATING' as const,
      cpu: config.cpu,
      ram: config.ram,
      disk: config.disk,
      ip: '—',
      uptime: '—',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      provider: 'Docker',
    };

    setTenants(tenants.map(t =>
      t.id === activeTenant.id
        ? {
            ...t,
            vms: [...t.vms, newVM],
            quota: {
              ...t.quota,
              cpu: { ...t.quota.cpu, used: t.quota.cpu.used + config.cpu },
              ram: { ...t.quota.ram, used: t.quota.ram.used + config.ram },
              disk: { ...t.quota.disk, used: t.quota.disk.used + config.disk },
              vms: { ...t.quota.vms, used: t.quota.vms.used + 1, allocated: t.quota.vms.allocated + 1 },
            },
          }
        : t
    ));

    addToast({ type: 'success', title: 'ВМ создаётся', message: config.name });
    navigate('/tenant/vms');
  };

  const categoryColors: Record<string, string> = {
    OS: 'bg-[#EFF6FF] text-[#2563EB]',
    Web: 'bg-[#DCFCE7] text-[#15803D]',
    Database: 'bg-[#F5F3FF] text-[#6D28D9]',
    Cache: 'bg-[#FEF3C7] text-[#B45309]',
    Monitoring: 'bg-[#E0F2FE] text-[#0369A1]',
    Runtime: 'bg-[#F1F5F9] text-[#475569]',
  };

  return (
    <AppShell breadcrumbs={[activeTenant.name, 'ВМ', 'Создать']}>
      <div className="max-w-[860px]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/tenant/vms')} className="text-[#94A3B8] hover:text-[#475569] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[22px] font-semibold text-[#0F172A]">Создать виртуальную машину</h1>
            <p className="text-[13px] text-[#475569] mt-0.5">Провайдер: Docker</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 mb-8">
          {([1, 2, 3] as Step[]).map((s, i) => {
            const labels = ['Шаблон', 'Конфигурация', 'Подтверждение'];
            const done = step > s;
            const active = step === s;
            return (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors ${
                    done ? 'bg-[#16A34A] text-white' : active ? 'bg-[#3B82F6] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'
                  }`}>
                    {done ? <Check size={13} /> : s}
                  </div>
                  <span className={`text-[12px] font-medium ${active ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>{labels[i]}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px mx-3 ${done ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step 1: Template selection */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => selectTemplate(tpl.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-[0_2px_8px_rgba(59,130,246,0.12)] ${
                    config.templateId === tpl.id
                      ? 'border-[#3B82F6] bg-[#EFF6FF]'
                      : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg flex items-center justify-center">
                      <Server size={15} className="text-[#3B82F6]" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[tpl.category] || 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold text-[#0F172A] mb-1">{tpl.name}</p>
                  <p className="text-[11px] text-[#94A3B8] mb-3 leading-relaxed">{tpl.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#475569]">
                    <span>{tpl.defaultCpu} vCPU</span>
                    <span>·</span>
                    <span>{tpl.defaultRam} GB RAM</span>
                    <span>·</span>
                    <span>{tpl.defaultDisk} GB</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => config.templateId && setStep(2)}
                disabled={!config.templateId}
                className="flex items-center gap-2 px-5 h-10 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Далее <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configure resources */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-5 gap-5">
              {/* Config form */}
              <div className="col-span-3 bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4">
                <h3 className="text-[14px] font-semibold text-[#0F172A]">Параметры ВМ</h3>

                <div>
                  <label className="block text-[12px] font-medium text-[#475569] mb-1.5">Имя ВМ</label>
                  <input
                    value={config.name}
                    onChange={e => setConfig(c => ({ ...c, name: e.target.value }))}
                    placeholder="web-server-01"
                    className={`w-full h-10 px-3 rounded-lg border text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-colors
                      ${errors.name ? 'border-[#DC2626] bg-[#FFF5F5]' : 'border-[#E2E8F0] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10'}`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  {errors.name && <p className="mt-1 text-[11px] text-[#DC2626]">{errors.name}</p>}
                </div>

                <NumberField
                  label={`CPU (vCPU) — доступно ${remainCPU}`}
                  value={config.cpu}
                  onChange={v => setConfig(c => ({ ...c, cpu: v }))}
                  min={1} max={Math.min(16, remainCPU)}
                  error={errors.cpu}
                  exceeded={config.cpu > remainCPU}
                />
                <NumberField
                  label={`RAM (GB) — доступно ${remainRAM}`}
                  value={config.ram}
                  onChange={v => setConfig(c => ({ ...c, ram: v }))}
                  min={1} max={Math.min(128, remainRAM)}
                  error={errors.ram}
                  exceeded={config.ram > remainRAM}
                />
                <NumberField
                  label={`Диск (GB) — доступно ${remainDisk}`}
                  value={config.disk}
                  onChange={v => setConfig(c => ({ ...c, disk: v }))}
                  min={5} max={Math.min(1000, remainDisk)}
                  error={errors.disk}
                  exceeded={config.disk > remainDisk}
                />
              </div>

              {/* Quota remaining */}
              <div className="col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <h4 className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Остаток квоты</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'CPU', val: config.cpu, remain: remainCPU, unit: 'vCPU' },
                      { label: 'RAM', val: config.ram, remain: remainRAM, unit: 'GB' },
                      { label: 'Disk', val: config.disk, remain: remainDisk, unit: 'GB' },
                    ].map(({ label, val, remain, unit }) => {
                      const exc = val > remain;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-[#475569]">{label}</span>
                            <span className={exc ? 'text-[#DC2626] font-medium' : 'text-[#94A3B8]'}>
                              {exc ? '⚠ Превышение' : `−${val} из ${remain} ${unit}`}
                            </span>
                          </div>
                          <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${exc ? 'bg-[#DC2626]' : 'bg-[#3B82F6]'}`}
                              style={{ width: `${Math.min((val / Math.max(remain, 1)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4">
                  <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Шаблон</p>
                  <p className="text-[13px] font-medium text-[#0F172A]">{selectedTemplate?.name}</p>
                  <p className="font-mono text-[11px] text-[#475569] mt-1">{selectedTemplate?.image}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 h-9 border border-[#E2E8F0] rounded-lg text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                <ArrowLeft size={14} /> Назад
              </button>
              <button
                onClick={() => validateStep2() && setStep(3)}
                className="flex items-center gap-2 px-5 h-10 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors"
              >
                Далее <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h3 className="text-[14px] font-semibold text-[#0F172A] mb-5">Подтверждение создания ВМ</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <ReviewRow label="Имя ВМ" value={config.name} mono />
                <ReviewRow label="Шаблон" value={selectedTemplate?.image || ''} mono />
                <ReviewRow label="Провайдер" value="Docker" />
                <ReviewRow label="Организация" value={activeTenant.name} />
                <ReviewRow label="CPU" value={`${config.cpu} vCPU`} />
                <ReviewRow label="RAM" value={`${config.ram} GB`} />
                <ReviewRow label="Диск" value={`${config.disk} GB`} />
                <ReviewRow label="VDC" value={activeTenant.vdc} mono />
              </div>
            </div>

            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-[#3B82F6] mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-[#1D4ED8]">
                ВМ будет создана в статусе <strong>CREATING</strong>. После запуска контейнера статус изменится на <strong>RUNNING</strong>.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 h-9 border border-[#E2E8F0] rounded-lg text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                <ArrowLeft size={14} /> Назад
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex items-center gap-2 px-5 h-10 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Создать ВМ
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-[#94A3B8] mb-0.5">{label}</p>
      <p className={`text-[13px] text-[#0F172A] font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function NumberField({
  label, value, onChange, min, max, error, exceeded
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; error?: string; exceeded?: boolean;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#475569] mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#475569] hover:bg-[#F8FAFC] text-[16px]"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-20 h-8 text-center rounded-lg border text-[13px] text-[#0F172A] outline-none transition-colors
            ${exceeded || error ? 'border-[#DC2626] bg-[#FFF5F5]' : 'border-[#E2E8F0] focus:border-[#3B82F6]'}`}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#475569] hover:bg-[#F8FAFC] text-[16px]"
        >
          +
        </button>
      </div>
      {error && <p className="mt-1 text-[11px] text-[#DC2626]">{error}</p>}
    </div>
  );
}

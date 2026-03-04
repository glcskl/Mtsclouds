import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AppShell } from '../../components/layout/AppShell';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';

interface FormData {
  name: string;
  vdc: string;
  cpuLimit: string;
  ramLimit: string;
  diskLimit: string;
  vmLimit: string;
}

interface Errors {
  name?: string;
  vdc?: string;
  cpuLimit?: string;
  ramLimit?: string;
  diskLimit?: string;
  vmLimit?: string;
}

export default function CreateTenantPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { tenants, setTenants, addToast } = useApp();
  const isEdit = !!id;
  const existing = isEdit ? tenants.find(t => t.id === id) : undefined;

  const [form, setForm] = useState<FormData>({
    name: existing?.name || '',
    vdc: existing?.vdc || '',
    cpuLimit: String(existing?.quota.cpu.limit || 8),
    ramLimit: String(existing?.quota.ram.limit || 32),
    diskLimit: String(existing?.quota.disk.limit || 200),
    vmLimit: String(existing?.quota.vms.limit || 10),
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!form.name.trim()) errs.name = 'Название обязательно';
    if (!form.vdc.trim()) errs.vdc = 'VDC обязателен';
    else if (!/^[a-z0-9-]+$/.test(form.vdc)) errs.vdc = 'Только строчные буквы, цифры и дефис';
    if (!form.cpuLimit || Number(form.cpuLimit) < 1) errs.cpuLimit = 'Минимум 1 vCPU';
    if (!form.ramLimit || Number(form.ramLimit) < 1) errs.ramLimit = 'Минимум 1 GB';
    if (!form.diskLimit || Number(form.diskLimit) < 10) errs.diskLimit = 'Минимум 10 GB';
    if (!form.vmLimit || Number(form.vmLimit) < 1) errs.vmLimit = 'Минимум 1 ВМ';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const { refreshTenants } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && id) {
        await api.updateTenant(id, {
          name: form.name,
          vdc: form.vdc,
          cpuLimit: Number(form.cpuLimit),
          ramLimit: Number(form.ramLimit),
          diskLimit: Number(form.diskLimit),
          vmLimit: Number(form.vmLimit),
        });
        await refreshTenants();
        addToast({ type: 'success', title: 'Организация обновлена', message: form.name });
        navigate(`/admin/tenants/${id}`);
      } else {
        await api.createTenant({
          name: form.name,
          vdc: form.vdc,
          cpuLimit: Number(form.cpuLimit),
          ramLimit: Number(form.ramLimit),
          diskLimit: Number(form.diskLimit),
          vmLimit: Number(form.vmLimit),
        });
        await refreshTenants();
        addToast({ type: 'success', title: 'Организация создана', message: form.name });
        navigate('/admin/tenants');
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Ошибка', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell breadcrumbs={['Platform Admin', 'Организации', isEdit ? 'Редактирование' : 'Создать']}>
      <div className="max-w-[640px] space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-[#94A3B8] hover:text-[#475569] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[22px] font-semibold text-[#0F172A]">
              {isEdit ? 'Редактировать организацию' : 'Новая организация'}
            </h1>
            <p className="text-[13px] text-[#475569] mt-0.5">
              {isEdit ? 'Изменение параметров и квот' : 'Регистрация в платформе и назначение квот'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-[14px] font-semibold text-[#0F172A] mb-4">Основные данные</h3>
            <div className="space-y-4">
              <Field
                label="Название организации"
                error={errors.name}
                hint="Отображается в интерфейсе платформы"
              >
                <input
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Acme Telecom"
                  className={inputClass(!!errors.name)}
                />
              </Field>

              <Field
                label="Имя VDC"
                error={errors.vdc}
                hint="Уникальный идентификатор виртуального датацентра (lowercase)"
              >
                <input
                  value={form.vdc}
                  onChange={set('vdc')}
                  placeholder="acme-vdc"
                  className={inputClass(!!errors.vdc)}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </Field>
            </div>
          </div>

          {/* Quotas card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-[14px] font-semibold text-[#0F172A] mb-4">Квоты ресурсов</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="CPU лимит (vCPU)" error={errors.cpuLimit}>
                <input type="number" min="1" max="256" value={form.cpuLimit} onChange={set('cpuLimit')} className={inputClass(!!errors.cpuLimit)} />
              </Field>
              <Field label="RAM лимит (GB)" error={errors.ramLimit}>
                <input type="number" min="1" max="4096" value={form.ramLimit} onChange={set('ramLimit')} className={inputClass(!!errors.ramLimit)} />
              </Field>
              <Field label="Диск лимит (GB)" error={errors.diskLimit}>
                <input type="number" min="10" max="100000" value={form.diskLimit} onChange={set('diskLimit')} className={inputClass(!!errors.diskLimit)} />
              </Field>
              <Field label="Лимит ВМ (шт)" error={errors.vmLimit}>
                <input type="number" min="1" max="500" value={form.vmLimit} onChange={set('vmLimit')} className={inputClass(!!errors.vmLimit)} />
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 h-10 rounded-lg border border-[#E2E8F0] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 h-10 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Сохранить изменения' : 'Создать организацию'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function inputClass(hasError: boolean) {
  return `w-full h-10 px-3 rounded-lg border text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-colors
    ${hasError
      ? 'border-[#DC2626] bg-[#FFF5F5] focus:ring-2 focus:ring-[#DC2626]/10'
      : 'border-[#E2E8F0] bg-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10'}`;
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#475569] mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-[#94A3B8]">{hint}</p>}
      {error && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle size={11} className="text-[#DC2626]" />
          <p className="text-[11px] text-[#DC2626]">{error}</p>
        </div>
      )}
    </div>
  );
}

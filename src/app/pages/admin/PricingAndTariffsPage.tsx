import React, { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Loader2, Save, Plus, Pencil, Power, Tag } from 'lucide-react';
import { formatBynParts } from '../../utils/money';

type Pricing = {
  cpu: number;
  ram: number;
  disk: number;
  bandwidth: number;
};

type TariffPlan = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  cpu: number;
  ramGb: number;
  diskGb: number;
  vms: number;
  bandwidthMbit: number;
  support: string;
  features: string[];
  popular: boolean;
  status: 'ACTIVE' | 'DISABLED';
  sortOrder: number;
};

const DEFAULT_PRICING: Pricing = { cpu: 1, ram: 0.6, disk: 0.1, bandwidth: 0.4 };

const statusBadgeClass: Record<TariffPlan['status'], string> = {
  ACTIVE: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
  DISABLED: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
};

export default function PricingAndTariffsPage() {
  const { addToast } = useApp();

  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricing, setPricing] = useState<Pricing>(DEFAULT_PRICING);

  const [tariffsLoading, setTariffsLoading] = useState(true);
  const [tariffs, setTariffs] = useState<TariffPlan[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tariffForm, setTariffForm] = useState({
    id: '',
    name: '',
    description: '',
    priceMonthly: 0,
    cpu: 0,
    ramGb: 0,
    diskGb: 0,
    vms: 0,
    bandwidthMbit: 0,
    support: '',
    featuresText: '',
    popular: false,
    status: 'ACTIVE' as TariffPlan['status'],
    sortOrder: 0,
  });

  const loadPricing = async () => {
    setPricingLoading(true);
    try {
      const current = await api.getPricing();
      setPricing(current);
    } catch (err: any) {
      setPricing(DEFAULT_PRICING);
      addToast({ type: 'warning', title: 'Не удалось загрузить цены', message: err.message });
    } finally {
      setPricingLoading(false);
    }
  };

  const loadTariffs = async () => {
    setTariffsLoading(true);
    try {
      const rows = await api.getTariffs();
      setTariffs(rows);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Ошибка загрузки тарифов', message: err.message });
    } finally {
      setTariffsLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
    loadTariffs();
  }, []);

  const savePricing = async () => {
    setPricingSaving(true);
    try {
      const next = await api.updatePricing(pricing);
      setPricing(next);
      addToast({ type: 'success', title: 'Цены сохранены' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Ошибка сохранения', message: err.body?.error || err.message });
    } finally {
      setPricingSaving(false);
    }
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setDialogError('');
    setTariffForm({
      id: 'tariff-',
      name: '',
      description: '',
      priceMonthly: 0,
      cpu: 0,
      ramGb: 0,
      diskGb: 0,
      vms: 0,
      bandwidthMbit: 0,
      support: '',
      featuresText: '',
      popular: false,
      status: 'ACTIVE',
      sortOrder: Math.max(0, ...tariffs.map(t => t.sortOrder || 0)) + 10,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (plan: TariffPlan) => {
    setEditingId(plan.id);
    setDialogError('');
    setTariffForm({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      cpu: plan.cpu,
      ramGb: plan.ramGb,
      diskGb: plan.diskGb,
      vms: plan.vms,
      bandwidthMbit: plan.bandwidthMbit,
      support: plan.support,
      featuresText: (plan.features || []).join('\n'),
      popular: Boolean(plan.popular),
      status: plan.status,
      sortOrder: plan.sortOrder || 0,
    });
    setDialogOpen(true);
  };

  const submitTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogSubmitting(true);
    setDialogError('');

    const features = tariffForm.featuresText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (!tariffForm.id.trim() || !tariffForm.name.trim() || !tariffForm.description.trim() || !tariffForm.support.trim()) {
      setDialogError('Заполните обязательные поля (id, name, description, support)');
      setDialogSubmitting(false);
      return;
    }

    if (features.length === 0) {
      setDialogError('Добавьте хотя бы одну фичу');
      setDialogSubmitting(false);
      return;
    }

    const payload = {
      id: tariffForm.id.trim(),
      name: tariffForm.name.trim(),
      description: tariffForm.description.trim(),
      priceMonthly: Number(tariffForm.priceMonthly) || 0,
      cpu: Number(tariffForm.cpu) || 0,
      ramGb: Number(tariffForm.ramGb) || 0,
      diskGb: Number(tariffForm.diskGb) || 0,
      vms: Number(tariffForm.vms) || 0,
      bandwidthMbit: Number(tariffForm.bandwidthMbit) || 0,
      support: tariffForm.support.trim(),
      features,
      popular: Boolean(tariffForm.popular),
      status: tariffForm.status,
      sortOrder: Number(tariffForm.sortOrder) || 0,
    };

    try {
      if (editingId) {
        await api.updateTariff(editingId, payload);
        addToast({ type: 'success', title: 'Тариф сохранён', message: payload.name });
      } else {
        await api.createTariff(payload);
        addToast({ type: 'success', title: 'Тариф создан', message: payload.name });
      }
      setDialogOpen(false);
      await loadTariffs();
    } catch (err: any) {
      setDialogError(err.body?.error || err.message || 'Ошибка сохранения тарифа');
    } finally {
      setDialogSubmitting(false);
    }
  };

  const toggleTariff = async (plan: TariffPlan) => {
    const nextStatus: TariffPlan['status'] = plan.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await api.updateTariff(plan.id, { status: nextStatus });
      addToast({ type: 'success', title: nextStatus === 'ACTIVE' ? 'Тариф включён' : 'Тариф отключён', message: plan.name });
      await loadTariffs();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Ошибка', message: err.body?.error || err.message });
    }
  };

  const popularCount = useMemo(() => tariffs.filter(t => t.popular).length, [tariffs]);

  return (
    <AppShell breadcrumbs={['Platform Admin', 'Цены и тарифы']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#0F172A]">Цены и тарифы</h1>
          <p className="text-[13px] text-[#475569] mt-0.5">Управление прайс-листом (используется в биллинге и калькуляторе) и тарифными планами</p>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Цены ресурсов</h3>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">BYN (Br) за 1 единицу в час</p>
            </div>
            <button
              onClick={savePricing}
              disabled={pricingSaving || pricingLoading}
              className="flex items-center gap-2 px-4 h-9 rounded-lg bg-[#E30613] hover:bg-[#C00510] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pricingSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Сохранить
            </button>
          </div>

          {pricingLoading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-[#94A3B8] text-[13px]">
              <Loader2 size={16} className="animate-spin" />
              Загрузка цен...
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 mt-5">
              {([
                { key: 'cpu', label: 'CPU', hint: 'vCPU / час', step: 0.1 },
                { key: 'ram', label: 'RAM', hint: 'GB / час', step: 0.1 },
                { key: 'disk', label: 'Disk', hint: 'GB / час', step: 0.1 },
                { key: 'bandwidth', label: 'Bandwidth', hint: 'Mbit/s / час', step: 0.1 },
              ] as const).map(row => (
                <div key={row.key} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                  <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">{row.label}</p>
                  <input
                    type="number"
                    step={row.step}
                    min={0}
                    value={(pricing as any)[row.key]}
                    onChange={e => setPricing(prev => ({ ...prev, [row.key]: Number(e.target.value) }))}
                    className="mt-2 w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] text-[#0F172A] outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10"
                  />
                  <p className="text-[11px] text-[#94A3B8] mt-2">{row.hint}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tariffs */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-[#0F172A] flex items-center gap-2">
                <Tag size={16} className="text-[#E30613]" />
                Тарифные планы
              </h3>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">Popular: {popularCount}</p>
            </div>
            <button
              onClick={openCreateDialog}
              className="flex items-center gap-2 px-4 h-9 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] font-medium transition-colors"
            >
              <Plus size={15} />
              Добавить тариф
            </button>
          </div>

          {tariffsLoading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-[#94A3B8] text-[13px]">
              <Loader2 size={16} className="animate-spin" />
              Загрузка тарифов...
            </div>
          ) : tariffs.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-[#94A3B8]">
              Тарифы не найдены
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {['Название', 'Цена/мес', 'Ресурсы', 'Popular', 'Статус', 'Действия'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {tariffs.map(plan => (
                  <tr key={plan.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="text-[13px] font-medium text-[#0F172A]">{plan.name}</div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">{plan.id}</div>
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-[#0F172A]">
                      {plan.priceMonthly > 0 ? (() => {
                        const { number, currency } = formatBynParts(plan.priceMonthly, 0);
                        return `${number} ${currency}`;
                      })() : 'Custom'}
                    </td>
                    <td className="px-6 py-3.5 text-[12px] text-[#475569]">
                      {plan.cpu} CPU • {plan.ramGb} GB • {plan.diskGb} GB • {plan.vms} VMs
                    </td>
                    <td className="px-6 py-3.5">
                      {plan.popular ? (
                        <Badge variant="outline" className="bg-[#FEE7E7] text-[#E30613] border-[#FECACA]">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]">No</Badge>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="outline" className={statusBadgeClass[plan.status]}>
                        {plan.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditDialog(plan)}
                          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#E2E8F0] text-[12px] font-medium text-[#475569] hover:bg-white hover:border-[#CBD5E1] transition-colors"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => toggleTariff(plan)}
                          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-[#E2E8F0] text-[12px] font-medium text-[#475569] hover:bg-white hover:border-[#CBD5E1] transition-colors"
                        >
                          <Power size={14} />
                          {plan.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[720px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать тариф' : 'Новый тариф'}</DialogTitle>
              <DialogDescription>Изменения будут видны на странице тарифов и в ссылках выбора плана</DialogDescription>
            </DialogHeader>

            <form onSubmit={submitTariff} className="space-y-4">
              {dialogError && (
                <div className="px-4 py-3 rounded-lg bg-[#FFF5F5] border border-[#FECACA] text-[#B91C1C] text-[12px]">
                  {dialogError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#475569] mb-1">ID</label>
                  <input
                    value={tariffForm.id}
                    onChange={e => setTariffForm(prev => ({ ...prev, id: e.target.value }))}
                    disabled={Boolean(editingId)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10 disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#475569] mb-1">Название</label>
                  <input
                    value={tariffForm.name}
                    onChange={e => setTariffForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#475569] mb-1">Описание</label>
                <input
                  value={tariffForm.description}
                  onChange={e => setTariffForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#475569] mb-1">Цена/мес (Br)</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={tariffForm.priceMonthly}
                    onChange={e => setTariffForm(prev => ({ ...prev, priceMonthly: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#475569] mb-1">Support</label>
                  <input
                    value={tariffForm.support}
                    onChange={e => setTariffForm(prev => ({ ...prev, support: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#475569] mb-1">Sort</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={tariffForm.sortOrder}
                    onChange={e => setTariffForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-6 gap-3">
                {([
                  { key: 'cpu', label: 'CPU' },
                  { key: 'ramGb', label: 'RAM (GB)' },
                  { key: 'diskGb', label: 'Disk (GB)' },
                  { key: 'vms', label: 'VMs' },
                  { key: 'bandwidthMbit', label: 'Mbit/s' },
                ] as const).map(field => (
                  <div key={field.key} className={field.key === 'bandwidthMbit' ? 'col-span-2' : 'col-span-1'}>
                    <label className="block text-[12px] font-medium text-[#475569] mb-1">{field.label}</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={(tariffForm as any)[field.key]}
                      onChange={e => setTariffForm(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#475569] mb-1">Фичи (по 1 на строку)</label>
                  <textarea
                    value={tariffForm.featuresText}
                    onChange={e => setTariffForm(prev => ({ ...prev, featuresText: e.target.value }))}
                    rows={8}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[13px] outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10"
                  />
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                    <p className="text-[12px] font-medium text-[#0F172A] mb-2">Статус</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusBadgeClass[tariffForm.status]}>
                        {tariffForm.status}
                      </Badge>
                      <select
                        value={tariffForm.status}
                        onChange={e => setTariffForm(prev => ({ ...prev, status: e.target.value as TariffPlan['status'] }))}
                        className="h-9 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DISABLED">DISABLED</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-[13px] text-[#475569]">
                    <input
                      type="checkbox"
                      checked={tariffForm.popular}
                      onChange={e => setTariffForm(prev => ({ ...prev, popular: e.target.checked }))}
                      className="w-4 h-4 accent-[#E30613]"
                    />
                    Популярный тариф
                  </label>

                  <div className="text-[12px] text-[#94A3B8]">
                    Подсказка: для Custom обычно цена = 0 и ресурсы = 0.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="px-4 h-9 rounded-lg border border-[#E2E8F0] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={dialogSubmitting}
                  className="px-4 h-9 rounded-lg bg-[#E30613] hover:bg-[#C00510] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {dialogSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Сохранить
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

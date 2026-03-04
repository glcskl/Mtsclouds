import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, Calendar, Zap, Server } from 'lucide-react';
import { pricing } from '../data/mockData';

export default function CostCalculatorPage() {
  const [cpu, setCpu] = useState(4);
  const [ram, setRam] = useState(8);
  const [disk, setDisk] = useState(100);
  const [bandwidth, setBandwidth] = useState(100);
  const [hours, setHours] = useState(730); // ~1 month
  const [vmCount, setVmCount] = useState(1);

  const [costs, setCosts] = useState({
    hourly: 0,
    daily: 0,
    monthly: 0,
    yearly: 0,
  });

  useEffect(() => {
    const hourlyCost = (
      cpu * pricing.cpu +
      ram * pricing.ram +
      disk * pricing.disk +
      bandwidth * pricing.bandwidth
    ) * vmCount;

    setCosts({
      hourly: hourlyCost,
      daily: hourlyCost * 24,
      monthly: hourlyCost * 730,
      yearly: hourlyCost * 8760,
    });
  }, [cpu, ram, disk, bandwidth, vmCount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const customCost = hours * costs.hourly;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-[#FEE7E7] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E30613] to-[#FF3B4F] text-white rounded-full mb-6 shadow-lg shadow-[#E30613]/30">
            <Calculator size={18} />
            <span className="text-[13px] font-bold">Калькулятор стоимости</span>
          </div>
          <h1 className="text-[42px] font-bold text-[#0F172A] mb-4">Расчет в реальном времени</h1>
          <p className="text-[16px] text-[#64748B] max-w-2xl mx-auto">
            Прозрачное ценообразование — рассчитайте стоимость использования облачных ресурсов
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-xl p-8">
              <h2 className="text-[24px] font-bold text-[#0F172A] mb-8 flex items-center gap-2">
                <Server size={24} className="text-[#E30613]" />
                Конфигурация ресурсов
              </h2>

              <div className="space-y-8">
                {/* VM Count */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[14px] font-medium text-[#0F172A]">
                      Количество виртуальных машин
                    </label>
                    <div className="px-4 py-1.5 bg-[#FEE7E7] text-[#E30613] rounded-lg text-[14px] font-bold">
                      {vmCount} VM
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={vmCount}
                    onChange={e => setVmCount(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-[#E2E8F0] to-[#FEE7E7] rounded-lg appearance-none cursor-pointer accent-[#E30613]"
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8] mt-2">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>

                {/* CPU */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[14px] font-medium text-[#0F172A]">
                      Процессор (vCPU)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-1.5 bg-[#FEE7E7] text-[#E30613] rounded-lg text-[14px] font-bold">
                        {cpu} cores
                      </div>
                      <div className="text-[13px] text-[#64748B]">
                        {formatCurrency(cpu * pricing.cpu * vmCount)}/час
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="64"
                    value={cpu}
                    onChange={e => setCpu(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-[#E2E8F0] to-[#FEE7E7] rounded-lg appearance-none cursor-pointer accent-[#E30613]"
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8] mt-2">
                    <span>1</span>
                    <span>64</span>
                  </div>
                </div>

                {/* RAM */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[14px] font-medium text-[#0F172A]">
                      Оперативная память (RAM)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-1.5 bg-[#FEE7E7] text-[#E30613] rounded-lg text-[14px] font-bold">
                        {ram} GB
                      </div>
                      <div className="text-[13px] text-[#64748B]">
                        {formatCurrency(ram * pricing.ram * vmCount)}/час
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="256"
                    value={ram}
                    onChange={e => setRam(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-[#E2E8F0] to-[#FEE7E7] rounded-lg appearance-none cursor-pointer accent-[#E30613]"
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8] mt-2">
                    <span>1 GB</span>
                    <span>256 GB</span>
                  </div>
                </div>

                {/* Disk */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[14px] font-medium text-[#0F172A]">
                      Дисковое пространство (SSD)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-1.5 bg-[#FEE7E7] text-[#E30613] rounded-lg text-[14px] font-bold">
                        {disk} GB
                      </div>
                      <div className="text-[13px] text-[#64748B]">
                        {formatCurrency(disk * pricing.disk * vmCount)}/час
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="5000"
                    step="10"
                    value={disk}
                    onChange={e => setDisk(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-[#E2E8F0] to-[#FEE7E7] rounded-lg appearance-none cursor-pointer accent-[#E30613]"
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8] mt-2">
                    <span>10 GB</span>
                    <span>5 TB</span>
                  </div>
                </div>

                {/* Bandwidth */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[14px] font-medium text-[#0F172A]">
                      Пропускная способность
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-1.5 bg-[#FEE7E7] text-[#E30613] rounded-lg text-[14px] font-bold">
                        {bandwidth} Mbit/s
                      </div>
                      <div className="text-[13px] text-[#64748B]">
                        {formatCurrency(bandwidth * pricing.bandwidth * vmCount)}/час
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={bandwidth}
                    onChange={e => setBandwidth(Number(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-[#E2E8F0] to-[#FEE7E7] rounded-lg appearance-none cursor-pointer accent-[#E30613]"
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8] mt-2">
                    <span>10 Mbit/s</span>
                    <span>1 Gbit/s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Period */}
            <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-xl p-8">
              <h3 className="text-[18px] font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-[#E30613]" />
                Произвольный период
              </h3>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[14px] font-medium text-[#0F172A]">
                    Количество часов: {hours}
                  </label>
                  <div className="px-4 py-1.5 bg-[#FEE7E7] text-[#E30613] rounded-lg text-[14px] font-bold">
                    {formatCurrency(customCost)}
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8760"
                  value={hours}
                  onChange={e => setHours(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-[#E2E8F0] to-[#FEE7E7] rounded-lg appearance-none cursor-pointer accent-[#E30613]"
                />
                <div className="flex justify-between text-[11px] text-[#94A3B8] mt-2">
                  <span>1 час</span>
                  <span>365 дней</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Summary Panel */}
          <div className="space-y-6">
            {/* Real-time costs */}
            <div className="bg-gradient-to-br from-[#E30613] to-[#FF3B4F] rounded-2xl shadow-2xl p-8 text-white sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <Zap size={24} />
                <h2 className="text-[20px] font-bold">Стоимость</h2>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <p className="text-[12px] opacity-80 mb-1">В час</p>
                  <p className="text-[32px] font-bold">{formatCurrency(costs.hourly)}</p>
                </div>

                <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <p className="text-[12px] opacity-80 mb-1">В день</p>
                  <p className="text-[28px] font-bold">{formatCurrency(costs.daily)}</p>
                </div>

                <div className="p-5 bg-white/20 backdrop-blur-sm rounded-xl border-2 border-white/40 shadow-lg">
                  <p className="text-[12px] opacity-80 mb-1">В месяц</p>
                  <p className="text-[32px] font-bold">{formatCurrency(costs.monthly)}</p>
                  <p className="text-[11px] opacity-70 mt-1">~730 часов</p>
                </div>

                <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <p className="text-[12px] opacity-80 mb-1">В год</p>
                  <p className="text-[28px] font-bold">{formatCurrency(costs.yearly)}</p>
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <p className="text-[11px] opacity-70">Экономия при годовой оплате:</p>
                    <p className="text-[16px] font-bold text-[#10B981]">
                      {formatCurrency(costs.yearly * 0.15)}
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full h-12 bg-white text-[#E30613] rounded-xl text-[14px] font-bold hover:bg-[#F8FAFC] transition-colors mt-6 shadow-xl">
                Начать использование
              </button>
            </div>

            {/* Price breakdown */}
            <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-xl p-6">
              <h3 className="text-[16px] font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-[#E30613]" />
                Детализация
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#64748B]">CPU ({cpu} × {vmCount})</span>
                  <span className="font-semibold text-[#0F172A]">{formatCurrency(cpu * pricing.cpu * vmCount)}/ч</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#64748B]">RAM ({ram} GB × {vmCount})</span>
                  <span className="font-semibold text-[#0F172A]">{formatCurrency(ram * pricing.ram * vmCount)}/ч</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#64748B]">Disk ({disk} GB × {vmCount})</span>
                  <span className="font-semibold text-[#0F172A]">{formatCurrency(disk * pricing.disk * vmCount)}/ч</span>
                </div>
                <div className="flex items-center justify-between text-[13px] pb-3 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Bandwidth ({bandwidth} Mbit/s × {vmCount})</span>
                  <span className="font-semibold text-[#0F172A]">{formatCurrency(bandwidth * pricing.bandwidth * vmCount)}/ч</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[14px] font-semibold text-[#0F172A]">Итого</span>
                  <span className="text-[16px] font-bold text-[#E30613]">{formatCurrency(costs.hourly)}/ч</span>
                </div>
              </div>
            </div>

            {/* Savings tip */}
            <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={20} />
                <h3 className="text-[16px] font-bold">Совет по экономии</h3>
              </div>
              <p className="text-[13px] opacity-90 leading-relaxed">
                Оплата за год дает скидку 15%. Экономия составит{' '}
                <span className="font-bold">{formatCurrency(costs.yearly * 0.15)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

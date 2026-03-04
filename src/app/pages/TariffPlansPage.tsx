import React, { useState } from 'react';
import { Check, Zap, TrendingUp, Award, Sparkles } from 'lucide-react';
import { tariffPlans } from '../data/mockData';
import { Link } from 'react-router';

export default function TariffPlansPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (basePrice: number) => {
    if (basePrice === 0) return 'По запросу';
    const price = billingPeriod === 'yearly' ? basePrice * 12 * 0.85 : basePrice;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-[#FEE7E7] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FEE7E7] rounded-full mb-6">
            <Zap size={16} className="text-[#E30613]" />
            <span className="text-[13px] font-medium text-[#E30613]">МТС Cloud Platform</span>
          </div>
          <h1 className="text-[42px] font-bold text-[#0F172A] mb-4">Тарифные планы</h1>
          <p className="text-[18px] text-[#64748B] max-w-2xl mx-auto">
            Выберите оптимальный план для вашего бизнеса. Гибкие условия, прозрачное ценообразование.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-5 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-[#E30613] text-white shadow-lg shadow-[#E30613]/20'
                  : 'bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]'
              }`}
            >
              Ежемесячно
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-5 py-2.5 rounded-lg text-[14px] font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-[#E30613] text-white shadow-lg shadow-[#E30613]/20'
                  : 'bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]'
              }`}
            >
              Ежегодно
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#10B981] text-white text-[10px] font-bold rounded-full">
                -15%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tariffPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 transition-all hover:shadow-2xl hover:-translate-y-1 ${
                plan.popular
                  ? 'border-[#E30613] shadow-xl shadow-[#E30613]/10'
                  : 'border-[#E2E8F0] hover:border-[#E30613]/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#E30613] to-[#FF3B4F] text-white text-[12px] font-bold rounded-full shadow-lg">
                    <Award size={14} />
                    Популярный
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-[24px] font-bold text-[#0F172A] mb-2">{plan.name}</h3>
                  <p className="text-[13px] text-[#64748B] min-h-[40px]">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    {plan.price > 0 ? (
                      <>
                        <span className="text-[36px] font-bold text-[#E30613]">
                          {getPrice(plan.price).replace(/[^\d\s]/g, '')}
                        </span>
                        <span className="text-[14px] text-[#64748B]">₽</span>
                      </>
                    ) : (
                      <span className="text-[24px] font-bold text-[#E30613]">По запросу</span>
                    )}
                  </div>
                  {plan.price > 0 && (
                    <p className="text-[12px] text-[#94A3B8] mt-1">
                      {billingPeriod === 'monthly' ? 'в месяц' : 'в год'}
                    </p>
                  )}
                </div>

                {/* Resources */}
                {plan.cpu > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-[#F8FAFC] rounded-xl">
                    <div>
                      <p className="text-[11px] text-[#64748B] mb-1">CPU</p>
                      <p className="text-[16px] font-semibold text-[#0F172A]">{plan.cpu} vCPU</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#64748B] mb-1">RAM</p>
                      <p className="text-[16px] font-semibold text-[#0F172A]">{plan.ram} GB</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#64748B] mb-1">Диск</p>
                      <p className="text-[16px] font-semibold text-[#0F172A]">{plan.disk} GB</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#64748B] mb-1">VMs</p>
                      <p className="text-[16px] font-semibold text-[#0F172A]">{plan.vms}</p>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="mt-0.5">
                        <Check size={16} className="text-[#E30613]" />
                      </div>
                      <span className="text-[13px] text-[#475569] leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  className={`w-full h-11 rounded-lg text-[14px] font-medium transition-all ${
                    plan.popular
                      ? 'bg-[#E30613] hover:bg-[#C00510] text-white shadow-lg shadow-[#E30613]/20'
                      : 'bg-white hover:bg-[#F8FAFC] text-[#E30613] border-2 border-[#E30613]'
                  }`}
                >
                  {plan.price === 0 ? 'Связаться с нами' : 'Выбрать план'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <div className="w-12 h-12 bg-[#FEE7E7] rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={24} className="text-[#E30613]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#0F172A] mb-2">Масштабируемость</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Увеличивайте ресурсы по мере роста вашего би��неса без простоев
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <div className="w-12 h-12 bg-[#FEE7E7] rounded-xl flex items-center justify-center mb-4">
              <Award size={24} className="text-[#E30613]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#0F172A] mb-2">SLA Гарантии</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              До 99.95% доступности для корпоративных клиентов
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <div className="w-12 h-12 bg-[#FEE7E7] rounded-xl flex items-center justify-center mb-4">
              <Sparkles size={24} className="text-[#E30613]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#0F172A] mb-2">Поддержка 24/7</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Круглосуточная техническая поддержка на русском языке
            </p>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-[14px] text-[#64748B] mb-4">
            Нужна помощь в выборе тарифа?
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-[14px] font-medium transition-colors"
          >
            Начать бесплатный тест
          </Link>
        </div>
      </div>
    </div>
  );
}

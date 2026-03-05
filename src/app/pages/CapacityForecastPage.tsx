import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Brain, TrendingUp, Cpu, HardDrive, Database, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { workloadTypes, userLoadLevels } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function CapacityForecastPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [workloadType, setWorkloadType] = useState('web-app');
  const [userLoad, setUserLoad] = useState('medium');
  const [vmCount, setVmCount] = useState(3);
  const [analyzing, setAnalyzing] = useState(false);
  const [forecast, setForecast] = useState<any>(null);

  const runForecast = () => {
    setAnalyzing(true);
    setForecast(null);

    const workload = workloadTypes.find(w => w.id === workloadType)!;
    const load = userLoadLevels.find(l => l.id === userLoad)!;

    const baseCpu = workload.baseCpu * load.multiplier * vmCount;
    const baseRam = workload.baseRam * load.multiplier * vmCount;
    const baseDisk = workload.baseDisk * vmCount;

    setForecast({
      cpu: {
        min: Math.round(baseCpu * 0.7),
        recommended: baseCpu,
        max: Math.round(baseCpu * 1.5),
      },
      ram: {
        min: Math.round(baseRam * 0.7),
        recommended: baseRam,
        max: Math.round(baseRam * 1.5),
      },
      disk: {
        min: Math.round(baseDisk * 0.8),
        recommended: baseDisk,
        max: Math.round(baseDisk * 2),
      },
      confidence: 0.87 + Math.random() * 0.1,
      insights: [
        `Для ${workload.name.toLowerCase()} с нагрузкой "${load.name}" рекомендуется ${baseCpu} vCPU`,
        `Оперативная память: ${baseRam} GB обеспечит оптимальную производительность`,
        `Резерв мощности 30% для пиковых нагрузок`,
        `Прогнозируемый рост нагрузки: +${Math.round(15 + Math.random() * 20)}% в квартал`,
      ],
    });

    setAnalyzing(false);
  };

  useEffect(() => {
    if (forecast) {
      runForecast();
    }
  }, [workloadType, userLoad, vmCount]);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-[#FEE7E7] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 px-4 h-9 rounded-lg border border-[#E2E8F0] bg-white text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Назад
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E30613] to-[#FF3B4F] text-white rounded-full mb-6 shadow-lg shadow-[#E30613]/30">
            <Brain size={18} className="animate-pulse" />
            <span className="text-[13px] font-bold">AI Прогнозирование</span>
          </div>
          <h1 className="text-[42px] font-bold text-[#0F172A] mb-4">Расчет мощностей</h1>
          <p className="text-[16px] text-[#64748B] max-w-2xl mx-auto">
            Нейросеть определит оптимальную конфигурацию инфраструктуры для ваших задач
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-xl p-8">
              <h2 className="text-[20px] font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-[#E30613]" />
                Параметры анализа
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-medium text-[#475569] mb-3">
                    Тип нагрузки
                  </label>
                  <div className="space-y-2">
                    {workloadTypes.map(w => (
                      <button
                        key={w.id}
                        onClick={() => setWorkloadType(w.id)}
                        className={`w-full px-4 py-3 rounded-lg text-left text-[14px] font-medium transition-all border-2 ${
                          workloadType === w.id
                            ? 'bg-[#FEE7E7] border-[#E30613] text-[#E30613]'
                            : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#E30613]/30'
                        }`}
                      >
                        {w.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#475569] mb-3">
                    Уровень нагрузки
                  </label>
                  <select
                    value={userLoad}
                    onChange={e => setUserLoad(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border-2 border-[#E2E8F0] bg-white text-[14px] text-[#0F172A] outline-none focus:border-[#E30613] transition-all"
                  >
                    {userLoadLevels.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#475569] mb-3">
                    Количество VM: {vmCount}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={vmCount}
                    onChange={e => setVmCount(Number(e.target.value))}
                    className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#E30613]"
                  />
                  <div className="flex justify-between text-[11px] text-[#94A3B8] mt-1">
                    <span>1</span>
                    <span>20</span>
                  </div>
                </div>

                <button
                  onClick={runForecast}
                  disabled={analyzing}
                  className="w-full h-12 bg-gradient-to-r from-[#E30613] to-[#FF3B4F] hover:from-[#C00510] hover:to-[#E30613] text-white rounded-lg text-[14px] font-bold transition-all shadow-lg shadow-[#E30613]/30 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Анализируем...
                    </>
                  ) : (
                    <>
                      <Brain size={18} />
                      Запустить анализ
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Insights */}
            {forecast && (
              <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-xl p-8 text-white">
                <h3 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
                  <Brain size={18} />
                  AI Рекомендации
                </h3>
                <div className="space-y-3">
                  {forecast.insights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-[13px] leading-relaxed opacity-90">
                      <div className="mt-1">
                        <div className="w-1.5 h-1.5 bg-[#E30613] rounded-full" />
                      </div>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] opacity-70">Точность прогноза</span>
                    <span className="text-[16px] font-bold text-[#10B981]">
                      {(forecast.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] transition-all duration-1000"
                      style={{ width: `${forecast.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            {analyzing && (
              <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-xl p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#E30613] to-[#FF3B4F] rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-[#E30613]/30">
                  <Brain size={40} className="text-white" />
                </div>
                <h3 className="text-[20px] font-semibold text-[#0F172A] mb-3">Анализируем данные...</h3>
                <p className="text-[14px] text-[#64748B] mb-8">Нейросеть обрабатывает параметры вашей нагрузки</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {!analyzing && !forecast && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-12 text-center">
                <div className="w-16 h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={32} className="text-[#94A3B8]" />
                </div>
                <h3 className="text-[18px] font-semibold text-[#475569] mb-2">Готовы к анализу</h3>
                <p className="text-[14px] text-[#94A3B8]">
                  Настройте параметры и нажмите "Запустить анализ"
                </p>
              </div>
            )}

            {!analyzing && forecast && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] shadow-xl p-8">
                  <h2 className="text-[24px] font-bold text-[#0F172A] mb-6">Рекомендуемая конфигурация</h2>

                  {/* CPU */}
                  <div className="mb-8 p-6 bg-gradient-to-br from-[#FEE7E7] to-white rounded-xl border border-[#E30613]/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#E30613] rounded-xl flex items-center justify-center shadow-lg">
                        <Cpu size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#0F172A]">Процессор (vCPU)</h3>
                        <p className="text-[12px] text-[#64748B]">Виртуальные ядра</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg border border-[#E2E8F0]">
                        <p className="text-[11px] text-[#64748B] mb-1">Минимум</p>
                        <p className="text-[20px] font-bold text-[#475569]">{forecast.cpu.min}</p>
                      </div>
                      <div className="text-center p-3 bg-[#E30613] rounded-lg shadow-lg">
                        <p className="text-[11px] text-white/80 mb-1">Оптимально</p>
                        <p className="text-[20px] font-bold text-white">{forecast.cpu.recommended}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-[#E2E8F0]">
                        <p className="text-[11px] text-[#64748B] mb-1">Максимум</p>
                        <p className="text-[20px] font-bold text-[#475569]">{forecast.cpu.max}</p>
                      </div>
                    </div>
                  </div>

                  {/* RAM */}
                  <div className="mb-8 p-6 bg-gradient-to-br from-[#FEE7E7] to-white rounded-xl border border-[#E30613]/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#E30613] rounded-xl flex items-center justify-center shadow-lg">
                        <Database size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#0F172A]">Оперативная память</h3>
                        <p className="text-[12px] text-[#64748B]">RAM в гигабайтах</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg border border-[#E2E8F0]">
                        <p className="text-[11px] text-[#64748B] mb-1">Минимум</p>
                        <p className="text-[20px] font-bold text-[#475569]">{forecast.ram.min} GB</p>
                      </div>
                      <div className="text-center p-3 bg-[#E30613] rounded-lg shadow-lg">
                        <p className="text-[11px] text-white/80 mb-1">Оптимально</p>
                        <p className="text-[20px] font-bold text-white">{forecast.ram.recommended} GB</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-[#E2E8F0]">
                        <p className="text-[11px] text-[#64748B] mb-1">Максимум</p>
                        <p className="text-[20px] font-bold text-[#475569]">{forecast.ram.max} GB</p>
                      </div>
                    </div>
                  </div>

                  {/* Disk */}
                  <div className="p-6 bg-gradient-to-br from-[#FEE7E7] to-white rounded-xl border border-[#E30613]/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[#E30613] rounded-xl flex items-center justify-center shadow-lg">
                        <HardDrive size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#0F172A]">Дисковое пространство</h3>
                        <p className="text-[12px] text-[#64748B]">SSD в гигабайтах</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg border border-[#E2E8F0]">
                        <p className="text-[11px] text-[#64748B] mb-1">Минимум</p>
                        <p className="text-[20px] font-bold text-[#475569]">{forecast.disk.min} GB</p>
                      </div>
                      <div className="text-center p-3 bg-[#E30613] rounded-lg shadow-lg">
                        <p className="text-[11px] text-white/80 mb-1">Оптимально</p>
                        <p className="text-[20px] font-bold text-white">{forecast.disk.recommended} GB</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-[#E2E8F0]">
                        <p className="text-[11px] text-[#64748B] mb-1">Максимум</p>
                        <p className="text-[20px] font-bold text-[#475569]">{forecast.disk.max} GB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-br from-[#E30613] to-[#FF3B4F] rounded-2xl shadow-xl p-8 text-white">
                  <h3 className="text-[20px] font-bold mb-4">Итоговая конфигурация</h3>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-[12px] opacity-80 mb-1">CPU</p>
                      <p className="text-[28px] font-bold">{forecast.cpu.recommended}</p>
                      <p className="text-[11px] opacity-70">vCPU ядер</p>
                    </div>
                    <div>
                      <p className="text-[12px] opacity-80 mb-1">RAM</p>
                      <p className="text-[28px] font-bold">{forecast.ram.recommended}</p>
                      <p className="text-[11px] opacity-70">GB памяти</p>
                    </div>
                    <div>
                      <p className="text-[12px] opacity-80 mb-1">Disk</p>
                      <p className="text-[28px] font-bold">{forecast.disk.recommended}</p>
                      <p className="text-[11px] opacity-70">GB SSD</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(currentUser && currentUser.role !== 'platform_admin' ? '/tenant/vms/new' : '/calculator')}
                    className="w-full h-12 bg-white text-[#E30613] rounded-lg text-[14px] font-bold hover:bg-[#F8FAFC] transition-colors"
                  >
                    Применить конфигурацию
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

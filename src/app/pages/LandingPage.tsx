import React from 'react';
import { Link } from 'react-router';
import { 
  Shield, Zap, Calculator, Brain, CreditCard, Users, 
  Server, TrendingUp, Award, Lock, Cloud, CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-[#FEE7E7]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #E30613 2px, transparent 2px), radial-gradient(circle at 75% 75%, #E30613 2px, transparent 2px)`,
            backgroundSize: '64px 64px'
          }} />
        </div>

        {/* Navbar */}
        <nav className="relative z-10 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#E30613] to-[#B00510] rounded-xl flex items-center justify-center shadow-lg shadow-[#E30613]/30">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-[20px] font-bold text-[#0F172A]">МТС Cloud</h1>
                <p className="text-[11px] text-[#64748B]">Enterprise IaaS Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login"
                className="px-5 py-2.5 text-[14px] font-medium text-[#0F172A] hover:text-[#E30613] transition-colors"
              >
                Войти
              </Link>
              <Link 
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-[#E30613] to-[#FF3B4F] text-white rounded-lg text-[14px] font-medium shadow-lg shadow-[#E30613]/30 hover:shadow-xl hover:shadow-[#E30613]/40 transition-all"
              >
                Начать
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-full mb-8 shadow-lg">
            <Zap size={16} className="text-[#E30613]" />
            <span className="text-[13px] font-medium text-[#475569]">Новое поколение облачных решений</span>
          </div>
          
          <h1 className="text-[56px] font-bold text-[#0F172A] mb-6 leading-tight">
            Корпоративная IaaS<br />платформа от МТС
          </h1>
          
          <p className="text-[20px] text-[#64748B] max-w-3xl mx-auto mb-12 leading-relaxed">
            Управляйте облачной инфраструктурой с искусственным интеллектом, прозрачным ценообразованием и поддержкой 24/7
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-[#E30613] to-[#FF3B4F] text-white rounded-xl text-[16px] font-bold shadow-2xl shadow-[#E30613]/40 hover:shadow-[#E30613]/60 hover:-translate-y-0.5 transition-all"
            >
              Создать аккаунт
            </Link>
            <Link 
              to="/tariffs"
              className="px-8 py-4 bg-white border-2 border-[#E30613] text-[#E30613] rounded-xl text-[16px] font-bold hover:bg-[#FEE7E7] transition-all"
            >
              Тарифы
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
            <div>
              <div className="text-[36px] font-bold text-[#E30613] mb-1">99.95%</div>
              <div className="text-[13px] text-[#64748B]">Доступность</div>
            </div>
            <div>
              <div className="text-[36px] font-bold text-[#E30613] mb-1">24/7</div>
              <div className="text-[13px] text-[#64748B]">Поддержка</div>
            </div>
            <div>
              <div className="text-[36px] font-bold text-[#E30613] mb-1">1000+</div>
              <div className="text-[13px] text-[#64748B]">Клиентов</div>
            </div>
            <div>
              <div className="text-[36px] font-bold text-[#E30613] mb-1">5 мин</div>
              <div className="text-[13px] text-[#64748B]">Развертывание</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-[42px] font-bold text-[#0F172A] mb-4">Инновационные возможности</h2>
          <p className="text-[18px] text-[#64748B]">Все что нужно для управления облачной инфраструктурой</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* AI Forecast */}
          <Link 
            to="/forecast"
            className="group bg-white rounded-2xl border-2 border-[#E2E8F0] p-8 hover:border-[#E30613] hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#E30613] to-[#FF3B4F] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#E30613]/30 group-hover:shadow-xl group-hover:shadow-[#E30613]/50 transition-all">
              <Brain size={28} className="text-white" />
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-3">AI Прогнозирование</h3>
            <p className="text-[14px] text-[#64748B] leading-relaxed mb-4">
              Нейросеть рассчитает оптимальные мощности для ваших задач с точностью до 90%
            </p>
            <div className="flex items-center gap-2 text-[#E30613] font-medium text-[14px]">
              Попробовать <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Cost Calculator */}
          <Link 
            to="/calculator"
            className="group bg-white rounded-2xl border-2 border-[#E2E8F0] p-8 hover:border-[#E30613] hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#E30613] to-[#FF3B4F] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#E30613]/30 group-hover:shadow-xl group-hover:shadow-[#E30613]/50 transition-all">
              <Calculator size={28} className="text-white" />
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-3">Калькулятор стоимости</h3>
            <p className="text-[14px] text-[#64748B] leading-relaxed mb-4">
              Рассчитайте стоимость использования ресурсов в реальном времени
            </p>
            <div className="flex items-center gap-2 text-[#E30613] font-medium text-[14px]">
              Рассчитать <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tariff Plans */}
          <Link 
            to="/tariffs"
            className="group bg-white rounded-2xl border-2 border-[#E2E8F0] p-8 hover:border-[#E30613] hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#E30613] to-[#FF3B4F] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#E30613]/30 group-hover:shadow-xl group-hover:shadow-[#E30613]/50 transition-all">
              <CreditCard size={28} className="text-white" />
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-3">Гибкие тарифы</h3>
            <p className="text-[14px] text-[#64748B] leading-relaxed mb-4">
              От стартапов до enterprise — выберите план под ваши потребности
            </p>
            <div className="flex items-center gap-2 text-[#E30613] font-medium text-[14px]">
              Смотреть тарифы <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* User Management */}
          <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] p-8">
            <div className="w-14 h-14 bg-[#F8FAFC] rounded-xl flex items-center justify-center mb-6">
              <Users size={28} className="text-[#64748B]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-3">Управление пользователями</h3>
            <p className="text-[14px] text-[#64748B] leading-relaxed">
              Гибкая система ролей и прав доступа для команд любого размера
            </p>
          </div>

          {/* Infrastructure */}
          <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] p-8">
            <div className="w-14 h-14 bg-[#F8FAFC] rounded-xl flex items-center justify-center mb-6">
              <Server size={28} className="text-[#64748B]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-3">Виртуальные машины</h3>
            <p className="text-[14px] text-[#64748B] leading-relaxed">
              Быстрое создание и управление VM на базе Docker
            </p>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl border-2 border-[#E2E8F0] p-8">
            <div className="w-14 h-14 bg-[#F8FAFC] rounded-xl flex items-center justify-center mb-6">
              <Lock size={28} className="text-[#64748B]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#0F172A] mb-3">Безопасность</h3>
            <p className="text-[14px] text-[#64748B] leading-relaxed">
              Корпоративный уровень защиты данных и соответствие стандартам
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-[#E30613] to-[#FF3B4F] rounded-3xl p-16 text-center shadow-2xl shadow-[#E30613]/40">
          <h2 className="text-[42px] font-bold text-white mb-6">Начните прямо сейчас</h2>
          <p className="text-[18px] text-white/90 max-w-2xl mx-auto mb-10">
            Создайте аккаунт за 2 минуты и получите доступ ко всем возможностям платформы
          </p>
          <Link 
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-[#E30613] rounded-xl text-[18px] font-bold hover:bg-[#F8FAFC] hover:shadow-2xl transition-all"
          >
            Зарегистрироваться
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#E30613] to-[#B00510] rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span className="text-[14px] font-semibold text-[#0F172A]">МТС Cloud Platform</span>
            </div>
            <div className="text-[13px] text-[#64748B]">
              © 2026 МТС. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

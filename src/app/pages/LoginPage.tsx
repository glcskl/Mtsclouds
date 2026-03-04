import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockUsers } from '../data/mockData';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser, setActiveTenantId } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Введите email и пароль');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      setError('Пользователь не найден');
      return;
    }
    setCurrentUser(user);
    if (user.tenant) setActiveTenantId(user.tenant);
    if (user.role === 'platform_admin') {
      navigate('/admin/overview');
    } else {
      navigate('/tenant/dashboard');
    }
  };

  const loginAs = async (userId: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
    const user = mockUsers.find(u => u.id === userId)!;
    setCurrentUser(user);
    if (user.tenant) setActiveTenantId(user.tenant);
    if (user.role === 'platform_admin') {
      navigate('/admin/overview');
    } else {
      navigate('/tenant/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-[#FEE7E7] flex items-center justify-center p-4"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#E30613] to-[#B00510] rounded-2xl flex items-center justify-center shadow-lg shadow-[#E30613]/30">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#0F172A]">МТС Cloud</h1>
            <p className="text-[12px] text-[#64748B]">Enterprise IaaS Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-8">
          <h2 className="text-[22px] font-semibold text-[#0F172A] mb-1">Добро пожаловать</h2>
          <p className="text-[13px] text-[#475569] mb-6">Войдите в свой аккаунт</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#475569] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@company.io"
                className={`w-full h-11 px-4 rounded-lg border text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all
                  ${error ? 'border-[#E30613] bg-[#FFF5F5]' : 'border-[#E2E8F0] bg-white focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10'}`}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#475569] mb-2">Пароль</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-11 px-4 pr-12 rounded-lg border text-[13px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all
                    ${error ? 'border-[#E30613] bg-[#FFF5F5]' : 'border-[#E2E8F0] bg-white focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="mt-1.5 text-[11px] text-[#E30613]">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#E30613] hover:bg-[#C00510] active:bg-[#B00510] text-white rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#E30613]/20"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Войти
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 pt-6 border-t border-[#E2E8F0] text-center">
            <p className="text-[13px] text-[#64748B]">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-[#E30613] hover:text-[#C00510] font-medium transition-colors">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>

        {/* Demo helper */}
        <div className="mt-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-5">
          <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Demo — быстрый вход</p>
          <div className="space-y-2">
            <button
              onClick={() => loginAs('u-1')}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 h-10 rounded-lg border border-[#E2E8F0] hover:bg-[#FEE7E7] hover:border-[#E30613] transition-colors group"
            >
              <span className="text-[12px] font-medium text-[#0F172A]">Alex Petrov</span>
              <span className="text-[11px] text-[#94A3B8] group-hover:text-[#E30613]">Platform Admin</span>
            </button>
            <button
              onClick={() => loginAs('u-2')}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 h-10 rounded-lg border border-[#E2E8F0] hover:bg-[#FEE7E7] hover:border-[#E30613] transition-colors group"
            >
              <span className="text-[12px] font-medium text-[#0F172A]">Maria Ivanova</span>
              <span className="text-[11px] text-[#94A3B8] group-hover:text-[#E30613]">Acme Telecom Admin</span>
            </button>
            <button
              onClick={() => loginAs('u-3')}
              disabled={loading}
              className="w-full flex items-center justify-between px-3 h-10 rounded-lg border border-[#E2E8F0] hover:bg-[#FEE7E7] hover:border-[#E30613] transition-colors group"
            >
              <span className="text-[12px] font-medium text-[#0F172A]">Ivan Sidorov</span>
              <span className="text-[11px] text-[#94A3B8] group-hover:text-[#E30613]">Beta Retail Admin</span>
            </button>
          </div>
        </div>

        {/* Additional links */}
        <div className="mt-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-[13px]">
            <Link to="/tariffs" className="text-[#E30613] hover:text-[#C00510] font-medium transition-colors">
              Тарифы
            </Link>
            <span className="text-[#CBD5E1]">•</span>
            <Link to="/forecast" className="text-[#E30613] hover:text-[#C00510] font-medium transition-colors">
              AI Прогноз
            </Link>
            <span className="text-[#CBD5E1]">•</span>
            <Link to="/calculator" className="text-[#E30613] hover:text-[#C00510] font-medium transition-colors">
              Калькулятор
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
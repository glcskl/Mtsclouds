import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { Eye, EyeOff, Loader2, CheckCircle2, Building2, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';

type InviteInfo = {
  tenantName: string;
  email: string;
  role: string;
  expiresAt: string | null;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const inviteMode = Boolean(inviteToken);
  const [step, setStep] = useState<'info' | 'credentials' | 'organization'>('info');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationVdc: '',
  });

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    if (!inviteToken) return;
    setInviteLoading(true);
    setInviteError('');
    api.getInviteInfo(inviteToken)
      .then(info => {
        setInviteInfo(info);
        setFormData(prev => ({ ...prev, email: info.email }));
      })
      .catch((err: any) => {
        setInviteInfo(null);
        setInviteError(err.body?.error || err.message || 'Инвайт недоступен');
      })
      .finally(() => setInviteLoading(false));
  }, [inviteToken]);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 'info') {
      if (!formData.firstName.trim()) newErrors.firstName = 'Введите имя';
      if (!formData.lastName.trim()) newErrors.lastName = 'Введите фамилию';
      if (!formData.email.trim()) newErrors.email = 'Введите email';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Некорректный email';
      if (!inviteMode && !formData.phone.trim()) newErrors.phone = 'Введите телефон';
    }

    if (step === 'credentials') {
      if (!formData.password) newErrors.password = 'Введите пароль';
      else if (formData.password.length < 8) newErrors.password = 'Минимум 8 символов';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Подтвердите пароль';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (step === 'organization') {
      if (!inviteMode && !formData.organizationName.trim()) {
        newErrors.organizationName = 'Введите название организации';
      }
      if (!inviteMode && formData.organizationName && !formData.organizationVdc.trim()) {
        newErrors.organizationVdc = 'Введите VDC идентификатор';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setSubmitError('');
    if (!validateStep()) return;
    if (step === 'info') setStep('credentials');
    else if (step === 'credentials') setStep('organization');
  };

  const handleBack = () => {
    setSubmitError('');
    if (step === 'credentials') setStep('info');
    else if (step === 'organization') setStep('credentials');
  };

  const goBackToPrev = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setSubmitError('');
    try {
      if (inviteMode && inviteToken) {
        await api.acceptInvite(inviteToken, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim() || undefined,
          password: formData.password,
        });
      } else {
        await api.register({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          organizationName: formData.organizationName.trim(),
          organizationVdc: formData.organizationVdc.trim(),
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.body?.error || err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-[#E30613] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-[24px] font-semibold text-[#0F172A] mb-3">Регистрация успешна!</h2>
          <p className="text-[14px] text-[#64748B] mb-8">
            Ваш аккаунт был создан. Перенаправляем на страницу входа...
          </p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#E30613] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (inviteMode && inviteLoading && !inviteInfo) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-10 text-center">
          <div className="flex items-center justify-center gap-2 text-[#94A3B8] text-[13px]">
            <Loader2 size={16} className="animate-spin" />
            Проверяем приглашение...
          </div>
        </div>
      </div>
    );
  }

  if (inviteMode && inviteError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-[520px] bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-10 text-center">
          <h2 className="text-[22px] font-semibold text-[#0F172A] mb-2">Приглашение недоступно</h2>
          <p className="text-[13px] text-[#64748B] mb-6">{inviteError}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-5 h-10 inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
            >
              Создать организацию
            </Link>
            <Link
              to="/login"
              className="px-5 h-10 inline-flex items-center justify-center rounded-lg bg-[#E30613] text-[13px] font-medium text-white hover:bg-[#C00510] transition-colors"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-[520px]">
        <button
          onClick={goBackToPrev}
          className="inline-flex items-center gap-2 px-4 h-9 rounded-lg border border-[#E2E8F0] bg-white text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Назад
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#E30613] to-[#B00510] rounded-2xl mb-4 shadow-lg shadow-[#E30613]/20">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-[28px] font-semibold text-[#0F172A] mb-2">
            {inviteMode ? 'Принять приглашение' : 'Создание организации'}
          </h1>
          <p className="text-[14px] text-[#64748B]">
            {inviteMode && inviteInfo
              ? `Организация: ${inviteInfo.tenantName}`
              : 'МТС Cloud Platform — корпоративные решения'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-1.5 w-20 rounded-full transition-all ${step === 'info' ? 'bg-[#E30613]' : step === 'credentials' || step === 'organization' ? 'bg-[#E30613]' : 'bg-[#E2E8F0]'}`} />
          <div className={`h-1.5 w-20 rounded-full transition-all ${step === 'credentials' ? 'bg-[#E30613]' : step === 'organization' ? 'bg-[#E30613]' : 'bg-[#E2E8F0]'}`} />
          <div className={`h-1.5 w-20 rounded-full transition-all ${step === 'organization' ? 'bg-[#E30613]' : 'bg-[#E2E8F0]'}`} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 'info' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">Личные данные</h3>
                  <p className="text-[13px] text-[#64748B] mb-6">Введите ваши контактные данные</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#475569] mb-2">Имя</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Иван"
                      className={`w-full h-11 px-4 rounded-lg border text-[14px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all ${
                        errors.firstName ? 'border-[#E30613] bg-[#FFF5F5]' : 'border-[#E2E8F0] bg-white focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10'
                      }`}
                    />
                    {errors.firstName && <p className="mt-1.5 text-[11px] text-[#E30613]">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#475569] mb-2">Фамилия</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Петров"
                      className={`w-full h-11 px-4 rounded-lg border text-[14px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all ${
                        errors.lastName ? 'border-[#E30613] bg-[#FFF5F5]' : 'border-[#E2E8F0] bg-white focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10'
                      }`}
                    />
                    {errors.lastName && <p className="mt-1.5 text-[11px] text-[#E30613]">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#475569] mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ivan.petrov@company.ru"
                    disabled={inviteMode}
                    className={`w-full h-11 px-4 rounded-lg border text-[14px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all ${
                      errors.email
                        ? 'border-[#E30613] bg-[#FFF5F5]'
                        : inviteMode
                          ? 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'
                          : 'border-[#E2E8F0] bg-white focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10'
                    }`}
                  />
                  {errors.email && <p className="mt-1.5 text-[11px] text-[#E30613]">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#475569] mb-2">Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                    className={`w-full h-11 px-4 rounded-lg border text-[14px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all ${
                      errors.phone ? 'border-[#E30613] bg-[#FFF5F5]' : 'border-[#E2E8F0] bg-white focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10'
                    }`}
                  />
                  {errors.phone && <p className="mt-1.5 text-[11px] text-[#E30613]">{errors.phone}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-11 bg-[#E30613] hover:bg-[#C00510] active:bg-[#B00510] text-white rounded-lg text-[14px] font-medium transition-colors"
                >
                  Продолжить
                </button>
              </div>
            )}

            {/* Step 2: Credentials */}
            {step === 'credentials' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">Безопасность</h3>
                  <p className="text-[13px] text-[#64748B] mb-6">Создайте надежный пароль</p>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#475569] mb-2">Пароль</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Минимум 8 символов"
                      className={`w-full h-11 px-4 pr-12 rounded-lg border text-[14px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all ${
                        errors.password ? 'border-[#E30613] bg-[#FFF5F5]' : 'border-[#E2E8F0] bg-white focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-[11px] text-[#E30613]">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#475569] mb-2">Подтвердите пароль</label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Повторите пароль"
                      className={`w-full h-11 px-4 pr-12 rounded-lg border text-[14px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all ${
                        errors.confirmPassword ? 'border-[#E30613] bg-[#FFF5F5]' : 'border-[#E2E8F0] bg-white focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                    >
                      {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1.5 text-[11px] text-[#E30613]">{errors.confirmPassword}</p>}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 h-11 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] rounded-lg text-[14px] font-medium transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 h-11 bg-[#E30613] hover:bg-[#C00510] active:bg-[#B00510] text-white rounded-lg text-[14px] font-medium transition-colors"
                  >
                    Продолжить
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Organization */}
            {step === 'organization' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">
                    {inviteMode ? 'Приглашение' : 'Организация'}
                  </h3>
                  <p className="text-[13px] text-[#64748B] mb-6">
                    {inviteMode ? 'Проверьте данные приглашения' : 'Введите данные новой организации'}
                  </p>
                </div>

                {inviteMode ? (
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 space-y-3">
                    <div className="flex justify-between gap-4">
                      <span className="text-[12px] text-[#64748B]">Организация</span>
                      <span className="text-[13px] font-medium text-[#0F172A] text-right">{inviteInfo?.tenantName || '—'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[12px] text-[#64748B]">Email</span>
                      <span className="text-[12px] font-mono text-[#0F172A] text-right">{inviteInfo?.email || formData.email || '—'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[12px] text-[#64748B]">Роль</span>
                      <span className="text-[13px] font-medium text-[#0F172A] text-right">
                        {inviteInfo?.role === 'tenant_admin' ? 'Tenant Admin' : 'User'}
                      </span>
                    </div>
                    {inviteInfo?.expiresAt && (
                      <div className="flex justify-between gap-4">
                        <span className="text-[12px] text-[#64748B]">Действует до</span>
                        <span className="text-[12px] text-[#0F172A] text-right">
                          {new Date(inviteInfo.expiresAt).toLocaleString('ru', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[13px] font-medium text-[#475569] mb-2">Название организации</label>
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                        placeholder="ООО Рога и Копыта"
                        className={`w-full h-11 px-4 rounded-lg border text-[14px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all ${
                          errors.organizationName ? 'border-[#E30613] bg-[#FFF5F5]' : 'border-[#E2E8F0] bg-white focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10'
                        }`}
                      />
                      {errors.organizationName && <p className="mt-1.5 text-[11px] text-[#E30613]">{errors.organizationName}</p>}
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#475569] mb-2">VDC идентификатор</label>
                      <input
                        type="text"
                        value={formData.organizationVdc}
                        onChange={e => setFormData({ ...formData, organizationVdc: e.target.value })}
                        placeholder="company-vdc"
                        className={`w-full h-11 px-4 rounded-lg border text-[14px] text-[#0F172A] placeholder:text-[#CBD5E1] outline-none transition-all ${
                          errors.organizationVdc ? 'border-[#E30613] bg-[#FFF5F5]' : 'border-[#E2E8F0] bg-white focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/10'
                        }`}
                      />
                      {errors.organizationVdc && <p className="mt-1.5 text-[11px] text-[#E30613]">{errors.organizationVdc}</p>}
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 h-11 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] rounded-lg text-[14px] font-medium transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-11 bg-[#E30613] hover:bg-[#C00510] active:bg-[#B00510] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {inviteMode ? 'Принять приглашение' : 'Создать аккаунт'}
                  </button>
                </div>
                {submitError && (
                  <p className="text-[12px] text-[#E30613]">{submitError}</p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[13px] text-[#64748B]">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-[#E30613] hover:text-[#C00510] font-medium transition-colors">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

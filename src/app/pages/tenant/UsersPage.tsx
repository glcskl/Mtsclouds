import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, Users, Loader2, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';

type TenantUser = {
  id: string;
  name: string;
  email: string;
  role: 'platform_admin' | 'tenant_admin' | 'user';
  createdAt: string;
};

const roleLabel: Record<TenantUser['role'], string> = {
  platform_admin: 'Platform Admin',
  tenant_admin: 'Tenant Admin',
  user: 'User',
};

const roleBadgeClass: Record<TenantUser['role'], string> = {
  platform_admin: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
  tenant_admin: 'bg-[#FEE7E7] text-[#E30613] border-[#FECACA]',
  user: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
};

export default function UsersPage() {
  const {
    activeTenant,
    currentUser,
    addToast,
    setDeleteTarget,
    setShowDeleteModal,
  } = useApp();

  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'tenant_admin' | 'user',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Ошибка загрузки', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setFormError('Заполните все поля');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await api.createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        tenantId: activeTenant?.id,
      });
      setDialogOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      await loadUsers();
      addToast({ type: 'success', title: 'Пользователь создан' });
    } catch (err: any) {
      setFormError(err.body?.error || err.message || 'Ошибка создания пользователя');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = (user: TenantUser) => {
    setDeleteTarget({
      type: 'пользователя',
      name: user.name,
      onConfirm: async () => {
        try {
          await api.deleteUser(user.id);
          await loadUsers();
          addToast({ type: 'success', title: 'Пользователь удалён', message: user.name });
        } catch (err: any) {
          addToast({ type: 'error', title: 'Ошибка удаления', message: err.body?.error || err.message });
        }
      },
    });
    setShowDeleteModal(true);
  };

  return (
    <AppShell breadcrumbs={[activeTenant?.name || 'Организация', 'Пользователи']}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[#0F172A]">Пользователи</h1>
            <p className="text-[13px] text-[#475569] mt-0.5">Управление доступом внутри организации</p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 px-4 h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors"
          >
            <Plus size={15} />
            Добавить пользователя
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          {loading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-[#94A3B8] text-[13px]">
              <Loader2 size={16} className="animate-spin" />
              Загрузка пользователей...
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-4">
                <Users size={26} className="text-[#CBD5E1]" />
              </div>
              <p className="text-[15px] font-medium text-[#0F172A] mb-1">Пользователи не найдены</p>
              <p className="text-[13px] text-[#94A3B8]">Добавьте первого пользователя для работы в команде</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {['Имя', 'Email', 'Роль', 'Создан', 'Действия'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#0F172A]">{user.name}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#475569]">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className={roleBadgeClass[user.role]}>
                        {roleLabel[user.role]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#94A3B8]">
                      {new Date(user.createdAt).toLocaleString('ru', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => deleteUser(user)}
                        disabled={currentUser?.id === user.id}
                        className="w-8 h-8 rounded-lg border border-[#E2E8F0] text-[#DC2626] hover:bg-[#FEE2E2] hover:border-[#FCA5A5] transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        title={currentUser?.id === user.id ? 'Нельзя удалить себя' : 'Удалить пользователя'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Добавить пользователя</DialogTitle>
            <DialogDescription>Создайте новую учетную запись в текущей организации</DialogDescription>
          </DialogHeader>

          <form onSubmit={createUser} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#475569] mb-1.5">Имя</label>
              <input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-[13px] text-[#0F172A] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                placeholder="Иван Петров"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#475569] mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-[13px] text-[#0F172A] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                placeholder="user@company.ru"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#475569] mb-1.5">Пароль</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-[13px] text-[#0F172A] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                placeholder="Минимум 8 символов"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#475569] mb-1.5">Роль</label>
              <select
                value={formData.role}
                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as 'tenant_admin' | 'user' }))}
                className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] text-[#0F172A] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
              >
                <option value="user">User</option>
                <option value="tenant_admin">Tenant Admin</option>
              </select>
            </div>

            {formError && <p className="text-[12px] text-[#DC2626]">{formError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 h-9 rounded-lg border border-[#E2E8F0] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 h-9 rounded-lg bg-[#3B82F6] text-[13px] font-medium text-white hover:bg-[#2563EB] transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Создать
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

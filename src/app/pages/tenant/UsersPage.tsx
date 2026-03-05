import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, Users, Loader2, Trash2, Copy, Link2 } from 'lucide-react';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';

type TenantUser = {
  id: string;
  name: string;
  email: string;
  role: 'platform_admin' | 'tenant_admin' | 'user';
  createdAt: string;
};

type InviteRow = {
  id: string;
  email: string;
  role: 'tenant_admin' | 'user';
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string | null;
  acceptedAt: string | null;
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

const inviteStatusLabel: Record<InviteRow['status'], string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REVOKED: 'Revoked',
  EXPIRED: 'Expired',
};

const inviteStatusBadgeClass: Record<InviteRow['status'], string> = {
  PENDING: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  ACCEPTED: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
  REVOKED: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  EXPIRED: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
};

export default function UsersPage() {
  const {
    activeTenant,
    currentUser,
    addToast,
    setDeleteTarget,
    setShowDeleteModal,
  } = useApp();

  const canManage = currentUser?.role === 'tenant_admin' || currentUser?.role === 'platform_admin';

  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [createdInviteUrl, setCreatedInviteUrl] = useState('');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user' as 'tenant_admin' | 'user',
    expiresInDays: 7,
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

  const loadInvites = async () => {
    if (!canManage) return;
    setInvitesLoading(true);
    try {
      const data = await api.getInvites();
      setInvites(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Ошибка загрузки приглашений', message: err.message });
    } finally {
      setInvitesLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (canManage) {
      loadInvites();
    }
  }, [canManage]);

  const copyText = async (value: string) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API not available');
      await navigator.clipboard.writeText(value);
      addToast({ type: 'success', title: 'Скопировано в буфер обмена' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Не удалось скопировать', message: err.message || 'Скопируйте ссылку вручную' });
    }
  };

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) {
      setInviteError('Введите email');
      return;
    }

    setInviteSubmitting(true);
    setInviteError('');
    try {
      const created = await api.createInvite({
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        expiresInDays: inviteForm.expiresInDays,
        tenantId: activeTenant?.id,
      });

      const url = String(created?.inviteUrl || '');
      setCreatedInviteUrl(url);
      await loadInvites();

      if (url) {
        copyText(url);
      }

      addToast({ type: 'success', title: 'Приглашение создано', message: 'Отправьте ссылку пользователю' });
    } catch (err: any) {
      setInviteError(err.body?.error || err.message || 'Ошибка создания приглашения');
    } finally {
      setInviteSubmitting(false);
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

  const revokeInvite = (invite: InviteRow) => {
    setDeleteTarget({
      type: 'приглашение',
      name: invite.email,
      onConfirm: async () => {
        try {
          await api.revokeInvite(invite.id);
          await loadInvites();
          addToast({ type: 'success', title: 'Приглашение отозвано', message: invite.email });
        } catch (err: any) {
          addToast({ type: 'error', title: 'Ошибка', message: err.body?.error || err.message });
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
            <p className="text-[13px] text-[#475569] mt-0.5">Управление доступом и приглашениями внутри организации</p>
          </div>
          {canManage && (
            <button
              onClick={() => {
                setInviteDialogOpen(true);
                setInviteError('');
                setCreatedInviteUrl('');
                setInviteForm({ email: '', role: 'user', expiresInDays: 7 });
              }}
              className="flex items-center gap-2 px-4 h-9 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[13px] font-medium transition-colors"
            >
              <Plus size={15} />
              Пригласить пользователя
            </button>
          )}
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
                        disabled={!canManage || currentUser?.id === user.id}
                        className="w-8 h-8 rounded-lg border border-[#E2E8F0] text-[#DC2626] hover:bg-[#FEE2E2] hover:border-[#FCA5A5] transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        title={!canManage ? 'Недостаточно прав' : currentUser?.id === user.id ? 'Нельзя удалить себя' : 'Удалить пользователя'}
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

        {canManage && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="text-[15px] font-semibold text-[#0F172A]">Приглашения</h3>
              <p className="text-[12px] text-[#64748B] mt-0.5">Создавайте приглашения для добавления пользователей в организацию</p>
            </div>

            {invitesLoading ? (
              <div className="py-16 flex items-center justify-center gap-2 text-[#94A3B8] text-[13px]">
                <Loader2 size={16} className="animate-spin" />
                Загрузка приглашений...
              </div>
            ) : invites.length === 0 ? (
              <div className="py-16 flex items-center justify-center text-[#94A3B8] text-[13px]">
                Нет приглашений
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {['Email', 'Роль', 'Статус', 'Создано', 'Истекает', 'Действия'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {invites.map(invite => (
                    <tr key={invite.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3.5 text-[13px] text-[#475569]">{invite.email}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className={roleBadgeClass[invite.role]}>
                          {roleLabel[invite.role]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className={inviteStatusBadgeClass[invite.status]}>
                          {inviteStatusLabel[invite.status]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#94A3B8]">
                        {new Date(invite.createdAt).toLocaleString('ru', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#94A3B8]">
                        {invite.expiresAt
                          ? new Date(invite.expiresAt).toLocaleString('ru', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => revokeInvite(invite)}
                          disabled={invite.status !== 'PENDING'}
                          className="w-8 h-8 rounded-lg border border-[#E2E8F0] text-[#DC2626] hover:bg-[#FEE2E2] hover:border-[#FCA5A5] transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                          title={invite.status === 'PENDING' ? 'Отозвать' : 'Недоступно'}
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
        )}
      </div>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Пригласить пользователя</DialogTitle>
            <DialogDescription>Создайте ссылку-приглашение для добавления пользователя в организацию</DialogDescription>
          </DialogHeader>

          {createdInviteUrl ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2 text-[12px] text-[#64748B] mb-2">
                  <Link2 size={14} />
                  Ссылка приглашения
                </div>
                <div className="flex gap-2">
                  <input
                    value={createdInviteUrl}
                    readOnly
                    className="flex-1 h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[12px] text-[#0F172A] font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyText(createdInviteUrl)}
                    className="h-10 px-3 rounded-lg bg-[#3B82F6] text-white text-[13px] font-medium hover:bg-[#2563EB] transition-colors inline-flex items-center gap-2"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setInviteDialogOpen(false)}
                  className="px-4 h-9 rounded-lg bg-[#0F172A] text-[13px] font-medium text-white hover:bg-[#1E293B] transition-colors"
                >
                  Готово
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={createInvite} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#475569] mb-1.5">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={e => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-[13px] text-[#0F172A] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                  placeholder="user@company.ru"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#475569] mb-1.5">Роль</label>
                  <select
                    value={inviteForm.role}
                    onChange={e => setInviteForm(prev => ({ ...prev, role: e.target.value as 'tenant_admin' | 'user' }))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[13px] text-[#0F172A] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                  >
                    <option value="user">User</option>
                    <option value="tenant_admin">Tenant Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#475569] mb-1.5">Срок (дней)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={inviteForm.expiresInDays}
                    onChange={e => setInviteForm(prev => ({ ...prev, expiresInDays: Number(e.target.value) }))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-[13px] text-[#0F172A] outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                  />
                </div>
              </div>

              {inviteError && <p className="text-[12px] text-[#DC2626]">{inviteError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteDialogOpen(false)}
                  className="px-4 h-9 rounded-lg border border-[#E2E8F0] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={inviteSubmitting}
                  className="px-4 h-9 rounded-lg bg-[#3B82F6] text-[13px] font-medium text-white hover:bg-[#2563EB] transition-colors disabled:opacity-60 flex items-center gap-1.5"
                >
                  {inviteSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Создать ссылку
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

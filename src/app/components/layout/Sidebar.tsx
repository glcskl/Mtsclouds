import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Server, FileText, Users, CreditCard,
  Building2, Network, ClipboardList, Settings, LogOut,
  ChevronDown, Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
  badge?: string;
}

const adminNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Обзор', to: '/admin/overview' },
  { icon: Building2, label: 'Организации', to: '/admin/tenants' },
  { icon: Network, label: 'Инфраструктура', to: '/admin/infrastructure' },
  { icon: ClipboardList, label: 'Журнал аудита', to: '/admin/audit' },
];

const tenantNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/tenant/dashboard' },
  { icon: Server, label: 'Виртуальные машины', to: '/tenant/vms' },
  { icon: FileText, label: 'Шаблоны', to: '/tenant/templates' },
  { icon: Users, label: 'Пользователи', to: '/tenant/users' },
  { icon: CreditCard, label: 'Биллинг', to: '/tenant/billing' },
];

export function Sidebar() {
  const { currentUser, activeTenant, setCurrentUser } = useApp();
  const navigate = useNavigate();
  const isAdmin = currentUser?.role === 'platform_admin';
  const navItems = isAdmin ? adminNav : tenantNav;

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="w-[264px] flex-shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-14 px-5 flex items-center border-b border-[#E2E8F0] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-[#E30613] to-[#B00510] rounded-lg flex items-center justify-center shadow-md">
            <Shield size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-semibold text-[#0F172A]">МТС Cloud</span>
        </div>
      </div>

      {/* Zone label */}
      <div className="px-4 pt-4 pb-1">
        <div className="px-2 py-1">
          <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            {isAdmin ? 'Platform Admin' : 'Кабинет организации'}
          </p>
          {!isAdmin && activeTenant && (
            <p className="text-[12px] font-medium text-[#475569] mt-0.5">{activeTenant.name}</p>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 h-9 rounded-lg text-[13px] font-medium transition-colors group ${
                isActive
                  ? 'bg-[#FEE7E7] text-[#E30613]'
                  : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} className={isActive ? 'text-[#E30613]' : 'text-[#94A3B8] group-hover:text-[#475569]'} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E30613] text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user info */}
      <div className="px-3 py-4 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E30613] to-[#B00510] flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-[11px] font-semibold text-white">
              {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[#0F172A] truncate">{currentUser?.name || 'User'}</p>
            <p className="text-[11px] text-[#94A3B8] truncate">{currentUser?.email || ''}</p>
          </div>
          <button onClick={handleLogout} className="text-[#94A3B8] hover:text-[#E30613] transition-colors p-1" title="Выйти">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
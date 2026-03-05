import React from 'react';
import { Bell, ChevronRight, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { UserRole } from '../../data/mockData';

interface TopbarProps {
  breadcrumbs: string[];
}

export function Topbar({ breadcrumbs }: TopbarProps) {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getBackTarget = () => {
    // Platform admin
    if (pathname === '/admin/overview') return null;
    if (pathname === '/admin/tenants') return '/admin/overview';
    if (pathname === '/admin/tenants/new') return '/admin/tenants';
    if (/^\/admin\/tenants\/[^/]+\/edit$/.test(pathname)) return '/admin/tenants';
    if (/^\/admin\/tenants\/[^/]+$/.test(pathname)) return '/admin/tenants';
    if (pathname.startsWith('/admin/')) return '/admin/overview';

    // Tenant area
    if (pathname === '/tenant/dashboard') return null;
    if (pathname === '/tenant/vms/new') return '/tenant/vms';
    if (pathname.startsWith('/tenant/')) return '/tenant/dashboard';

    return null;
  };

  const backTarget = getBackTarget();

  return (
    <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5">
        {backTarget && (
          <button
            onClick={() => navigate(backTarget)}
            className="mr-2 h-8 px-3 rounded-lg border border-[#E2E8F0] text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors flex items-center gap-2"
            title="Назад"
          >
            <ArrowLeft size={14} />
            Назад
          </button>
        )}
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={14} className="text-[#CBD5E1]" />}
            <span className={`text-[13px] ${i === breadcrumbs.length - 1 ? 'text-[#0F172A] font-medium' : 'text-[#94A3B8]'}`}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#FEE7E7] hover:text-[#E30613] transition-colors">
          <Bell size={16} />
        </button>

        {currentUser && (
          <div className="flex items-center gap-2">
            <StatusBadge status={currentUser.role as UserRole} showDot={false} />
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E30613] to-[#B00510] flex items-center justify-center shadow-md">
              <span className="text-[11px] font-semibold text-white">
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

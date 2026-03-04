import React from 'react';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { UserRole } from '../../data/mockData';

interface TopbarProps {
  breadcrumbs: string[];
}

export function Topbar({ breadcrumbs }: TopbarProps) {
  const { currentUser } = useApp();

  return (
    <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5">
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
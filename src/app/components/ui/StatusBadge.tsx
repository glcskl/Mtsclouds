import React from 'react';
import { VMStatus, TenantStatus } from '../../data/mockData';

type BadgeVariant = VMStatus | TenantStatus | 'platform_admin' | 'tenant_admin' | 'user' | 'info';

const config: Record<BadgeVariant, { label: string; bg: string; text: string; dot: string }> = {
  RUNNING:        { label: 'Running',         bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', dot: 'bg-[#16A34A]' },
  STOPPED:        { label: 'Stopped',         bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', dot: 'bg-[#94A3B8]' },
  ERROR:          { label: 'Error',           bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', dot: 'bg-[#DC2626]' },
  CREATING:       { label: 'Creating',        bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', dot: 'bg-[#0EA5E9]' },
  DELETING:       { label: 'Deleting',        bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', dot: 'bg-[#F59E0B]' },
  ACTIVE:         { label: 'Active',          bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', dot: 'bg-[#16A34A]' },
  DISABLED:       { label: 'Disabled',        bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', dot: 'bg-[#94A3B8]' },
  platform_admin: { label: 'Platform Admin',  bg: 'bg-[#FEE7E7]', text: 'text-[#E30613]', dot: 'bg-[#E30613]' },
  tenant_admin:   { label: 'Tenant Admin',    bg: 'bg-[#FEE7E7]', text: 'text-[#E30613]', dot: 'bg-[#E30613]' },
  user:           { label: 'User',            bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', dot: 'bg-[#94A3B8]' },
  info:           { label: 'Info',            bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', dot: 'bg-[#0EA5E9]' },
};

interface StatusBadgeProps {
  status: BadgeVariant;
  showDot?: boolean;
  customLabel?: string;
}

export function StatusBadge({ status, showDot = true, customLabel }: StatusBadgeProps) {
  const c = config[status] || config['STOPPED'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />}
      {customLabel || c.label}
    </span>
  );
}
import React from 'react';

interface QuotaBarProps {
  label: string;
  used: number;
  allocated: number;
  limit: number;
  unit: string;
  compact?: boolean;
}

export function QuotaBar({ label, used, allocated, limit, unit, compact }: QuotaBarProps) {
  const usedPct = Math.min((used / limit) * 100, 100);
  const allocPct = Math.min((allocated / limit) * 100, 100);
  const isWarning = usedPct > 75;
  const isDanger = usedPct > 90;

  const barColor = isDanger ? 'bg-[#DC2626]' : isWarning ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]';
  const allocColor = isDanger ? 'bg-[#FECACA]' : isWarning ? 'bg-[#FDE68A]' : 'bg-[#BFDBFE]';

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#475569]">{label}</span>
          <span className="text-[11px] text-[#94A3B8]">{used} / {limit} {unit}</span>
        </div>
        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div className={`h-full ${allocColor} rounded-full`} style={{ width: `${allocPct}%` }} />
          <div className={`h-full ${barColor} rounded-full -mt-1.5`} style={{ width: `${usedPct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#0F172A]">{label}</span>
        <div className="flex items-center gap-3 text-[12px] text-[#475569]">
          <span>Используется: <span className="font-medium text-[#0F172A]">{used} {unit}</span></span>
          <span className="text-[#E2E8F0]">|</span>
          <span>Выделено: <span className="font-medium text-[#0F172A]">{allocated} {unit}</span></span>
          <span className="text-[#E2E8F0]">|</span>
          <span>Лимит: <span className="font-medium text-[#0F172A]">{limit} {unit}</span></span>
        </div>
      </div>
      <div className="relative h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div className={`absolute left-0 top-0 h-full ${allocColor} rounded-full transition-all`} style={{ width: `${allocPct}%` }} />
        <div className={`absolute left-0 top-0 h-full ${barColor} rounded-full transition-all`} style={{ width: `${usedPct}%` }} />
      </div>
      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-sm ${barColor}`} />
          <span className="text-[#475569]">Используется ({usedPct.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-sm ${allocColor}`} />
          <span className="text-[#475569]">Выделено ({allocPct.toFixed(0)}%)</span>
        </div>
      </div>
    </div>
  );
}

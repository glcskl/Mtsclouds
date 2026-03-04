import React, { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  subtext?: string;
  accent?: string;
}

export function MetricCard({ label, value, delta, deltaType = 'neutral', icon, subtext, accent }: MetricCardProps) {
  const deltaColor = deltaType === 'positive' ? 'text-[#16A34A]' : deltaType === 'negative' ? 'text-[#DC2626]' : 'text-[#94A3B8]';

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between">
        <span className="text-[13px] text-[#475569]">{label}</span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent || 'bg-[#EFF6FF]'}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-[28px] font-semibold text-[#0F172A] leading-none">{value}</span>
        {delta && <span className={`text-[12px] font-medium mb-0.5 ${deltaColor}`}>{delta}</span>}
      </div>
      {subtext && <p className="text-[12px] text-[#94A3B8]">{subtext}</p>}
    </div>
  );
}

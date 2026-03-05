export type MoneyParts = {
  number: string;
  currency: string;
  full: string;
};

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function formatByn(amount: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('ru-BY', {
    style: 'currency',
    currency: 'BYN',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(safeNumber(amount));
}

export function formatBynParts(amount: number, fractionDigits = 0): MoneyParts {
  const safe = safeNumber(amount);
  const parts = new Intl.NumberFormat('ru-BY', {
    style: 'currency',
    currency: 'BYN',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).formatToParts(safe);

  const currency = parts.find(p => p.type === 'currency')?.value || 'Br';
  const number = parts
    .filter(p => ['integer', 'group', 'decimal', 'fraction'].includes(p.type))
    .map(p => p.value)
    .join('');

  return { number, currency, full: parts.map(p => p.value).join('') };
}


import { BANK_COLORS } from '../../types';

export default function BankChip({ bank }: { bank: string }) {
  const color = BANK_COLORS[bank] || '#6b7280';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: '0.75rem',
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      color: color,
      background: `${color}15`,
      border: `1px solid ${color}30`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      Bank {bank}
    </span>
  );
}

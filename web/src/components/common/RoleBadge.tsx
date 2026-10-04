import { ArrowDownToLine, ArrowRightLeft, GitBranch, Banknote } from 'lucide-react';

const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  entry: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: ArrowDownToLine, label: 'Entry' },
  relay: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: ArrowRightLeft, label: 'Relay' },
  branch: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: GitBranch, label: 'Branch' },
  cash_out: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: Banknote, label: 'Cash-out' },
};

export default function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.relay;
  const Icon = config.icon;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: '0.75rem',
      fontWeight: 500,
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.color}30`,
    }}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

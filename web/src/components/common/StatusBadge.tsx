const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  new: { color: '#22d3ee', bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.25)', label: 'New' },
  in_review: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)', label: 'In review' },
  decided: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.25)', label: 'Decided' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 4,
      fontSize: '0.75rem',
      fontWeight: 500,
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.border}`,
    }}>
      {config.label}
    </span>
  );
}

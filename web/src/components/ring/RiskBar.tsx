export default function RiskBar({ risk, size = 'md' }: { risk: number; size?: 'sm' | 'md' | 'lg' }) {
  const riskPercent = typeof risk === 'number' && risk <= 1 ? risk * 100 : risk;
  const color = riskPercent >= 80 ? '#ef4444' : riskPercent >= 50 ? '#f59e0b' : '#10b981';
  const glow = riskPercent >= 80 ? 'rgba(239, 68, 68, 0.3)' : riskPercent >= 50 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)';
  const height = size === 'sm' ? 4 : size === 'lg' ? 10 : 6;
  const width = size === 'sm' ? 60 : size === 'lg' ? 200 : 120;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        position: 'relative',
        width,
        height,
        background: 'var(--bg-base)',
        borderRadius: height / 2,
        border: '1px solid var(--border)',
        overflow: 'visible',
      }}>
        {/* Fill */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${Math.min(riskPercent, 100)}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: height / 2,
          boxShadow: `0 0 8px ${glow}`,
          transition: 'width 0.5s ease',
        }} />
        {/* Threshold marker at 70 */}
        <div style={{
          position: 'absolute',
          left: '70%',
          top: -2,
          bottom: -2,
          width: 2,
          background: '#ef4444',
          opacity: 0.6,
        }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: size === 'sm' ? '0.7rem' : size === 'lg' ? '1rem' : '0.8rem',
        fontWeight: 600,
        color,
        minWidth: 28,
      }}>
        {Math.round(riskPercent)}
      </span>
    </div>
  );
}

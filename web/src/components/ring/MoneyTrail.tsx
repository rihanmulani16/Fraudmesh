import { useMemo } from 'react';
import { Ring, BANK_COLORS, formatPaise } from '../../types';

interface Props {
  ring: Ring;
}

export default function MoneyTrail({ ring }: Props) {
  const width = 900;
  const laneHeight = 60;
  const padding = { top: 30, bottom: 40, left: 80, right: 40 };
  
  const banks = ring.banks;
  const height = padding.top + banks.length * laneHeight + padding.bottom;
  
  // Time range
  const times = ring.transactions.map(t => new Date(t.ts).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timeRange = maxTime - minTime || 1;
  
  const timeToX = (ts: string) => {
    const t = new Date(ts).getTime();
    return padding.left + ((t - minTime) / timeRange) * (width - padding.left - padding.right);
  };
  
  const bankToY = (bank: string) => {
    const idx = banks.indexOf(bank);
    return padding.top + idx * laneHeight + laneHeight / 2;
  };
  
  // Node positions (first appearance time)
  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number; bank: string }> = {};
    ring.members.forEach(m => {
      const firstTxn = ring.transactions.find(t => t.from === m.account_token || t.to === m.account_token);
      if (firstTxn) {
        pos[m.account_token] = {
          x: timeToX(firstTxn.ts),
          y: bankToY(m.bank),
          bank: m.bank,
        };
      }
    });
    return pos;
  }, [ring]);
  
  const maxAmount = Math.max(...ring.transactions.map(t => t.amount_paise), 1);
  
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ background: 'var(--bg-base)', borderRadius: 6, border: '1px solid var(--border)' }}>
        {/* Lane backgrounds */}
        {banks.map((bank, i) => {
          const y = padding.top + i * laneHeight;
          const color = BANK_COLORS[bank] || '#6b7280';
          return (
            <g key={`lane-${bank}`}>
              <rect x={0} y={y} width={width} height={laneHeight}
                fill={i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'} />
              <line x1={padding.left} y1={y + laneHeight} x2={width - padding.right} y2={y + laneHeight}
                stroke="var(--border)" strokeWidth={1} strokeDasharray="2 4" />
              {/* Bank label */}
              <rect x={4} y={y + laneHeight / 2 - 10} width={65} height={20} rx={3}
                fill={`${color}15`} stroke={`${color}30`} />
              <text x={36} y={y + laneHeight / 2 + 4} textAnchor="middle"
                fill={color} fontSize={10} fontFamily="var(--font-mono)" fontWeight={600}>
                Bank {bank}
              </text>
            </g>
          );
        })}
        
        {/* Transfer ribbons */}
        {ring.transactions.map(txn => {
          const fromNode = nodePositions[txn.from];
          const toNode = nodePositions[txn.to];
          if (!fromNode || !toNode) return null;
          
          const x1 = timeToX(txn.ts);
          const x2 = x1 + 15; // slight offset for receiver
          const ribbonWidth = 2 + (txn.amount_paise / maxAmount) * 6;
          const color = txn.flagged ? '#ef4444' : 'rgba(6, 182, 212, 0.4)';
          
          // Curved path
          const midX = (x1 + x2) / 2;
          const path = `M ${x1} ${fromNode.y} C ${midX + 20} ${fromNode.y}, ${midX - 20} ${toNode.y}, ${x2} ${toNode.y}`;
          
          return (
            <g key={txn.txn_id}>
              {txn.flagged && (
                <path d={path} fill="none" stroke={color} strokeWidth={ribbonWidth + 4} opacity={0.1} />
              )}
              <path d={path} fill="none" stroke={color} strokeWidth={ribbonWidth} opacity={0.7}
                strokeLinecap="round" />
              {/* Amount label */}
              <text x={midX + 10} y={(fromNode.y + toNode.y) / 2 - 5}
                fill={txn.flagged ? '#ef4444' : '#566577'} fontSize={8} fontFamily="var(--font-mono)">
                {formatPaise(txn.amount_paise)}
              </text>
            </g>
          );
        })}
        
        {/* Account dots */}
        {Object.entries(nodePositions).map(([token, pos]) => {
          const member = ring.members.find(m => m.account_token === token);
          if (!member) return null;
          const color = BANK_COLORS[pos.bank] || '#6b7280';
          const riskNorm = member.risk <= 1 ? member.risk : member.risk / 100;
          const radius = 5 + riskNorm * 4;
          
          // Dwell time tail
          const dwellWidth = Math.min(member.median_dwell_sec / 60, 40);
          
          return (
            <g key={token}>
              {/* Dwell tail */}
              {dwellWidth > 0 && (
                <rect x={pos.x} y={pos.y - 2} width={dwellWidth} height={4}
                  fill={color} opacity={0.3} rx={2} />
              )}
              {/* Dot */}
              <circle cx={pos.x} cy={pos.y} r={radius}
                fill={`${color}50`} stroke={color} strokeWidth={1.5} />
              {/* Role letter */}
              <text x={pos.x} y={pos.y + 3} textAnchor="middle"
                fill="#e6edf5" fontSize={7} fontFamily="var(--font-mono)" fontWeight={700}>
                {member.role === 'entry' ? 'E' : member.role === 'relay' ? 'R' : member.role === 'branch' ? 'B' : 'C'}
              </text>
            </g>
          );
        })}
        
        {/* Time axis */}
        {[0, 0.25, 0.5, 0.75, 1].map(frac => {
          const t = minTime + frac * timeRange;
          const x = padding.left + frac * (width - padding.left - padding.right);
          const date = new Date(t);
          const label = `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
          return (
            <g key={frac}>
              <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom}
                stroke="var(--border)" strokeWidth={1} strokeDasharray="2 4" />
              <text x={x} y={height - padding.bottom + 16} textAnchor="middle"
                fill="#566577" fontSize={9} fontFamily="var(--font-mono)">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

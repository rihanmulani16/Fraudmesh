import { useState, useMemo } from 'react';
import { Ring, BANK_COLORS, formatPaise } from '../../types';

interface Props {
  ring: Ring;
  bankView?: string | null;
  onNodeClick?: (token: string) => void;
}

interface NodePos {
  token: string;
  bank: string;
  role: string;
  risk: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function TransactionGraph({ ring, bankView, onNodeClick }: Props) {
  const width = 600;
  const height = 400;
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  
  // Initialize node positions using a deterministic layout
  const nodes = useMemo(() => {
    const bankGroups: Record<string, string[]> = {};
    ring.members.forEach(m => {
      if (!bankGroups[m.bank]) bankGroups[m.bank] = [];
      bankGroups[m.bank].push(m.account_token);
    });
    
    const banks = Object.keys(bankGroups);
    const positions: NodePos[] = [];
    
    banks.forEach((bank, bi) => {
      const angle = (2 * Math.PI * bi) / banks.length - Math.PI / 2;
      const clusterCx = width / 2 + Math.cos(angle) * 140;
      const clusterCy = height / 2 + Math.sin(angle) * 120;
      const members = bankGroups[bank];
      
      members.forEach((token, mi) => {
        const memberAngle = (2 * Math.PI * mi) / members.length;
        const spread = Math.min(60, 30 + members.length * 8);
        const member = ring.members.find(m => m.account_token === token)!;
        positions.push({
          token,
          bank,
          role: member.role,
          risk: member.risk,
          x: clusterCx + Math.cos(memberAngle) * spread,
          y: clusterCy + Math.sin(memberAngle) * spread,
          vx: 0,
          vy: 0,
        });
      });
    });
    return positions;
  }, [ring]);

  const getNode = (token: string) => nodes.find(n => n.token === token);

  const maxAmount = Math.max(...ring.edges.map(e => e.total_paise), 1);

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ background: 'var(--bg-base)', borderRadius: 6, border: '1px solid var(--border)' }}>
        {/* Bank cluster backgrounds */}
        {(() => {
          const bankGroups: Record<string, NodePos[]> = {};
          nodes.forEach(n => {
            if (!bankGroups[n.bank]) bankGroups[n.bank] = [];
            bankGroups[n.bank].push(n);
          });
          return Object.entries(bankGroups).map(([bank, members]) => {
            const cx = members.reduce((s, m) => s + m.x, 0) / members.length;
            const cy = members.reduce((s, m) => s + m.y, 0) / members.length;
            const radius = Math.max(50, ...members.map(m => Math.sqrt((m.x - cx) ** 2 + (m.y - cy) ** 2))) + 30;
            const color = BANK_COLORS[bank] || '#6b7280';
            const isFaded = bankView && bankView !== bank;
            return (
              <g key={`cluster-${bank}`}>
                <circle cx={cx} cy={cy} r={radius} fill={`${color}08`} stroke={`${color}20`} strokeWidth={1} strokeDasharray={isFaded ? '4 4' : 'none'} opacity={isFaded ? 0.3 : 1} />
                <text x={cx} y={cy - radius + 14} textAnchor="middle" fill={color} fontSize={11} fontWeight={600} fontFamily="var(--font-mono)" opacity={isFaded ? 0.3 : 0.8}>
                  Bank {bank}
                </text>
              </g>
            );
          });
        })()}

        {/* Edges */}
        {ring.edges.map(edge => {
          const from = getNode(edge.from);
          const to = getNode(edge.to);
          if (!from || !to) return null;
          const isFaded = bankView && (from.bank !== bankView && to.bank !== bankView);
          const isCrossBank = bankView && from.bank !== to.bank && (from.bank === bankView || to.bank === bankView);
          const strokeWidth = 1 + (edge.total_paise / maxAmount) * 4;
          const color = edge.suspicious ? '#ef4444' : '#334155';
          
          // Arrow
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nodeRadius = 8 + (to.risk <= 1 ? to.risk : to.risk / 100) * 12;
          const endX = to.x - (dx / len) * (nodeRadius + 2);
          const endY = to.y - (dy / len) * (nodeRadius + 2);
          
          return (
            <g key={edge.edge_id} opacity={isFaded ? 0.1 : isCrossBank ? 0.3 : 1}
              onMouseEnter={() => setHoveredEdge(edge.edge_id)}
              onMouseLeave={() => setHoveredEdge(null)}
              style={{ cursor: 'pointer' }}>
              <line
                x1={from.x} y1={from.y} x2={endX} y2={endY}
                stroke={hoveredEdge === edge.edge_id ? '#22d3ee' : color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                opacity={edge.suspicious ? 0.8 : 0.4}
              />
              {edge.suspicious && (
                <line x1={from.x} y1={from.y} x2={endX} y2={endY}
                  stroke={color} strokeWidth={strokeWidth + 4} opacity={0.1} />
              )}
              {/* Arrow head */}
              <polygon
                points={`${endX},${endY} ${endX - 8 * dx / len + 4 * dy / len},${endY - 8 * dy / len - 4 * dx / len} ${endX - 8 * dx / len - 4 * dy / len},${endY - 8 * dy / len + 4 * dx / len}`}
                fill={hoveredEdge === edge.edge_id ? '#22d3ee' : color}
                opacity={0.8}
              />
              {/* Amount label */}
              {hoveredEdge === edge.edge_id && (
                <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 10}
                  textAnchor="middle" fill="#22d3ee" fontSize={10} fontFamily="var(--font-mono)" fontWeight={600}>
                  {formatPaise(edge.total_paise)}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const riskNorm = node.risk <= 1 ? node.risk : node.risk / 100;
          const radius = 8 + riskNorm * 12;
          const color = BANK_COLORS[node.bank] || '#6b7280';
          const isFaded = bankView && node.bank !== bankView;
          const isHovered = hoveredNode === node.token;
          const member = ring.members.find(m => m.account_token === node.token);
          
          return (
            <g key={node.token}
              onMouseEnter={() => setHoveredNode(node.token)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onNodeClick?.(node.token)}
              style={{ cursor: 'pointer' }}
              opacity={isFaded ? 0.2 : 1}>
              {/* Glow */}
              {riskNorm > 0.7 && !isFaded && (
                <circle cx={node.x} cy={node.y} r={radius + 6} fill="none" stroke="#ef4444" strokeWidth={1} opacity={0.3}>
                  <animate attributeName="r" values={`${radius + 4};${radius + 8};${radius + 4}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Node circle */}
              <circle cx={node.x} cy={node.y} r={radius}
                fill={isFaded ? '#1e293b' : `${color}30`}
                stroke={isFaded ? '#334155' : isHovered ? '#22d3ee' : color}
                strokeWidth={isHovered ? 2.5 : 1.5}
              />
              {/* Role indicator */}
              <text x={node.x} y={node.y + 3} textAnchor="middle"
                fill={isFaded ? '#334155' : '#e6edf5'} fontSize={8} fontFamily="var(--font-mono)" fontWeight={600}>
                {node.role === 'entry' ? 'E' : node.role === 'relay' ? 'R' : node.role === 'branch' ? 'B' : 'C'}
              </text>
              
              {/* Tooltip */}
              {isHovered && member && (
                <g>
                  <rect x={node.x + radius + 8} y={node.y - 40} width={180} height={75} rx={4}
                    fill="#1a2332" stroke="#334155" strokeWidth={1} />
                  <text x={node.x + radius + 16} y={node.y - 22} fill="#e6edf5" fontSize={10} fontFamily="var(--font-mono)">
                    {node.token.slice(0, 12)}...
                  </text>
                  <text x={node.x + radius + 16} y={node.y - 8} fill="#8899aa" fontSize={9}>
                    Bank {node.bank} · {node.role} · Risk: {Math.round(riskNorm * 100)}
                  </text>
                  <text x={node.x + radius + 16} y={node.y + 6} fill="#8899aa" fontSize={9}>
                    In: {formatPaise(member.in_paise)} · Out: {formatPaise(member.out_paise)}
                  </text>
                  <text x={node.x + radius + 16} y={node.y + 20} fill="#8899aa" fontSize={9}>
                    Dwell: {member.median_dwell_sec}s
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Bank view banner */}
        {bankView && (
          <g>
            <rect x={10} y={height - 35} width={width - 20} height={25} rx={4} fill="rgba(245, 158, 11, 0.1)" stroke="rgba(245, 158, 11, 0.3)" />
            <text x={width / 2} y={height - 18} textAnchor="middle" fill="#f59e0b" fontSize={11} fontWeight={500}>
              From Bank {bankView} alone this looks like {nodes.filter(n => n.bank === bankView).length} unrelated transfers.
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

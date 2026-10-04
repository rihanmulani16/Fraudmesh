import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Filter, 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  Network, 
  Clock, 
  Flame, 
  Layers, 
  Building2, 
  Zap,
  TrendingUp,
  Radio
} from 'lucide-react';
import { useFraudMesh } from '../context/FraudMeshContext';
import { formatPaise, getTimeDiff } from '../types';
import BankChip from '../components/common/BankChip';
import StatusBadge from '../components/common/StatusBadge';
import RiskBar from '../components/ring/RiskBar';

export default function RingQueue() {
  const navigate = useNavigate();
  const { rings, simulation, injectSyntheticRing } = useFraudMesh();

  const [search, setSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [minRisk, setMinRisk] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'risk' | 'value' | 'newest'>('risk');

  // Filtered rings
  const filteredRings = useMemo(() => {
    return rings.filter(ring => {
      if (selectedBank !== 'ALL' && !ring.banks.includes(selectedBank)) return false;
      if (selectedStatus !== 'ALL' && ring.status !== selectedStatus) return false;
      if (ring.ring_risk < minRisk) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesId = ring.ring_id.toLowerCase().includes(q);
        const matchesSummary = ring.summary.toLowerCase().includes(q);
        const matchesMembers = ring.members.some(m => m.account_token.toLowerCase().includes(q));
        if (!matchesId && !matchesSummary && !matchesMembers) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'risk') return b.ring_risk - a.ring_risk;
      if (sortBy === 'value') return b.risk_components.total_value_paise - a.risk_components.total_value_paise;
      if (sortBy === 'newest') return new Date(b.window.end).getTime() - new Date(a.window.end).getTime();
      return 0;
    });
  }, [rings, selectedBank, selectedStatus, minRisk, search, sortBy]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalValue = rings.reduce((acc, r) => acc + r.risk_components.total_value_paise, 0);
    const crossBankCount = rings.filter(r => r.banks.length >= 2).length;
    const urgentCount = rings.filter(r => r.ring_risk >= 80 && r.status === 'new').length;
    return {
      total: rings.length,
      crossBank: crossBankCount,
      urgent: urgentCount,
      totalValueFormatted: formatPaise(totalValue),
    };
  }, [rings]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner & Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(13, 17, 23, 0.95) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-bright)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}>
              <Radio size={12} className="pulse-icon" /> FEDERATED GRAPH PIPELINE ACTIVE
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Round #14 · 4 Bank Digital Twins
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Cross-Bank Mule Ring Triage Queue
          </h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 780 }}>
            FraudMesh automatically synthesizes isolated local bank transactions into coordinated cross-institution mule rings using privacy-preserving federated Graph Neural Networks (GraphSAGE/GAT).
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => {
              const injected = injectSyntheticRing();
              navigate(`/rings/${injected.ring_id}`);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <Zap size={16} /> Inject Test Ring
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>ACTIVE CANDIDATE RINGS</span>
            <Network size={16} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Grouped by time-windowed flow-through
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>CROSS-BANK RINGS (SPAN ≥ 2)</span>
            <Building2 size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#8b5cf6', marginTop: 8 }}>
            {stats.crossBank}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Invisible to individual banking silos
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>URGENT TRIAGE (RISK ≥ 80)</span>
            <Flame size={16} color="var(--alert)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--alert)', marginTop: 8 }}>
            {stats.urgent}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Immediate analyst review recommended
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            <span>TOTAL VALUE IN QUEUE</span>
            <TrendingUp size={16} color="var(--safe)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--safe)', marginTop: 8 }}>
            {stats.totalValueFormatted}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Aggregated layering volume
          </div>
        </div>
      </div>

      {/* Filter and Query Control Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search ring ID, account token, keywords..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: 'var(--font-ui)',
            }}
          />
        </div>

        {/* Bank Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bank:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL', 'A', 'B', 'C', 'D'].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBank(b)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedBank === b ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: selectedBank === b ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-base)',
                  color: selectedBank === b ? 'var(--accent-bright)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {b === 'ALL' ? 'All Banks' : `Bank ${b}`}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL', 'new', 'in_review', 'decided'].map(s => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: selectedStatus === s ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: selectedStatus === s ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-base)',
                  color: selectedStatus === s ? 'var(--accent-bright)' : 'var(--text-secondary)',
                  textTransform: 'capitalize',
                }}
              >
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Min Risk Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Risk ≥</span>
          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={minRisk}
            onChange={e => setMinRisk(Number(e.target.value))}
            style={{ width: 80, accentColor: 'var(--accent)' }}
          />
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', width: 24 }}>
            {minRisk}
          </span>
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: '0.75rem',
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="risk">Highest Risk</option>
            <option value="value">Highest Value</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Rings Queue List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            SHOWING {filteredRings.length} OF {rings.length} DISCOVERED RINGS
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click any ring to inspect multi-bank money trail & graph
          </span>
        </div>

        {filteredRings.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border)',
            borderRadius: 8,
            padding: '48px 24px',
            textAlign: 'center',
          }}>
            <Filter size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              No mule rings match the selected criteria
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Try adjusting the bank filter or lowering the minimum risk threshold.
            </div>
          </div>
        ) : (
          filteredRings.map(ring => {
            const isCrossBank = ring.banks.length >= 2;
            const timeSpan = getTimeDiff(ring.window.start, ring.window.end);
            const totalValue = formatPaise(ring.risk_components.total_value_paise);

            return (
              <div
                key={ring.ring_id}
                onClick={() => navigate(`/rings/${ring.ring_id}`)}
                style={{
                  background: 'var(--bg-surface)',
                  border: ring.ring_risk >= 80 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '18px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = ring.ring_risk >= 80 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Cross-Bank High Priority Ribbon Indicator */}
                {isCrossBank && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 4,
                    height: '100%',
                    background: 'linear-gradient(180deg, #8b5cf6 0%, #06b6d4 100%)',
                  }} />
                )}

                {/* Row 1: Header - ID, Risk, Banks, Accounts, Value, Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                    }}>
                      {ring.ring_id}
                    </span>
                    <RiskBar risk={ring.ring_risk} size="md" />
                    <StatusBadge status={ring.status} />
                    {isCrossBank && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: '#a78bfa',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                      }}>
                        CROSS-BANK ({ring.banks.length} INSTITUTIONS)
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Layers size={14} color="var(--accent)" />
                      <span>{ring.members.length} accounts</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Clock size={14} color="var(--text-muted)" />
                      <span>{timeSpan}</span>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {totalValue}
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: 'var(--accent)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}>
                      <span>Investigate</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>

                {/* Row 2: Human-readable machine summary */}
                <div style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  lineHeight: 1.45,
                }}>
                  {ring.summary}
                </div>

                {/* Row 3: Bank Chips & Scientific Telemetry Chips */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 2 }}>Involved Nodes:</span>
                    {ring.banks.map(b => (
                      <BankChip key={b} bank={b} />
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    <span>Pass-through: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(ring.risk_components.pass_through_ratio * 100)}%</strong></span>
                    <span>•</span>
                    <span>Top-3 Risk: <strong style={{ color: 'var(--text-primary)' }}>{ring.risk_components.top3_account_risk.toFixed(2)}</strong></span>
                    <span>•</span>
                    <span>Recommendation: <strong style={{ 
                      color: ring.model_recommendation.action === 'freeze' ? 'var(--alert)' : ring.model_recommendation.action === 'escalate' ? 'var(--caution)' : 'var(--safe)',
                      textTransform: 'uppercase'
                    }}>{ring.model_recommendation.action}</strong></span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  User, 
  ArrowUpRight 
} from 'lucide-react';
import { useFraudMesh } from '../context/FraudMeshContext';
import { formatPaise } from '../types';
import BankChip from '../components/common/BankChip';
import RiskBar from '../components/ring/RiskBar';

export default function ClosedCases() {
  const navigate = useNavigate();
  const { closedCases } = useFraudMesh();

  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [bankFilter, setBankFilter] = useState<string>('ALL');

  const filteredCases = useMemo(() => {
    return closedCases.filter(c => {
      if (outcomeFilter !== 'ALL' && c.outcome !== outcomeFilter) return false;
      if (bankFilter !== 'ALL' && !c.banks.includes(bankFilter)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.case_id.toLowerCase().includes(q) ||
          c.ring_id.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.analyst_note.toLowerCase().includes(q) ||
          c.analyst.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [closedCases, outcomeFilter, bankFilter, search]);

  const stats = useMemo(() => {
    const confirmed = closedCases.filter(c => c.outcome === 'confirmed_mule').length;
    const falsePos = closedCases.filter(c => c.outcome === 'false_positive').length;
    const escalated = closedCases.filter(c => c.outcome === 'escalated').length;
    return { total: closedCases.length, confirmed, falsePos, escalated };
  }, [closedCases]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-surface)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--safe)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}>
              HISTORICAL REPOSITORY & AUDIT LEDGER
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Closed Cases & Precedent Archive
          </h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 800 }}>
            Every past analyst decision feeds the FAISS vector index, allowing the FraudMesh RAG engine to retrieve high-similarity precedents when novel suspicious cross-bank rings are flagged.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL CLOSED CASES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>{stats.total}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CONFIRMED MULE RINGS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--alert)', marginTop: 8 }}>{stats.confirmed}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ESCALATED TO LEA</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--caution)', marginTop: 8 }}>{stats.escalated}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FALSE POSITIVES DISMISSED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--safe)', marginTop: 8 }}>{stats.falsePos}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '14px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 380 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search case ID, analyst, rationale..."
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
            }}
          />
        </div>

        {/* Outcome Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Outcome:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'confirmed_mule', label: 'Confirmed Mule' },
              { id: 'escalated', label: 'Escalated' },
              { id: 'false_positive', label: 'False Positive' },
            ].map(o => (
              <button
                key={o.id}
                onClick={() => setOutcomeFilter(o.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: outcomeFilter === o.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: outcomeFilter === o.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-base)',
                  color: outcomeFilter === o.id ? 'var(--accent-bright)' : 'var(--text-secondary)',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bank Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bank:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL', 'A', 'B', 'C', 'D'].map(b => (
              <button
                key={b}
                onClick={() => setBankFilter(b)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: bankFilter === b ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: bankFilter === b ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-base)',
                  color: bankFilter === b ? 'var(--accent-bright)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {b === 'ALL' ? 'All' : `Bank ${b}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Case Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}>
        {filteredCases.map(c => {
          const isMule = c.outcome === 'confirmed_mule';
          const isEscalated = c.outcome === 'escalated';
          const outcomeColor = isMule ? 'var(--alert)' : isEscalated ? 'var(--caution)' : 'var(--safe)';
          const outcomeBg = isMule ? 'rgba(239, 68, 68, 0.1)' : isEscalated ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)';

          return (
            <div
              key={c.case_id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {c.case_id}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    (ref: {c.ring_id})
                  </span>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: outcomeColor,
                  background: outcomeBg,
                  border: `1px solid ${outcomeColor}40`,
                }}>
                  {c.outcome.replace('_', ' ')}
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                {c.summary}
              </div>

              <div style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                padding: '10px 12px',
                borderRadius: 4,
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}>
                "{c.analyst_note}"
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={12} />
                  <span>{c.analyst}</span>
                </div>
                <div>{new Date(c.closed_at).toLocaleDateString()}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {c.banks.map(b => (
                    <BankChip key={b} bank={b} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

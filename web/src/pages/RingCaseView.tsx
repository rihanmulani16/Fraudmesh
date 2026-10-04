import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  Share2, 
  HelpCircle, 
  Users, 
  FileText, 
  History, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Smartphone, 
  Fingerprint, 
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';
import { useFraudMesh } from '../context/FraudMeshContext';
import { Member, formatPaise, getTimeDiff } from '../types';
import BankChip from '../components/common/BankChip';
import RoleBadge from '../components/common/RoleBadge';
import StatusBadge from '../components/common/StatusBadge';
import RiskBar from '../components/ring/RiskBar';
import TransactionGraph from '../components/ring/TransactionGraph';
import MoneyTrail from '../components/ring/MoneyTrail';

export default function RingCaseView() {
  const { ringId } = useParams<{ ringId: string }>();
  const navigate = useNavigate();
  const { getRing, addDecision, getDecisionsForRing } = useFraudMesh();

  const ring = getRing(ringId || '');
  const decisions = getDecisionsForRing(ringId || '');

  // Active state
  const [bankView, setBankView] = useState<string | null>(null); // null = Federation view, 'A', 'B', etc.
  const [activeTab, setActiveTab] = useState<'why' | 'accounts' | 'transactions' | 'similar'>('why');
  const [selectedAccount, setSelectedAccount] = useState<Member | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // If ring not found
  if (!ring) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Ring {ringId} not found</h2>
        <p style={{ color: 'var(--text-muted)' }}>The requested mule ring may have been dismissed or re-indexed.</p>
        <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Triage Queue
        </Link>
      </div>
    );
  }

  const isCrossBank = ring.banks.length >= 2;
  const timeSpan = getTimeDiff(ring.window.start, ring.window.end);
  const totalValue = formatPaise(ring.risk_components.total_value_paise);

  const handleDecision = (action: 'freeze' | 'escalate' | 'dismiss') => {
    if (decisionReason.trim().length < 10) {
      setDecisionError('Reason must be at least 10 characters long to maintain audit compliance.');
      return;
    }
    setDecisionError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const ok = addDecision(ring.ring_id, action, decisionReason.trim());
      setIsSubmitting(false);
      if (ok) {
        setToastMessage(`Decision recorded: ${action.toUpperCase()} · Immutable audit log updated.`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    }, 300);
  };

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 100 }}>
      {/* Toast notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--accent)',
          color: 'var(--accent-bright)',
          padding: '12px 20px',
          borderRadius: 6,
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: '0.9rem',
        }}>
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* Top Navigation & Breadcrumbs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: 4,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} /> Back to Queue
          </button>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
            {ring.ring_id}
          </span>
          <RiskBar risk={ring.ring_risk} size="lg" />
          <StatusBadge status={ring.status} />
        </div>

        {/* Lens Switcher: Federation View vs Bank View (The Project's Defining Experiment) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--bg-surface)',
          padding: '4px 6px',
          borderRadius: 6,
          border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 6px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            LENS:
          </span>
          <button
            onClick={() => setBankView(null)}
            style={{
              padding: '5px 12px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: bankView === null ? '1px solid var(--accent)' : '1px solid transparent',
              background: bankView === null ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: bankView === null ? 'var(--accent-bright)' : 'var(--text-secondary)',
            }}
          >
            Federation View (Omniscient)
          </button>

          {ring.banks.map(b => (
            <button
              key={b}
              onClick={() => setBankView(b)}
              style={{
                padding: '5px 10px',
                borderRadius: 4,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: bankView === b ? '1px solid var(--caution)' : '1px solid transparent',
                background: bankView === b ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: bankView === b ? '#fbbf24' : 'var(--text-secondary)',
              }}
            >
              Bank {b} View
            </button>
          ))}
        </div>
      </div>

      {/* Case Header Details Banner */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              "{ring.summary}"
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Span: <strong style={{ color: 'var(--text-primary)' }}>{timeSpan}</strong></span>
              <span>•</span>
              <span>Total Volume: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{totalValue}</strong></span>
              <span>•</span>
              <span>Accounts: <strong style={{ color: 'var(--text-primary)' }}>{ring.members.length}</strong></span>
              <span>•</span>
              <span>Banks Involved: </span>
              {ring.banks.map(b => (
                <BankChip key={b} bank={b} />
              ))}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            padding: '10px 16px',
            borderRadius: 6,
            minWidth: 260,
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
              MODEL SYSTEM RECOMMENDATION
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: ring.model_recommendation.action === 'freeze' ? 'var(--alert)' : ring.model_recommendation.action === 'escalate' ? 'var(--caution)' : 'var(--safe)',
                textTransform: 'uppercase',
              }}>
                {ring.model_recommendation.action}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                ({Math.round(ring.model_recommendation.confidence * 100)}% Confidence)
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Human analyst holds final execution authority.
            </div>
          </div>
        </div>

        {/* Bank Lens Warning Alert */}
        {bankView && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 6,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#fbbf24',
            fontSize: '0.85rem',
          }}>
            <AlertTriangle size={18} />
            <div>
              <strong>BANK {bankView} LOCAL PERSPECTIVE:</strong> From Bank {bankView} alone, this looks like {ring.members.filter(m => m.bank === bankView).length} isolated, low-risk local transfers. The multi-bank layering chain and cash-out destination are completely obscured due to inter-bank data silos!
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Work Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 20 }}>
        {/* Left Column: Visualizations (Graph & Money Trail) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Panel 1: Transaction Graph */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Cross-Bank Transaction Topology
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                  (Click any node to view account telemetry)
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {ring.members.length} NODES · {ring.edges.length} EDGES
              </div>
            </div>

            <TransactionGraph
              ring={ring}
              bankView={bankView}
              onNodeClick={token => {
                const member = ring.members.find(m => m.account_token === token);
                if (member) setSelectedAccount(member);
              }}
            />

            {/* Graph Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', paddingTop: 4 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <span>Node Role: <strong>E</strong> = Entry, <strong>R</strong> = Relay, <strong>B</strong> = Branch, <strong>C</strong> = Cash-out</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 2, background: 'var(--alert)', display: 'inline-block' }} />
                <span>Suspicious Layering Transfer</span>
              </div>
            </div>
          </div>

          {/* Panel 2: Money Trail Swimlane Diagram */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Temporal Money Trail (Inter-Bank Swimlane)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                  Time flows left to right · Ribbon thickness = ₹ Volume
                </span>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-bright)',
                background: 'rgba(6, 182, 212, 0.1)',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid rgba(6, 182, 212, 0.25)',
              }}>
                RAPID PASS-THROUGH DETECTION
              </span>
            </div>

            <MoneyTrail ring={ring} />

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Note the short horizontal dwell tails across banking nodes: funds rarely remain in relay accounts for more than a few minutes before split forwarding, characteristic of mule account laundering networks.
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Evidence, Accounts, Ledger, Precedents */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Tabs Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-base)',
          }}>
            {[
              { id: 'why', label: 'Why Flagged', icon: Sparkles },
              { id: 'accounts', label: `Accounts (${ring.members.length})`, icon: Users },
              { id: 'transactions', label: `Ledger (${ring.transactions.length})`, icon: FileText },
              { id: 'similar', label: 'Precedents (RAG)', icon: History },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '12px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    background: isActive ? 'var(--bg-surface)' : 'transparent',
                    color: isActive ? 'var(--accent-bright)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Body */}
          <div style={{ padding: 18, overflowY: 'auto', maxHeight: 800 }}>
            {/* TAB 1: WHY THIS ALERT */}
            {activeTab === 'why' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Grounded LLM Explanation Narrative */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(13, 17, 23, 0.6) 100%)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: 6,
                  padding: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-bright)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>
                    <Sparkles size={14} /> GROUNDED XAI NARRATIVE REPORT
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{ring.narrative.text}"
                  </div>
                  <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Generated by LLM strictly constrained to GNNExplainer & SHAP attributions. No uncited entities or hallucinatory statements permitted.
                  </div>
                </div>

                {/* Ranked Feature & Subgraph Attributions */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    PRIMARY FRAUD ATTRIBUTION SIGNALS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ring.reasons.map((reason, idx) => (
                      <div
                        key={reason.reason_id}
                        style={{
                          background: 'var(--bg-base)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--accent)',
                          }}>
                            #{idx + 1} {reason.type.replace(/_/g, ' ')}
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                            background: 'var(--bg-surface)',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}>
                            Weight: {(reason.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {reason.text}
                        </div>
                        {reason.evidence && Object.keys(reason.evidence).length > 0 && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                            {Object.entries(reason.evidence).map(([key, val]) => (
                              <span
                                key={key}
                                style={{
                                  fontSize: '0.7rem',
                                  fontFamily: 'var(--font-mono)',
                                  background: 'rgba(255,255,255,0.04)',
                                  padding: '2px 6px',
                                  borderRadius: 3,
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {key}: <strong style={{ color: 'var(--text-primary)' }}>{String(val)}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Component Deconstruction */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    RING RISK DECOMPOSITION
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: 'var(--bg-base)', padding: 10, borderRadius: 4, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pass-Through Ratio</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {(ring.risk_components.pass_through_ratio * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-base)', padding: 10, borderRadius: 4, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Top-3 Node GNN Risk</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {ring.risk_components.top3_account_risk.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-base)', padding: 10, borderRadius: 4, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Topology Regularity</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {ring.risk_components.structural_score.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bg-base)', padding: 10, borderRadius: 4, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Federation Cross-Signals</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-bright)', fontFamily: 'var(--font-mono)' }}>
                        {ring.risk_components.federation_signals}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACCOUNTS */}
            {activeTab === 'accounts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Compare Single-Bank Isolated Risk vs Collaborative Federated Risk:
                </div>
                {ring.members.map(member => (
                  <div
                    key={member.account_token}
                    onClick={() => setSelectedAccount(member)}
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          {member.account_token}
                        </span>
                        <BankChip bank={member.bank} />
                        <RoleBadge role={member.role} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fed Risk:</span>
                        <RiskBar risk={member.risk} size="sm" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>Local Risk: <strong style={{ color: member.local_risk < 0.4 ? 'var(--safe)' : 'var(--caution)' }}>{Math.round(member.local_risk * 100)}</strong></span>
                      <span>In: <strong style={{ color: 'var(--text-primary)' }}>{formatPaise(member.in_paise)}</strong></span>
                      <span>Out: <strong style={{ color: 'var(--text-primary)' }}>{formatPaise(member.out_paise)}</strong></span>
                      <span>Dwell: <strong style={{ color: member.median_dwell_sec < 300 ? 'var(--alert)' : 'var(--text-primary)' }}>{member.median_dwell_sec}s</strong></span>
                    </div>

                    {member.federation_flags.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {member.federation_flags.map(flag => (
                          <span
                            key={flag}
                            style={{
                              fontSize: '0.68rem',
                              fontFamily: 'var(--font-mono)',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: 'var(--alert)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              padding: '1px 6px',
                              borderRadius: 3,
                            }}
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ring.transactions.map(txn => (
                  <div
                    key={txn.txn_id}
                    style={{
                      background: 'var(--bg-base)',
                      border: txn.flagged ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '10px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(txn.ts).toLocaleTimeString()} · {txn.type}
                      </span>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: txn.flagged ? 'var(--alert)' : 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {formatPaise(txn.amount_paise)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{txn.from.slice(0, 10)}...</span>
                      <ArrowUpRight size={14} color="var(--accent)" />
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{txn.to.slice(0, 10)}...</span>
                    </div>

                    {txn.flag_reasons.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {txn.flag_reasons.map(fr => (
                          <span
                            key={fr}
                            style={{
                              fontSize: '0.65rem',
                              fontFamily: 'var(--font-mono)',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: 'var(--alert)',
                              padding: '1px 5px',
                              borderRadius: 3,
                            }}
                          >
                            {fr}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: SIMILAR CASES (FAISS / RAG) */}
            {activeTab === 'similar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Nearest neighbour precedents retrieved from historical case repository via FAISS vector embedding:
                </div>
                {ring.similar_cases.map(sim => (
                  <div
                    key={sim.case_id}
                    style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        {sim.case_id}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--accent-bright)',
                        background: 'rgba(6, 182, 212, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}>
                        {Math.round(sim.similarity * 100)}% Match
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Historic Outcome:</span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: sim.outcome === 'confirmed_mule' ? 'var(--alert)' : 'var(--safe)',
                        textTransform: 'uppercase',
                      }}>
                        {sim.outcome.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      Analyst Closing Note: "{sim.analyst_note}"
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {sim.matched.map(m => (
                        <span
                          key={m}
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 6px',
                            borderRadius: 3,
                            color: 'var(--text-muted)',
                          }}
                        >
                          ✓ {m}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Drawer Slide-Out Modal */}
      {selectedAccount && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 440,
          height: '100vh',
          background: 'var(--bg-elevated)',
          borderLeft: '1px solid var(--border-bright)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: 24,
          gap: 16,
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Account Inspection Drawer
            </div>
            <button
              onClick={() => setSelectedAccount(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: 14, borderRadius: 6, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>ACCOUNT PSEUDONYMOUS TOKEN</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {selectedAccount.account_token}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <BankChip bank={selectedAccount.bank} />
              <RoleBadge role={selectedAccount.role} />
            </div>
          </div>

          {/* Local vs Federated Risk Comparison */}
          <div style={{ background: 'var(--bg-surface)', padding: 14, borderRadius: 6, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>FEDERATED GRAPH RISK VS LOCAL SILO RISK</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 2 }}>
                  <span>Collaborative Federated Risk:</span>
                  <span style={{ color: 'var(--alert)', fontWeight: 700 }}>{Math.round(selectedAccount.risk * 100)} / 100</span>
                </div>
                <RiskBar risk={selectedAccount.risk} size="md" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 2 }}>
                  <span>Single-Bank Local Risk:</span>
                  <span style={{ color: 'var(--caution)', fontWeight: 700 }}>{Math.round(selectedAccount.local_risk * 100)} / 100</span>
                </div>
                <RiskBar risk={selectedAccount.local_risk} size="md" />
              </div>
            </div>
          </div>

          {/* Account Velocity & Dwell Telemetry */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Inflow</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {formatPaise(selectedAccount.in_paise)}
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Outflow</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {formatPaise(selectedAccount.out_paise)}
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Median Dwell Time</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--alert)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {selectedAccount.median_dwell_sec} sec
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>First Observed</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                {new Date(selectedAccount.first_seen).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Federation Flags */}
          {selectedAccount.federation_flags.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', padding: 14, borderRadius: 6, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>CROSS-BANK FEDERATION SIGNALS</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedAccount.federation_flags.map(f => (
                  <span
                    key={f}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: 'var(--alert)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fixed Human-in-the-Loop Analyst Decision Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 260,
        right: 0,
        background: '#0d1320',
        borderTop: '1px solid var(--border-bright)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.6)',
        zIndex: 900,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 400px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Human Decision Authority (Mandatory Audit Protocol)
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Model recommends <span style={{ color: 'var(--caution)', fontWeight: 600, textTransform: 'uppercase' }}>{ring.model_recommendation.action}</span>. FraudMesh never auto-blocks.
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', minWidth: 260 }}>
            <input
              type="text"
              placeholder="State rationale for audit log (min 10 chars)..."
              value={decisionReason}
              onChange={e => {
                setDecisionReason(e.target.value);
                if (decisionError) setDecisionError('');
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                background: 'var(--bg-base)',
                border: decisionError ? '1px solid var(--alert)' : '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
            {decisionError && (
              <span style={{ position: 'absolute', left: 0, bottom: -18, fontSize: '0.68rem', color: 'var(--alert)' }}>
                {decisionError}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => handleDecision('freeze')}
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--alert)',
              color: 'var(--alert)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Freeze Accounts
          </button>

          <button
            onClick={() => handleDecision('escalate')}
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid var(--caution)',
              color: '#fbbf24',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Escalate to LEA
          </button>

          <button
            onClick={() => handleDecision('dismiss')}
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 500,
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Zap, 
  Radio, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Server, 
  Activity, 
  Skull, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useFraudMesh } from '../context/FraudMeshContext';
import BankChip from '../components/common/BankChip';

export default function SimulateScreen() {
  const navigate = useNavigate();
  const { 
    simulation, 
    injectSyntheticRing, 
    togglePoison, 
    toggleGroundTruth, 
    togglePlay, 
    setSpeed 
  } = useFraudMesh();

  const [lastInjectedId, setLastInjectedId] = useState<string | null>(null);

  const handleInject = () => {
    const injected = injectSyntheticRing();
    setLastInjectedId(injected.ring_id);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Top Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-bright)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}>
              DIGITAL TWIN SIMULATION BENCH & ATTACK STUDIO
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Live Multi-Bank Simulator & Adversarial Injection
          </h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 850 }}>
            Simulate a live production banking environment with 4 heterogeneous bank twins (PaySim + IEEE-CIS non-IID shards). Inject real-time cross-bank mule rings, test Byzantine poisoning attacks, and audit ground-truth discovery.
          </p>
        </div>
      </div>

      {/* Control Station Panel */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Simulation Master Controls
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Action 1: Inject Ring */}
          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-bright)', fontWeight: 600, fontSize: '0.9rem' }}>
                <Zap size={18} />
                <span>Inject Cross-Bank Mule Ring</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
                Generates an instant synthetic 3-bank mule chain (Bank A → C → D) passing ₹5.4L onward within minutes. The pipeline detects and ranks it at the top of the queue.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={handleInject}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: 4,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(6, 182, 212, 0.3)',
                }}
              >
                <Zap size={15} /> Inject Now
              </button>

              {lastInjectedId && (
                <button
                  onClick={() => navigate(`/rings/${lastInjectedId}`)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent-bright)',
                    padding: '8px 12px',
                    borderRadius: 4,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View {lastInjectedId} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Action 2: Byzantine Poisoning Toggle */}
          <div style={{
            background: 'var(--bg-base)',
            border: simulation.isPoisoned ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border)',
            borderRadius: 6,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: simulation.isPoisoned ? 'var(--alert)' : 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                <Skull size={18} />
                <span>Byzantine Node Poisoning</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
                Simulates an adversarial consortium bank (ICICI / Bank B) uploading sign-flipped or corrupted weights to sabotage global model aggregation.
              </p>
            </div>

            <div>
              <button
                onClick={togglePoison}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: simulation.isPoisoned ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface)',
                  border: simulation.isPoisoned ? '1px solid var(--alert)' : '1px solid var(--border)',
                  color: simulation.isPoisoned ? 'var(--alert)' : 'var(--text-secondary)',
                  padding: '9px 16px',
                  borderRadius: 4,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {simulation.isPoisoned ? '🔴 Deactivate Poisoning' : '⚠️ Toggle Poison Attack'}
              </button>
            </div>
          </div>

          {/* Action 3: Reveal Ground Truth */}
          <div style={{
            background: 'var(--bg-base)',
            border: simulation.groundTruthRevealed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
            borderRadius: 6,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: simulation.groundTruthRevealed ? 'var(--safe)' : 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                {simulation.groundTruthRevealed ? <Eye size={18} /> : <EyeOff size={18} />}
                <span>Evaluator / Jury Ground Truth</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
                Overlays synthetic ground-truth labels directly on rings to audit true positives, false positives, and cross-institution ring recovery precision.
              </p>
            </div>

            <div>
              <button
                onClick={toggleGroundTruth}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: simulation.groundTruthRevealed ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                  border: simulation.groundTruthRevealed ? '1px solid var(--safe)' : '1px solid var(--border)',
                  color: simulation.groundTruthRevealed ? 'var(--safe)' : 'var(--text-secondary)',
                  padding: '9px 16px',
                  borderRadius: 4,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {simulation.groundTruthRevealed ? '✓ Ground Truth Active' : 'Reveal Ground Truth'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Replay Stream Bar */}
        <div style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={togglePlay}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: simulation.isPlaying ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: simulation.isPlaying ? 'var(--accent-bright)' : 'var(--text-secondary)',
                padding: '6px 14px',
                borderRadius: 4,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {simulation.isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{simulation.isPlaying ? 'Pause Stream' : 'Resume Stream'}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Speed:</span>
              {[1, 5, 20].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 3,
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    border: simulation.speed === s ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: simulation.speed === s ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                    color: simulation.speed === s ? 'var(--accent-bright)' : 'var(--text-secondary)',
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={15} color="var(--safe)" />
              <span style={{ color: 'var(--text-secondary)' }}>Throughput:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{simulation.liveTps} TPS</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={15} color="var(--accent)" />
              <span style={{ color: 'var(--text-secondary)' }}>Injected Rings:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-bright)' }}>{simulation.injectedCount}</strong>
            </div>
          </div>
        </div>

        {/* Telemetry Log */}
        <div style={{
          background: 'var(--bg-deepest)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '10px 14px',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-bright)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ color: 'var(--text-muted)' }}>[SIM_TELEMETRY]:</span>
          <span>{simulation.lastEvent}</span>
        </div>
      </div>

      {/* 4 Banking Digital Twins Grid */}
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
          Participating Banking Digital Twins (Non-IID Heterogeneous Shards)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {[
            { id: 'A', name: 'State Bank of India (SBI)', fraudRate: '0.29%', accounts: 18420, model: 'GraphSAGE + DP-SGD', status: 'Honest · Synchronized' },
            { id: 'B', name: 'HDFC Bank', fraudRate: '12.4%', accounts: 14200, model: 'GraphSAGE + DP-SGD', status: simulation.isPoisoned ? 'ADVERSARIAL POISONING ACTIVE' : 'Honest · Synchronized' },
            { id: 'C', name: 'ICICI Bank', fraudRate: '40.8%', accounts: 9800, model: 'GraphSAGE + DP-SGD', status: 'Honest · Synchronized' },
            { id: 'D', name: 'Punjab National Bank (PNB)', fraudRate: '1.85%', accounts: 11500, model: 'GraphSAGE + DP-SGD', status: 'Honest · Synchronized' },
          ].map(bank => {
            const isBankPoisoned = bank.id === 'B' && simulation.isPoisoned;
            return (
              <div
                key={bank.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: isBankPoisoned ? '1px solid var(--alert)' : '1px solid var(--border)',
                  borderRadius: 6,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <BankChip bank={bank.id} />
                  <span style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    color: isBankPoisoned ? 'var(--alert)' : 'var(--safe)',
                    fontWeight: 600,
                  }}>
                    ● {bank.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {bank.name}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Local Shard Fraud Rate:</span>
                    <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{bank.fraudRate}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Active Account Nodes:</span>
                    <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{bank.accounts.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Local GNN Architecture:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{bank.model}</strong>
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-base)',
                  padding: '8px 12px',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: 'auto',
                }}>
                  Raw customer data remains isolated within Bank {bank.id}. Only clipped gradient updates shared with Flower coordinator.
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

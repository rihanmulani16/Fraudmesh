import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ShieldCheck, 
  Lock, 
  Award, 
  BookOpen, 
  GraduationCap, 
  TrendingUp 
} from 'lucide-react';
import { useFraudMesh } from '../context/FraudMeshContext';

export default function TrustScreen() {
  const { metrics } = useFraudMesh();

  // 1. Cross-institution ring recall data
  const ringRecallData = useMemo(() => [
    {
      category: '1 Bank (Local)',
      'Baseline A (Isolated)': Math.round(metrics.ring_recall.baseline_a['1'] * 100),
      'Baseline B (FedAvg)': Math.round(metrics.ring_recall.fedavg_b['1'] * 100),
      'Baseline C (FraudMesh Full)': Math.round(metrics.ring_recall.full_system_c['1'] * 100),
    },
    {
      category: '2 Banks',
      'Baseline A (Isolated)': Math.round(metrics.ring_recall.baseline_a['2'] * 100),
      'Baseline B (FedAvg)': Math.round(metrics.ring_recall.fedavg_b['2'] * 100),
      'Baseline C (FraudMesh Full)': Math.round(metrics.ring_recall.full_system_c['2'] * 100),
    },
    {
      category: '3+ Banks (Multi-Hop)',
      'Baseline A (Isolated)': Math.round(metrics.ring_recall.baseline_a['3+'] * 100),
      'Baseline B (FedAvg)': Math.round(metrics.ring_recall.fedavg_b['3+'] * 100),
      'Baseline C (FraudMesh Full)': Math.round(metrics.ring_recall.full_system_c['3+'] * 100),
    },
  ], [metrics]);

  // 2. Poisoning robustness data
  const robustnessData = useMemo(() => {
    return metrics.robustness.poisoned_share.map((share, i) => ({
      poisonShare: `${share}%`,
      FedAvg: Math.round(metrics.robustness.fedavg[i] * 100),
      Krum: Math.round(metrics.robustness.krum[i] * 100),
      'Trimmed Mean': Math.round(metrics.robustness.trimmed_mean[i] * 100),
    }));
  }, [metrics]);

  // 3. Differential privacy epsilon curve data
  const privacyData = useMemo(() => {
    return metrics.privacy.epsilon.map((eps, i) => ({
      epsilon: `ε=${eps}`,
      'Detection Quality': Math.round(metrics.privacy.detection_quality[i] * 100),
    }));
  }, [metrics]);

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
              RESEARCH BENCHMARKS & MODEL DEFENSE VERIFICATION
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Trust, Robustness & Evaluation Suite
          </h1>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 850 }}>
            Empirical evidence supporting FraudMesh's core claims: cross-institution mule ring recall gains, Byzantine attack resilience via robust aggregation, and Differential Privacy budgeting under non-IID bank partitions.
          </p>
        </div>
      </div>

      {/* Ring Discovery Headline Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>RING-LEVEL PRECISION</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-bright)', marginTop: 8 }}>
            {(metrics.ring_discovery.precision * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Discovered rings that are verified mules</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CROSS-INSTITUTION RECALL</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--safe)', marginTop: 8 }}>
            {(metrics.ring_discovery.recall * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Planted multi-bank rings recovered</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>RING F1-SCORE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a78bfa', marginTop: 8 }}>
            {(metrics.ring_discovery.f1 * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Harmonic mean of ring precision & recall</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MEMBER PURITY</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--caution)', marginTop: 8 }}>
            {(metrics.ring_discovery.purity * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>True mule accounts per candidate ring</div>
        </div>
      </div>

      {/* 2x2 Evaluation Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: 20 }}>
        {/* Chart 1: Cross-Institution Ring Recall */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              1. Cross-Institution Ring Recall (Baseline Comparison)
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Isolated single-bank models (Baseline A) vs Naive FedAvg (Baseline B) vs FraudMesh Full System (Baseline C)
            </div>
          </div>

          <div style={{ height: 280, width: '100%', marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ringRecallData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#8899aa" fontSize={11} />
                <YAxis stroke="#8899aa" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#131a27', borderColor: '#1e293b', borderRadius: 4, fontSize: '0.8rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />
                <Bar dataKey="Baseline A (Isolated)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Baseline B (FedAvg)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Baseline C (FraudMesh Full)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            padding: '10px 14px',
            borderRadius: 4,
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}>
            <strong>Finding:</strong> Single-institution models collapse to 15% recall when rings span 3+ banks because each bank only observes one disconnected transfer. FraudMesh achieves 82% recall collaboratively without exchanging raw data.
          </div>
        </div>

        {/* Chart 2: Robustness Under Byzantine Poisoning */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              2. Robust Aggregation vs Adversarial Poisoning
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Global model detection accuracy as share of poisoned/adversarial bank model updates increases
            </div>
          </div>

          <div style={{ height: 280, width: '100%', marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={robustnessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="poisonShare" stroke="#8899aa" fontSize={11} />
                <YAxis stroke="#8899aa" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#131a27', borderColor: '#1e293b', borderRadius: 4, fontSize: '0.8rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />
                <Line type="monotone" dataKey="FedAvg" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Krum" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Trimmed Mean" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            padding: '10px 14px',
            borderRadius: 4,
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}>
            <strong>Finding:</strong> Standard FedAvg degrades sharply to 22% under 40% poisoned updates. Krum and Coordinate-wise Trimmed Mean discard extreme outliers, maintaining reliable detection (&gt;60%) against malicious consortium participants.
          </div>
        </div>

        {/* Chart 3: Differential Privacy Trade-off */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              3. Differential Privacy Budget (ε) vs Detection Quality
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              DP-SGD clipping & Gaussian noise calibration on Graph Neural Network classifier head
            </div>
          </div>

          <div style={{ height: 280, width: '100%', marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={privacyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="epsilon" stroke="#8899aa" fontSize={11} />
                <YAxis stroke="#8899aa" fontSize={11} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#131a27', borderColor: '#1e293b', borderRadius: 4, fontSize: '0.8rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }} />
                <Line type="monotone" dataKey="Detection Quality" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            padding: '10px 14px',
            borderRadius: 4,
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}>
            <strong>Finding:</strong> Strong mathematical privacy guarantees (ε = 5.0 to 10.0) retain 83% detection quality while ensuring zero individual transaction reconstruction under RBI and DPDP regulations.
          </div>
        </div>

        {/* Panel 4: Architectural Blueprint & Academic Synopsis */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              4. Academic Synopsis & Architecture Summary
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Project Registration FF No. 180 · Department of CSE (Data Science), VIT Pune
            </div>
          </div>

          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Project:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>FraudMesh (SY-C6)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Academic Year:</span>
              <span>2026-2027 · Semester I</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Internal Guide:</span>
              <span style={{ color: 'var(--accent-bright)' }}>Prof. Vijaykumar Raghunath Ghule</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Team Members:</span>
              <span style={{ color: 'var(--text-primary)' }}>Soham R., Ravista T., Rhutvika P., Rihan M.</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Digital Twin Dataset:</span>
              <span>PaySim + IEEE-CIS (Non-IID Dirichlet α=0.5)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Core Models:</span>
              <span>PyTorch Geometric GraphSAGE, Flower FL, Opacus DP</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
            <div style={{ flex: 1, background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: 10, borderRadius: 4, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-bright)', fontWeight: 600 }}>NON-IID SHARDS</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>4 Bank Twins</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: 10, borderRadius: 4, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--safe)', fontWeight: 600 }}>FEDERATED ROUNDS</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>10 Rounds (&lt;3 min)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ring, ClosedCase, Decision, Metrics } from '../types';
import { rings as initialRings, closedCases as initialCases, metrics as initialMetrics } from '../data/mockData';

interface SimulationState {
  isPlaying: boolean;
  speed: number;
  isPoisoned: boolean;
  groundTruthRevealed: boolean;
  liveTps: number;
  injectedCount: number;
  lastEvent: string;
}

interface FraudMeshContextType {
  rings: Ring[];
  closedCases: ClosedCase[];
  decisions: Decision[];
  metrics: Metrics;
  simulation: SimulationState;
  addDecision: (ringId: string, action: 'freeze' | 'escalate' | 'dismiss', reason: string) => boolean;
  injectSyntheticRing: () => Ring;
  togglePoison: () => void;
  toggleGroundTruth: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  getRing: (ringId: string) => Ring | undefined;
  getDecisionsForRing: (ringId: string) => Decision[];
}

const FraudMeshContext = createContext<FraudMeshContextType | null>(null);

export const FraudMeshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rings, setRings] = useState<Ring[]>(() => {
    const saved = localStorage.getItem('fraudmesh_rings');
    return saved ? JSON.parse(saved) : initialRings;
  });

  const [closedCases, setClosedCases] = useState<ClosedCase[]>(() => {
    const saved = localStorage.getItem('fraudmesh_cases');
    return saved ? JSON.parse(saved) : initialCases;
  });

  const [decisions, setDecisions] = useState<Decision[]>(() => {
    const saved = localStorage.getItem('fraudmesh_decisions');
    return saved ? JSON.parse(saved) : [];
  });

  const [simulation, setSimulation] = useState<SimulationState>({
    isPlaying: true,
    speed: 1,
    isPoisoned: false,
    groundTruthRevealed: false,
    liveTps: 1840,
    injectedCount: 0,
    lastEvent: 'Federated round #14 completed across 4 banking nodes (SBI, HDFC, ICICI, PNB)',
  });

  // Save changes
  useEffect(() => {
    localStorage.setItem('fraudmesh_rings', JSON.stringify(rings));
  }, [rings]);

  useEffect(() => {
    localStorage.setItem('fraudmesh_cases', JSON.stringify(closedCases));
  }, [closedCases]);

  useEffect(() => {
    localStorage.setItem('fraudmesh_decisions', JSON.stringify(decisions));
  }, [decisions]);

  // Real-time telemetry simulation ticks
  useEffect(() => {
    if (!simulation.isPlaying) return;
    const interval = setInterval(() => {
      setSimulation(prev => ({
        ...prev,
        liveTps: Math.floor(1750 + Math.random() * 250),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [simulation.isPlaying]);

  const addDecision = (ringId: string, action: 'freeze' | 'escalate' | 'dismiss', reason: string): boolean => {
    const ring = rings.find(r => r.ring_id === ringId);
    if (!ring) return false;

    const newDecision: Decision = {
      decision_id: `d_${Date.now().toString(36)}`,
      ring_id: ringId,
      analyst_id: 'u_asha',
      action,
      reason,
      ts: new Date().toISOString(),
      model_recommendation: ring.model_recommendation.action,
      agreed_with_model: ring.model_recommendation.action === action,
    };

    setDecisions(prev => [newDecision, ...prev]);

    // Update ring status
    setRings(prev =>
      prev.map(r => (r.ring_id === ringId ? { ...r, status: 'decided' as const } : r))
    );

    // Add to closed cases
    const newCase: ClosedCase = {
      case_id: `C-${(closedCases.length + 1).toString().padStart(4, '0')}`,
      ring_id: ringId,
      outcome: action === 'freeze' ? 'confirmed_mule' : action === 'escalate' ? 'escalated' : 'false_positive',
      analyst: 'Asha (Bank A Fraud Ops)',
      closed_at: new Date().toISOString(),
      summary: ring.summary,
      risk: ring.ring_risk,
      banks: ring.banks,
      accounts_count: ring.members.length,
      total_value_paise: ring.risk_components.total_value_paise,
      analyst_note: reason,
    };

    setClosedCases(prev => [newCase, ...prev]);
    return true;
  };

  const injectSyntheticRing = (): Ring => {
    const randomHex = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
    const ringNumber = (rings.length + 420).toString().padStart(4, '0');
    const newId = `R-${ringNumber}`;

    const newRing: Ring = {
      ring_id: newId,
      status: 'new',
      window: {
        start: new Date(Date.now() - 15 * 60000).toISOString(),
        end: new Date().toISOString(),
      },
      ring_risk: 94,
      risk_components: {
        top3_account_risk: 0.96,
        pass_through_ratio: 0.98,
        total_value_paise: 5400000,
        banks_spanned: 3,
        structural_score: 0.88,
        federation_signals: 2,
      },
      summary: `LIVE INJECTION: 5 accounts across Banks A, C, D funnelled ₹5.4L in under 12 minutes.`,
      narrative: {
        text: `Synthetic mule chain dynamically detected across simulated bank shards. Fast pass-through verified with 98% fund velocity and a cross-bank shared device footprint.`,
        sentences: [
          { sentence: 'Immediate rapid layering hop observed across 3 separate banking digital twins.', cites: ['rs_live_1'] },
          { sentence: '98% of transferred capital relayed onward within 2 minutes per node.', cites: ['rs_live_2'] },
        ],
        source: 'template',
      },
      banks: ['A', 'C', 'D'],
      members: [
        { account_token: `acc_a${randomHex}_1`, bank: 'A', role: 'entry', risk: 0.95, local_risk: 0.35, in_paise: 5400000, out_paise: 5350000, median_dwell_sec: 90, first_seen: new Date().toISOString(), federation_flags: ['FAST_HOP'] },
        { account_token: `acc_c${randomHex}_2`, bank: 'C', role: 'relay', risk: 0.92, local_risk: 0.28, in_paise: 5350000, out_paise: 5300000, median_dwell_sec: 110, first_seen: new Date().toISOString(), federation_flags: ['SHARED_DEVICE'] },
        { account_token: `acc_d${randomHex}_3`, bank: 'D', role: 'branch', risk: 0.94, local_risk: 0.31, in_paise: 5300000, out_paise: 5250000, median_dwell_sec: 85, first_seen: new Date().toISOString(), federation_flags: [] },
        { account_token: `acc_d${randomHex}_4`, bank: 'D', role: 'cash_out', risk: 0.97, local_risk: 0.38, in_paise: 5250000, out_paise: 0, median_dwell_sec: 0, first_seen: new Date().toISOString(), federation_flags: ['ATM_BURST'] },
      ],
      edges: [
        { edge_id: `e_inj_${randomHex}_1`, from: `acc_a${randomHex}_1`, to: `acc_c${randomHex}_2`, total_paise: 5350000, txn_count: 1, suspicious: true, reason_ids: ['rs_live_1'] },
        { edge_id: `e_inj_${randomHex}_2`, from: `acc_c${randomHex}_2`, to: `acc_d${randomHex}_3`, total_paise: 5300000, txn_count: 1, suspicious: true, reason_ids: ['rs_live_1', 'rs_live_2'] },
        { edge_id: `e_inj_${randomHex}_3`, from: `acc_d${randomHex}_3`, to: `acc_d${randomHex}_4`, total_paise: 5250000, txn_count: 2, suspicious: true, reason_ids: ['rs_live_2'] },
      ],
      transactions: [
        { txn_id: `t_inj_${randomHex}_1`, edge_id: `e_inj_${randomHex}_1`, ts: new Date(Date.now() - 10 * 60000).toISOString(), from: `acc_a${randomHex}_1`, to: `acc_c${randomHex}_2`, amount_paise: 5350000, type: 'UPI', flagged: true, flag_reasons: ['RAPID_PASS_THROUGH'] },
        { txn_id: `t_inj_${randomHex}_2`, edge_id: `e_inj_${randomHex}_2`, ts: new Date(Date.now() - 8 * 60000).toISOString(), from: `acc_c${randomHex}_2`, to: `acc_d${randomHex}_3`, amount_paise: 5300000, type: 'IMPS', flagged: true, flag_reasons: ['RAPID_PASS_THROUGH', 'SHARED_DEVICE_CROSS_BANK'] },
        { txn_id: `t_inj_${randomHex}_3`, edge_id: `e_inj_${randomHex}_3`, ts: new Date(Date.now() - 3 * 60000).toISOString(), from: `acc_d${randomHex}_3`, to: `acc_d${randomHex}_4`, amount_paise: 3000000, type: 'UPI', flagged: true, flag_reasons: ['CASH_OUT_TERMINAL'] },
        { txn_id: `t_inj_${randomHex}_4`, edge_id: `e_inj_${randomHex}_3`, ts: new Date(Date.now() - 1 * 60000).toISOString(), from: `acc_d${randomHex}_3`, to: `acc_d${randomHex}_4`, amount_paise: 2250000, type: 'UPI', flagged: true, flag_reasons: ['CASH_OUT_TERMINAL'] },
      ],
      reasons: [
        { reason_id: 'rs_live_1', type: 'RAPID_PASS_THROUGH', weight: 0.42, text: '98% of inflow forwarded within 2 minutes across Bank A -> Bank C -> Bank D.', evidence: { ratio: 0.98, median_dwell_sec: 95 }, node_ids: [`acc_a${randomHex}_1`, `acc_c${randomHex}_2`], edge_ids: [`e_inj_${randomHex}_1`], txn_ids: [`t_inj_${randomHex}_1`] },
        { reason_id: 'rs_live_2', type: 'CASH_OUT_TERMINAL', weight: 0.35, text: 'Terminal recipient account withdrew ₹5.25L with zero onward forwarding.', evidence: { total_paise: 5250000 }, node_ids: [`acc_d${randomHex}_4`], edge_ids: [`e_inj_${randomHex}_3`], txn_ids: [`t_inj_${randomHex}_3`] },
      ],
      model_recommendation: { action: 'freeze', confidence: 0.94 },
      similar_cases: [
        { case_id: 'C-0078', similarity: 0.91, outcome: 'confirmed_mule', matched: ['3-hop multi-bank', 'under 5 min dwell'], analyst_note: 'Instant freeze prevented secondary siphon.' },
      ],
      ground_truth: { is_ring: true, true_members: [`acc_a${randomHex}_1`, `acc_c${randomHex}_2`, `acc_d${randomHex}_3`, `acc_d${randomHex}_4`] },
    };

    setRings(prev => [newRing, ...prev]);
    setSimulation(prev => ({
      ...prev,
      injectedCount: prev.injectedCount + 1,
      lastEvent: `Injected synthetic 3-bank mule ring ${newId} (Risk 94) into Digital Twin streaming queue`,
    }));
    return newRing;
  };

  const togglePoison = () => {
    setSimulation(prev => {
      const nextState = !prev.isPoisoned;
      return {
        ...prev,
        isPoisoned: nextState,
        lastEvent: nextState
          ? 'Adversarial bank node (Bank B) injected malicious weight poisoning. Robust aggregation active!'
          : 'Poisoning deactivated. All banking client nodes running standard honest training updates.',
      };
    });
  };

  const toggleGroundTruth = () => {
    setSimulation(prev => ({
      ...prev,
      groundTruthRevealed: !prev.groundTruthRevealed,
      lastEvent: !prev.groundTruthRevealed
        ? 'Ground-truth mule labels revealed (Evaluator / Jury mode active)'
        : 'Ground-truth overlay disabled (Standard analyst perspective)',
    }));
  };

  const togglePlay = () => {
    setSimulation(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  const setSpeed = (speed: number) => {
    setSimulation(prev => ({
      ...prev,
      speed,
    }));
  };

  const getRing = (ringId: string) => rings.find(r => r.ring_id === ringId);

  const getDecisionsForRing = (ringId: string) => decisions.filter(d => d.ring_id === ringId);

  return (
    <FraudMeshContext.Provider
      value={{
        rings,
        closedCases,
        decisions,
        metrics: initialMetrics,
        simulation,
        addDecision,
        injectSyntheticRing,
        togglePoison,
        toggleGroundTruth,
        togglePlay,
        setSpeed,
        getRing,
        getDecisionsForRing,
      }}
    >
      {children}
    </FraudMeshContext.Provider>
  );
};

export const useFraudMesh = () => {
  const context = useContext(FraudMeshContext);
  if (!context) {
    throw new Error('useFraudMesh must be used within a FraudMeshProvider');
  }
  return context;
};

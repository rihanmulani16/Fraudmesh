export interface RiskComponents {
  top3_account_risk: number;
  pass_through_ratio: number;
  total_value_paise: number;
  banks_spanned: number;
  structural_score: number;
  federation_signals: number;
}

export interface Member {
  account_token: string;
  bank: string;
  role: 'entry' | 'relay' | 'branch' | 'cash_out';
  risk: number;
  local_risk: number;
  in_paise: number;
  out_paise: number;
  median_dwell_sec: number;
  first_seen: string;
  federation_flags: string[];
}

export interface Edge {
  edge_id: string;
  from: string;
  to: string;
  total_paise: number;
  txn_count: number;
  suspicious: boolean;
  reason_ids: string[];
}

export interface Transaction {
  txn_id: string;
  edge_id: string;
  ts: string;
  from: string;
  to: string;
  amount_paise: number;
  type: string;
  flagged: boolean;
  flag_reasons: string[];
}

export type ReasonType = 
  | 'RAPID_PASS_THROUGH'
  | 'AMOUNT_SPLITTING'
  | 'NEW_PAYEE_BURST'
  | 'FAN_IN_FAN_OUT'
  | 'ROUND_AMOUNT'
  | 'SHARED_DEVICE_CROSS_BANK'
  | 'DORMANT_REACTIVATION'
  | 'CASH_OUT_TERMINAL'
  | 'RING_TOPOLOGY_MATCH';

export interface Reason {
  reason_id: string;
  type: ReasonType;
  weight: number;
  text: string;
  evidence: Record<string, any>;
  node_ids: string[];
  edge_ids: string[];
  txn_ids: string[];
}

export interface Narrative {
  text: string;
  sentences: { sentence: string; cites: string[] }[];
  source: 'llm' | 'template';
}

export interface SimilarCase {
  case_id: string;
  similarity: number;
  outcome: 'confirmed_mule' | 'false_positive' | 'escalated';
  matched: string[];
  analyst_note: string;
}

export interface ModelRecommendation {
  action: 'freeze' | 'escalate' | 'dismiss';
  confidence: number;
}

export interface Ring {
  ring_id: string;
  status: 'new' | 'in_review' | 'decided';
  window: { start: string; end: string };
  ring_risk: number;
  risk_components: RiskComponents;
  summary: string;
  narrative: Narrative;
  banks: string[];
  members: Member[];
  edges: Edge[];
  transactions: Transaction[];
  reasons: Reason[];
  model_recommendation: ModelRecommendation;
  similar_cases: SimilarCase[];
  ground_truth: null | { is_ring: boolean; true_members: string[] };
}

export interface Decision {
  decision_id: string;
  ring_id: string;
  analyst_id: string;
  action: 'freeze' | 'escalate' | 'dismiss';
  reason: string;
  ts: string;
  model_recommendation: string;
  agreed_with_model: boolean;
}

export interface ClosedCase {
  case_id: string;
  ring_id: string;
  outcome: 'confirmed_mule' | 'false_positive' | 'escalated';
  analyst: string;
  closed_at: string;
  summary: string;
  risk: number;
  banks: string[];
  accounts_count: number;
  total_value_paise: number;
  analyst_note: string;
}

export interface Metrics {
  ring_recall: {
    baseline_a: Record<string, number>;
    fedavg_b: Record<string, number>;
    full_system_c: Record<string, number>;
  };
  robustness: {
    poisoned_share: number[];
    fedavg: number[];
    krum: number[];
    trimmed_mean: number[];
  };
  privacy: {
    epsilon: (number | string)[];
    detection_quality: number[];
  };
  ring_discovery: {
    precision: number;
    recall: number;
    f1: number;
    purity: number;
  };
}

export const BANK_COLORS: Record<string, string> = {
  A: '#3b82f6',
  B: '#8b5cf6',
  C: '#06b6d4',
  D: '#f59e0b',
  E: '#84cc16',
  F: '#ec4899',
};

export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(1)}Cr`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getTimeDiff(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return formatDuration(Math.round(ms / 1000));
}

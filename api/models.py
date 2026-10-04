from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class RiskComponents(BaseModel):
    top3_account_risk: int
    pass_through_ratio: float
    total_value_paise: int
    banks_spanned: int
    structural_score: int
    federation_signals: Dict[str, Any]

class Member(BaseModel):
    account_token: str
    bank: str
    role: str
    risk: int
    local_risk: int
    in_paise: int
    out_paise: int
    median_dwell_sec: int
    first_seen: datetime
    federation_flags: List[str]

class Edge(BaseModel):
    edge_id: str
    from_acc: str = Field(alias="from")
    to_acc: str = Field(alias="to")
    total_paise: int
    txn_count: int
    suspicious: bool
    reason_ids: List[str]

class Transaction(BaseModel):
    txn_id: str
    edge_id: str
    ts: datetime
    from_acc: str = Field(alias="from")
    to_acc: str = Field(alias="to")
    amount_paise: int
    type: str
    flagged: bool
    flag_reasons: List[str]

class Reason(BaseModel):
    reason_id: str
    type: str
    weight: float
    text: str
    evidence: str
    node_ids: List[str]
    edge_ids: List[str]
    txn_ids: List[str]

class ModelRecommendation(BaseModel):
    action: str
    confidence: float

class SimilarCase(BaseModel):
    case_id: str
    similarity: float
    outcome: str
    matched_features: List[str]
    analyst_note: str

class Ring(BaseModel):
    ring_id: str
    status: str
    window_start: datetime
    window_end: datetime
    ring_risk: int
    risk_components: RiskComponents
    summary: str
    narrative: str
    banks: List[str]
    members: List[Member]
    edges: List[Edge]
    transactions: List[Transaction]
    reasons: List[Reason]
    model_recommendation: ModelRecommendation
    similar_cases: List[SimilarCase]
    ground_truth: Optional[Dict[str, Any]] = None

class RingSummarized(BaseModel):
    ring_id: str
    status: str
    window_start: datetime
    window_end: datetime
    ring_risk: int
    summary: str
    banks: List[str]

class DecisionRequest(BaseModel):
    decision: str
    reason: str = Field(..., min_length=10)

class Decision(BaseModel):
    id: str
    ring_id: str
    decision: str
    reason: str
    timestamp: datetime
    analyst: str

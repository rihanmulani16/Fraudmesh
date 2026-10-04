from datetime import datetime, timedelta, timezone

def generate_mock_data():
    now = datetime.now(timezone.utc)
    
    rings = []
    configs = [
        ("R-0412", "new", 87, 42000000, ["A", "C", "D"], 7, "Classic cross-bank pass-through", 37),
        ("R-0409", "in_review", 64, 11000000, ["B", "C"], 4, "Slower relay", 130),
        ("R-0415", "new", 92, 87000000, ["A", "B", "C", "D"], 9, "Large fast ring", 22),
        ("R-0401", "decided", 55, 4000000, ["A"], 3, "Single bank pass-through", 45),
        ("R-0406", "new", 71, 23000000, ["A", "B"], 5, "Fan-out pattern", 75),
        ("R-0418", "new", 95, 121000000, ["B", "C", "D"], 12, "Large high-risk", 18),
        ("R-0403", "decided", 38, 8000000, ["A", "C"], 3, "Salary routing (False Positive)", 60),
        ("R-0420", "new", 42, 6000000, ["B", "D"], 4, "Shared expense splitting (False Positive)", 120),
        ("R-0411", "new", 78, 35000000, ["A", "B", "D"], 6, "Medium complexity relay", 55),
        ("R-0414", "in_review", 68, 18000000, ["C", "D"], 5, "Double hop transfer", 90),
        ("R-0417", "new", 83, 56000000, ["A", "C", "D"], 8, "Aggregated cash-out", 28),
        ("R-0422", "new", 51, 9000000, ["B"], 4, "Intra-bank cyclic transfer", 120),
    ]

    for c in configs:
        ring_id, status, risk, amount, banks, num_accs, summary, duration_min = c
        
        start_time = now - timedelta(hours=2)
        end_time = start_time + timedelta(minutes=duration_min)
        
        members = []
        for i in range(num_accs):
            members.append({
                "account_token": f"acc_{ring_id}_{i}",
                "bank": banks[i % len(banks)],
                "role": "entry" if i == 0 else ("cash_out" if i == num_accs-1 else "relay"),
                "risk": risk + (i % 10) - 5,
                "local_risk": risk - 10,
                "in_paise": amount if i > 0 else 0,
                "out_paise": amount if i < num_accs-1 else 0,
                "median_dwell_sec": 300,
                "first_seen": (start_time - timedelta(days=30)).isoformat(),
                "federation_flags": ["HIGH_VELOCITY"] if i > 0 else []
            })
            
        edges = []
        txns = []
        for i in range(num_accs - 1):
            edge_id = f"e_{ring_id}_{i}"
            edges.append({
                "edge_id": edge_id,
                "from": members[i]["account_token"],
                "to": members[i+1]["account_token"],
                "total_paise": amount,
                "txn_count": 3,
                "suspicious": risk > 50,
                "reason_ids": ["r1"] if risk > 50 else []
            })
            
            for j in range(3):
                txns.append({
                    "txn_id": f"t_{edge_id}_{j}",
                    "edge_id": edge_id,
                    "ts": (start_time + timedelta(minutes=5*i + j)).isoformat(),
                    "from": members[i]["account_token"],
                    "to": members[i+1]["account_token"],
                    "amount_paise": amount // 3,
                    "type": "IMPS",
                    "flagged": risk > 50,
                    "flag_reasons": ["RAPID_PASS_THROUGH"]
                })
                
        reasons = [
            {
                "reason_id": "r1",
                "type": "RAPID_PASS_THROUGH",
                "weight": 0.8,
                "text": "Accounts show rapid pass-through behavior",
                "evidence": "High proportion of incoming funds transferred out within minutes.",
                "node_ids": [m["account_token"] for m in members[1:-1]],
                "edge_ids": [e["edge_id"] for e in edges],
                "txn_ids": [t["txn_id"] for t in txns]
            }
        ]
        
        rings.append({
            "ring_id": ring_id,
            "status": status,
            "window_start": start_time.isoformat(),
            "window_end": end_time.isoformat(),
            "ring_risk": risk,
            "risk_components": {
                "top3_account_risk": min(100, risk + 5),
                "pass_through_ratio": 0.95,
                "total_value_paise": amount,
                "banks_spanned": len(banks),
                "structural_score": 80,
                "federation_signals": {"cross_bank_velocity": "high"}
            },
            "summary": summary,
            "narrative": "A suspicious pattern of transactions was detected spanning multiple accounts.",
            "banks": banks,
            "members": members,
            "edges": edges,
            "transactions": txns,
            "reasons": reasons if risk > 50 else [],
            "model_recommendation": {
                "action": "escalate" if risk > 70 else ("freeze" if risk > 90 else "dismiss"),
                "confidence": 0.85
            },
            "similar_cases": [
                {
                    "case_id": f"CASE-10{i}",
                    "similarity": 0.75 + (i * 0.05),
                    "outcome": "Confirmed Fraud",
                    "matched_features": ["similar_topology", "shared_device"],
                    "analyst_note": "Previously flagged similar pattern"
                } for i in range(2)
            ],
            "ground_truth": None
        })

    cases = []
    for i in range(40):
        cases.append({
            "case_id": f"CASE-20{i:02d}",
            "ring_id": f"R-OLD-{i}",
            "status": "closed",
            "decision": "freeze" if i % 2 == 0 else "dismiss",
            "closed_at": (now - timedelta(days=i)).isoformat(),
            "summary": f"Historical case {i}",
            "risk": 50 + i
        })

    metrics = {
        "ring_recall": {
            "baseline_a": {"1": 0.6, "2": 0.4, "3+": 0.2},
            "fedavg_b": {"1": 0.6, "2": 0.7, "3+": 0.6},
            "full_system_c": {"1": 0.7, "2": 0.85, "3+": 0.8}
        },
        "robustness": {
            "poisoned_share": [0, 10, 20, 30, 40],
            "fedavg": [0.85, 0.75, 0.6, 0.4, 0.3],
            "krum": [0.85, 0.83, 0.8, 0.75, 0.6],
            "trimmed_mean": [0.85, 0.84, 0.82, 0.78, 0.65]
        },
        "privacy": {
            "epsilon": [1, 5, 10, 20, "inf"],
            "detection_quality": [0.6, 0.75, 0.82, 0.85, 0.86]
        },
        "ring_discovery": {
            "precision": 0.88,
            "recall": 0.85,
            "f1": 0.86,
            "purity": 0.92
        }
    }

    return rings, cases, metrics

RINGS, CASES, METRICS = generate_mock_data()

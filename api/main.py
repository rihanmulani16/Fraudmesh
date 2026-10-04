from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
import asyncio
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from models import Ring, RingSummarized, DecisionRequest, Decision
from mock_data import RINGS, CASES, METRICS

app = FastAPI(title="FraudMesh API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

decisions_db = []

@app.get("/api/rings")
def get_rings(status: Optional[str] = None, bank: Optional[str] = None, min_risk: Optional[int] = None, sort: str = "-ring_risk"):
    filtered = RINGS
    if status:
        filtered = [r for r in filtered if r["status"] == status]
    if bank:
        filtered = [r for r in filtered if bank in r["banks"]]
    if min_risk is not None:
        filtered = [r for r in filtered if r["ring_risk"] >= min_risk]
        
    if sort == "-ring_risk":
        filtered = sorted(filtered, key=lambda x: x["ring_risk"], reverse=True)
        
    return [
        {
            "ring_id": r["ring_id"],
            "status": r["status"],
            "window_start": r["window_start"],
            "window_end": r["window_end"],
            "ring_risk": r["ring_risk"],
            "summary": r["summary"],
            "banks": r["banks"]
        } for r in filtered
    ]

@app.get("/api/rings/{ring_id}")
def get_ring_detail(ring_id: str):
    for r in RINGS:
        if r["ring_id"] == ring_id:
            return r
    raise HTTPException(status_code=404, detail="Ring not found")

@app.get("/api/rings/{ring_id}/lens")
def get_ring_lens(ring_id: str, bank: str):
    ring = next((r for r in RINGS if r["ring_id"] == ring_id), None)
    if not ring:
        raise HTTPException(status_code=404, detail="Ring not found")
        
    lens_ring = dict(ring)
    lens_ring["members"] = [
        m if m["bank"] == bank else {
            "account_token": m["account_token"],
            "bank": "EXTERNAL",
            "role": "unknown",
            "risk": m["risk"],
            "local_risk": 0,
            "in_paise": 0,
            "out_paise": 0,
            "median_dwell_sec": 0,
            "first_seen": m["first_seen"],
            "federation_flags": []
        }
        for m in ring["members"]
    ]
    return lens_ring

@app.get("/api/accounts/{token}")
def get_account_detail(token: str):
    for r in RINGS:
        for m in r["members"]:
            if m["account_token"] == token:
                return {"account": m, "ring_id": r["ring_id"]}
    raise HTTPException(status_code=404, detail="Account not found")

@app.get("/api/rings/{ring_id}/similar")
def get_similar_cases(ring_id: str):
    ring = next((r for r in RINGS if r["ring_id"] == ring_id), None)
    if not ring:
        raise HTTPException(status_code=404, detail="Ring not found")
    return ring["similar_cases"]

@app.post("/api/rings/{ring_id}/decision")
def create_decision(ring_id: str, req: DecisionRequest):
    if len(req.reason) < 10:
        raise HTTPException(status_code=400, detail="Reason must be at least 10 characters")
        
    decision = Decision(
        id=str(uuid.uuid4()),
        ring_id=ring_id,
        decision=req.decision,
        reason=req.reason,
        timestamp=datetime.now(timezone.utc),
        analyst="current_user"
    )
    decisions_db.append(decision)
    
    for r in RINGS:
        if r["ring_id"] == ring_id:
            r["status"] = "decided"
            break
            
    return decision

@app.get("/api/decisions")
def get_decisions():
    return decisions_db

@app.get("/api/cases")
def get_cases():
    return CASES

@app.get("/api/metrics")
def get_metrics():
    return METRICS

@app.get("/api/stream/rings")
async def stream_rings(request: Request):
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            # Send an update event
            yield {
                "event": "update",
                "data": '{"ping": "alive"}'
            }
            await asyncio.sleep(15)
    return EventSourceResponse(event_generator())

@app.post("/api/sim/inject-ring")
def inject_ring():
    return {"status": "injected"}

@app.post("/api/sim/poison")
def toggle_poison():
    return {"status": "toggled"}

@app.get("/api/sim/ground-truth/{ring_id}")
def get_ground_truth(ring_id: str):
    return {"ground_truth": "data"}

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web", "dist"))
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(dist_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))


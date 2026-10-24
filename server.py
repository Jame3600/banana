"""PixelSoft HQ backend.

Serves the game and powers the agents.

Agent modes (auto-detected, best first):
1. Claude Code CLI  — if the `claude` command is on PATH, each department agent
   runs `claude -p "<persona prompt>"` for a real answer.
2. Demo mode        — no CLI found: agents return canned replies and progress
   is simulated, so the game is fully playable anywhere.

Run:  uvicorn server:app --port 8787      (then open http://localhost:8787)
"""

from __future__ import annotations

import os
import shutil
import subprocess
import threading
import time
import uuid

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="PixelSoft HQ")

ROOT = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(ROOT, "static")

DEPTS = ["DESIGN", "FRONTEND", "BACKEND", "QA LAB", "ART STUDIO"]

CLAUDE = shutil.which("claude")
CLAUDE_TIMEOUT = int(os.environ.get("PIXELSOFT_CLAUDE_TIMEOUT", "180"))

PERSONAS = {
    "fable": (
        "You are Fable, the CTO of PixelSoft HQ, a tiny pixel-art software "
        "company. The user is the CEO. Reply briefly (2-4 sentences), warm and "
        "practical, like a trusted CTO in a retro RPG dialogue box."
    ),
    "opus": (
        "You are Opus, the Assistant CTO of PixelSoft HQ. You handle quick, "
        "simple tasks directly so the CTO stays free. Reply in 1-3 short "
        "sentences, fast and to the point."
    ),
}
DEPT_PERSONAS = {
    "DESIGN": "You are the Design department agent. Produce a short UX/UI plan.",
    "FRONTEND": "You are the Frontend department agent. Outline the frontend build.",
    "BACKEND": "You are the Backend department agent. Outline the backend build.",
    "QA LAB": "You are the QA department agent. Write a short test plan.",
    "ART STUDIO": (
        "You are Gemini, the artist agent. Describe the art assets you will "
        "create (original pixel-art, no copyrighted characters)."
    ),
}

# ----------------------------------------------------------------- state
LOCK = threading.Lock()
STATE = {
    "used": 0.0,
    "budget": int(os.environ.get("PIXELSOFT_BUDGET", "200000")),
    "by_dept": {},
    "model": "fable",
    "paused": False,
}
PROJECTS: dict[str, dict] = {}


def est_tokens(text: str) -> int:
    return max(1, len(text) // 4)


def spend(n: float, dept: str) -> None:
    with LOCK:
        STATE["used"] += n
        STATE["by_dept"][dept] = STATE["by_dept"].get(dept, 0) + n


def usage() -> dict:
    with LOCK:
        return {
            "used": round(STATE["used"]),
            "budget": STATE["budget"],
            "by_dept": {k: round(v) for k, v in STATE["by_dept"].items()},
            "model": STATE["model"],
            "paused": STATE["paused"],
            "real_agents": bool(CLAUDE),
        }


def run_claude(prompt: str) -> str | None:
    """Ask Claude Code for one headless completion. None on any failure."""
    if not CLAUDE:
        return None
    try:
        out = subprocess.run(
            [CLAUDE, "-p", prompt, "--output-format", "text"],
            capture_output=True,
            text=True,
            timeout=CLAUDE_TIMEOUT,
        )
        reply = (out.stdout or "").strip()
        return reply or None
    except Exception:
        return None


def demo_reply(to: str, text: str) -> str:
    t = text.lower()
    if to == "opus":
        return "On it, boss — quick task done! (demo reply: install Claude Code for real agents)"
    if any(w in t for w in ("hello", "hi", "sawasdee")):
        return "Hello CEO! Ready when you are. Try: /project build a robot control app"
    return (
        "Noted! Use '/project <your idea>' and I'll split it across the five "
        "departments. (demo reply — install Claude Code CLI for real answers)"
    )


# ------------------------------------------------------------------ API
class ChatIn(BaseModel):
    to: str = "fable"
    text: str


class ProjectIn(BaseModel):
    idea: str


class ModelIn(BaseModel):
    model: str


@app.post("/api/chat")
def chat(body: ChatIn):
    who = body.to if body.to in PERSONAS else "fable"
    prompt = f"{PERSONAS[who]}\n\nCEO says: {body.text}\n\nYour reply:"
    reply = run_claude(prompt) or demo_reply(who, body.text)
    dept = "ASST. CTO" if who == "opus" else "MEETING"
    spend(est_tokens(prompt) + est_tokens(reply), dept)
    return {"reply": reply, "usage": usage()}


@app.post("/api/project")
def project(body: ProjectIn):
    pid = uuid.uuid4().hex[:8]
    tasks = {d: {"progress": 0, "status": "queued", "summary": ""} for d in DEPTS}
    PROJECTS[pid] = {"idea": body.idea, "tasks": tasks, "done": False}
    threading.Thread(target=_run_project, args=(pid,), daemon=True).start()
    return {"id": pid}


def _run_project(pid: str) -> None:
    proj = PROJECTS[pid]
    idea = proj["idea"]

    def work(dept: str) -> None:
        task = proj["tasks"][dept]
        task["status"] = "working"
        if CLAUDE:
            for p in (15, 35, 55):
                task["progress"] = p
                time.sleep(0.8)
                while STATE["paused"]:
                    time.sleep(1)
            prompt = (
                f"{DEPT_PERSONAS[dept]}\nProject idea from the CEO: {idea}\n"
                "Answer in at most 5 short bullet lines."
            )
            reply = run_claude(prompt) or f"{dept}: plan drafted (CLI call failed)."
            spend(est_tokens(prompt) + est_tokens(reply), dept)
            task["summary"] = reply
        else:
            for p in range(5, 101, 5):
                while STATE["paused"]:
                    time.sleep(1)
                task["progress"] = p
                spend(90, dept)
                time.sleep(0.5)
            task["summary"] = f"{dept}: demo task for '{idea}' complete."
        task["progress"] = 100
        task["status"] = "done"

    threads = [threading.Thread(target=work, args=(d,), daemon=True) for d in DEPTS]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    proj["done"] = True


@app.get("/api/project/{pid}")
def project_status(pid: str):
    proj = PROJECTS.get(pid)
    if not proj:
        return {"error": "unknown project", "done": True, "tasks": {}, "usage": usage()}
    return {"tasks": proj["tasks"], "done": proj["done"], "usage": usage()}


@app.get("/api/usage")
def get_usage():
    return usage()


@app.post("/api/model")
def set_model(body: ModelIn):
    with LOCK:
        STATE["model"] = body.model if body.model in ("fable", "opus") else "fable"
    return usage()


@app.post("/api/pause")
def pause():
    with LOCK:
        STATE["paused"] = True
    return usage()


@app.post("/api/resume")
def resume():
    with LOCK:
        STATE["paused"] = False
        STATE["used"] = 0
        STATE["by_dept"] = {}
    return usage()


@app.get("/")
def index():
    return FileResponse(os.path.join(STATIC, "index.html"))


app.mount("/", StaticFiles(directory=STATIC), name="static")

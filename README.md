# PixelSoft HQ 🏢

A retro pixel-art game that is also a real AI software company.
You are the **CEO**. **Fable** is your CTO, **Opus** is the Assistant CTO for
quick tasks, **Gemini** is the artist, and five departments (Design, Frontend,
Backend, QA Lab, Art Studio) do the work. Type in the chat bar, press Enter,
and your character walks across the office to deliver the message.

## Run it (Ubuntu or Windows)

```bash
git clone https://github.com/Jame3600/pixelsoft-hq.git
cd pixelsoft-hq
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --port 8787
```

Open **http://localhost:8787** in any browser.

- With the **Claude Code CLI** installed (`claude` on your PATH), the agents are
  real: every chat and every department task runs a headless `claude -p` call.
- Without it, the game runs in **demo mode** (canned replies, simulated
  progress) so you can still play anywhere.
- You can even open `static/index.html` directly with no server — full demo
  mode in the browser.

## How to play

| Action | What happens |
|---|---|
| Type anything + Enter | CEO walks to the meeting room; Fable walks in and answers in the dialogue box |
| `/project <idea>` | Fable splits the idea into 5 tasks; agents walk to every department; progress bars fill; reports land in the Log |
| `/model opus` / `/model fable` | Switch who you talk to (Opus = quick simple tasks) |
| `/usage` | CEO walks to the meeting room and the **token dashboard** opens |
| `/pause`, `/resume` | Pause agents / reset tokens and send everyone back to work |
| `/help` | List commands |
| 📊 / 🗒 buttons | Open the dashboard / the office log |

## Token rules ☕

The dashboard tracks tokens **this app spends** (estimated from each agent
call; your claude.ai plan limits are not exposed to apps, so set your own
budget). Default budget: 200,000 tokens per session — change it with
`PIXELSOFT_BUDGET=500000 uvicorn server:app --port 8787`.

When the budget is used up, **everyone walks to the cafeteria** and work
pauses. Type `/resume` (or press *Reset & resume* on the dashboard) when your
tokens reset, and everyone walks back to their desks.

## Project layout

```
server.py            FastAPI backend: chat, projects, usage, Claude Code bridge
static/index.html    Game page (dialogue box, typing bar, dashboard, log)
static/game.js       Canvas engine: office art, walking characters, game logic
static/style.css     RPG-style UI
CLAUDE.md            Company rules for Claude Code sessions in this repo
```

## Roadmap

- [ ] Real artifact output per department (files written into `workspace/`)
- [ ] Gemini image generation hook for the Art Studio
- [ ] WebSocket live updates instead of polling
- [ ] Dobot ATOM robot-control project as the first real client job
- [ ] Save/load company state between sessions

Made by CEO **Jame3600** with CTO **Fable** (Claude).

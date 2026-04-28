# Plan Folder

This folder is the source of truth for project direction, status, and decisions.

| File | Purpose |
|---|---|
| `roadmap.md` | What we're building, phase by phase. Long-term direction. |
| `progress.md` | What's done, what's in flight, what's next. Updated as work happens. |
| `decisions.md` | Architecture & product decisions with rationale. Append-only. |
| `architecture.md` | How the system is wired (stack, data flow, schema, deploy). |
| `pricing.md` | Free vs paid feature gates, pricing tiers, monetization plan. |
| `disclaimers.md` | Legal language and liability strategy. |

## How to use this folder

- **When you want to know "what's next"** → `progress.md`
- **When you want to know "why did we do X"** → `decisions.md`
- **When you want to know "how does X work"** → `architecture.md`
- **When you want to know "is this on the plan"** → `roadmap.md`

Update `progress.md` after every meaningful chunk of work. Append to `decisions.md`
when a non-trivial choice is made. Treat `roadmap.md` as the contract; if it
changes, log the change in `decisions.md`.

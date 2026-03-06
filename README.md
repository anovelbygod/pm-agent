# Arcspect

> Great products start here.

**Arcspect** is an AI-powered product documentation tool that turns a one-line idea into structured product specs — PRDs, user stories, acceptance criteria, success metrics, and risk registers — in seconds.

🔗 **Live demo:** [arcspect.netlify.app](https://arcspect.netlify.app)

---

## What it does

Arcspect has 5 documentation modes:

| Mode | Output |
|------|--------|
| **Full PRD** | Problem statement, goals, user personas, solution, metrics, risks |
| **User Stories** | Backlog-ready stories in As a / I want / So that format with acceptance criteria |
| **Acceptance Criteria** | Happy path, edge cases, error states, non-functional requirements |
| **Success Metrics** | North star metric, leading/lagging indicators, guardrail metrics, targets |
| **Risks & Assumptions** | Structured risk register across technical, business, user, and compliance dimensions |

You can add background context — user research, business goals, technical constraints — to make the output more tailored and precise.

---

## Built with

- **Claude Haiku 4.5** (Anthropic API) — the AI backbone
- **Netlify Functions** — serverless backend to handle API calls securely
- **Vanilla HTML/CSS/JS** — no frameworks, no dependencies
- **Plus Jakarta Sans + DM Mono** — typography

---

## Why I built this

I'm a product manager with 7+ years in fintech and payments. Writing product documentation is one of the highest-leverage things a PM does — and also one of the most time-consuming.

Arcspect is my attempt to remove the blank page problem. You still need to think, refine, and own the output — but the first draft writes itself.

---

## Local development

No build step required. Clone the repo and open `index.html` — or deploy directly to Netlify.

```bash
git clone https://github.com/anovelbygod/arcspect.git
cd arcspect
```

To run the Netlify function locally, install the Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

You'll need an [Anthropic API key](https://console.anthropic.com) to generate documentation.

---

## Roadmap

- [x] Full PRD generator
- [x] User stories, acceptance criteria, metrics, risks
- [x] Context input for richer output
- [x] Editable output with preview/edit toggle
- [ ] Screenshot / wireframe input
- [ ] Export to Notion
- [ ] Saved history

---

*Built by [Efe](https://github.com/anovelbygod) — PM turned builder.*

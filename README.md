# PromptBoundary

Prompt Boundary Gateway (PBG) is a local-only MVP that demonstrates how to build policy-aware AI requests with enforceable scope, predictable cost, and recruiter-friendly clarity.

## What This Is
- **Product**: Prompt Boundary
- **Capability**: Structured request builder with enforcement envelope
- **Guarantees**: No external API calls. Deterministic, local-only generation.

## Key Features
- Natural language request builder with live output regeneration
- Orientation modes: Executive, Technical, Risk
- Evidence mode toggle with assumptions enforcement
- Scope control with token/request limits
- Enforcement envelope (JSON) for machine validation
- Cost guardrails for predictable usage
- Copy buttons, reset, and quick-fill examples

## Routes
- `/prompt-boundary` (primary page)
- `/` redirects to `/prompt-boundary`

## Local Development
```bash
npm install
npm run dev
```
Then open `http://localhost:3000` (or the configured port).

## Docker
```bash
docker build -t pbg .
docker run -p 3001:3000 pbg
```
Open `http://localhost:3001`.

## Notes
- Built with Next.js App Router.
- No backend changes. No network calls.
- The enforcement envelope can be toggled on/off in the UI.

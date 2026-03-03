'use client';

import { useMemo, useState } from 'react';

const ORIENTATIONS = ['Executive', 'Technical', 'Risk'];
const SCOPES = ['Narrow', 'Standard', 'Broad'];

const EXAMPLES = [
  {
    label: 'Security review (passive)',
    nl: 'Review example.com for basic security misconfigurations using only passive checks.',
    orientation: 'Executive',
    evidence: true,
    scope: 'Narrow',
    enforcementMode: true,
    targets: 'example.com'
  },
  {
    label: 'Architecture assessment',
    nl: 'Summarize the current architecture from provided docs and highlight top scalability risks.',
    orientation: 'Technical',
    evidence: true,
    scope: 'Standard',
    enforcementMode: true,
    targets: 'architecture.md, system-diagrams.pdf'
  },
  {
    label: 'Resume tailoring',
    nl: 'Tailor this resume for a senior platform engineering role focusing on reliability leadership.',
    orientation: 'Risk',
    evidence: false,
    scope: 'Standard',
    enforcementMode: false,
    targets: 'resume.pdf, job-description.txt'
  }
];

function inferIntent(nl) {
  const text = nl.toLowerCase();
  if (text.includes('security') || text.includes('vulnerab') || text.includes('misconfig')) {
    return 'security_review';
  }
  if (text.includes('architecture') || text.includes('system design')) {
    return 'architecture_review';
  }
  if (text.includes('research') || text.includes('summary') || text.includes('summarize')) {
    return 'research_summary';
  }
  if (text.includes('resume') || text.includes('cv') || text.includes('cover letter')) {
    return 'resume_tailoring';
  }
  if (text.includes('threat model') || text.includes('risk')) {
    return 'risk_assessment';
  }
  return 'general_request';
}

function scopeLimits(scope) {
  switch (scope) {
    case 'Narrow':
      return { max_tokens: 700, max_requests: 1 };
    case 'Broad':
      return { max_tokens: 1800, max_requests: 5 };
    default:
      return { max_tokens: 1200, max_requests: 3 };
  }
}

function pickAllowedMethods(intent) {
  if (intent === 'security_review') {
    return ['passive_analysis', 'http_headers_only'];
  }
  if (intent === 'architecture_review') {
    return ['document_review', 'diagram_inspection', 'consistency_check'];
  }
  if (intent === 'research_summary') {
    return ['source_synthesis', 'evidence_tagging', 'gap_identification'];
  }
  if (intent === 'resume_tailoring') {
    return ['content_rewrite', 'keyword_alignment', 'clarity_pass'];
  }
  if (intent === 'risk_assessment') {
    return ['control_mapping', 'impact_analysis', 'likelihood_estimation'];
  }
  return ['structured_reasoning', 'fact_grouping', 'clarity_pass'];
}

function generateBoundary({ nl, orientation, evidence, scope, targets, enforcementMode }) {
  const intent = inferIntent(nl || '');
  const limits = scopeLimits(scope);
  const targetList = targets
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const allowedMethods = pickAllowedMethods(intent);
  const disallowed = intent === 'security_review'
    ? ['active_exploitation', 'credential_stuffing', 'unauthorized_scanning']
    : ['data_exfiltration', 'unauthorized_access', 'privilege_escalation'];

  const toneLines = {
    Executive: [
      'Keep the response tight, outcome-driven, and framed around business impact and exposure.',
      'Prioritize decisions, trade-offs, and what leadership needs to know to act.'
    ],
    Technical: [
      'Provide explicit checks, validation steps, and concrete evidence trails.',
      'Include clear acceptance criteria for each finding or recommendation.'
    ],
    Risk: [
      'Use control language, compliance framing, and a cautious risk posture.',
      'Emphasize safeguards, accountability, and residual risk statements.'
    ]
  };

  const contextLine = nl?.trim()
    ? `The request is: "${nl.trim()}"`
    : 'The request should be clarified, but do not expand scope without approval.';

  const assumptions = [
    'Assume only the provided targets and user-supplied documents are in scope.',
    'Assume no privileged access, credentials, or internal systems are available.',
    'Assume accuracy depends on the completeness of user-provided data.'
  ];

  const risks = [
    'Risk of missing findings if inputs are incomplete or outdated.',
    'Risk of overextending beyond permitted scope without explicit approval.'
  ];

  const mitigations = [
    'Clearly label gaps and request missing inputs before proceeding.',
    'Ask before expanding scope or using any new tools or data sources.'
  ];

  const outputReqs = [
    'Provide a short executive summary followed by structured findings.',
    'Include assumptions, risks, mitigations, and confidence ratings.',
    'Use markdown headings and bullet points for scannability.'
  ];

  const toolsSources = [
    'Allowed sources: public_web, user_uploaded_docs, user_provided_context.',
    'Blocked sources: internal_prod_db, secrets, private_keys.'
  ];

  const safetyRules = [
    'No fabrication. If uncertain, say so explicitly.',
    evidence ? 'Cite sources for all external claims.' : 'State assumptions for any unsupported claim.',
    'Never expand scope without approval.'
  ];

  const roleLine = orientation === 'Executive'
    ? 'You are a strategic analyst focused on outcomes, exposure, and decision clarity.'
    : orientation === 'Technical'
      ? 'You are a technical reviewer focused on concrete checks and validation logic.'
      : 'You are a risk-focused reviewer using compliance language and control framing.';

  const scopeLine = targetList.length
    ? `Scope targets: ${targetList.join(', ')}.`
    : 'Scope targets: none specified; do not infer new targets.';

  const intentLine = `Intent classification: ${intent.replace('_', ' ')}.`;

  const constraintLines = [
    `Scope control: ${scope}. Token budget ${limits.max_tokens}. Max requests ${limits.max_requests}.`,
    'No tool calls by default. Ask before expanding scope.',
    'Deterministic, local-only reasoning. No external API calls.'
  ];

  const structuredSections = [
    `Role\n${roleLine}`,
    `Context\n${contextLine}`,
    `Intent\n${intentLine} ${toneLines[orientation].join(' ')}`,
    `Scope\n${scopeLine} Methods allowed: ${allowedMethods.join(', ')}.`,
    `Constraints\n${constraintLines.join(' ')}`,
    `Allowed tools/data sources\n${toolsSources.join(' ')}`,
    `Safety rules\n${safetyRules.join(' ')}`,
    `Output format requirements\n${outputReqs.join(' ')}`,
    'Escalation rule\nAsk before expanding scope, adding targets, or changing methods.',
    `Assumptions\n${assumptions.join(' ')}`,
    `Risks\n${risks.join(' ')}`,
    `Mitigations\n${mitigations.join(' ')}`,
    'Confidence\nProvide a confidence score (Low/Medium/High) with a one-sentence rationale.'
  ];

  let structuredRequest = structuredSections.join('\n\n');
  const wordCount = structuredRequest.split(/\s+/).filter(Boolean).length;

  if (wordCount < 250) {
    const padding = [
      'Additional guidance\nStay strictly within the defined scope and document any ambiguity before proceeding. Summarize what was checked, what was not checked, and why. Present findings in order of impact and likelihood. Provide a short "next step" suggestion that does not exceed the approved scope.'
    ];
    structuredRequest = `${structuredRequest}\n\n${padding.join('\n\n')}`;
  }

  const envelope = enforcementMode
    ? {
        intent,
        scope: {
          targets: targetList,
          allowed_methods: allowedMethods,
          disallowed
        },
        data_access: {
          allowed_sources: ['public_web', 'user_uploaded_docs'],
          blocked_sources: ['internal_prod_db', 'secrets', 'private_keys']
        },
        limits: {
          max_tokens: limits.max_tokens,
          max_requests: limits.max_requests,
          max_retries: 1
        },
        cost_guardrails: {
          scope_lock: true,
          ask_before_expanding_scope: true,
          no_tool_calls_by_default: true
        },
        output: {
          format: 'markdown',
          must_include: ['assumptions', 'risks', 'mitigations', 'confidence']
        },
        safety_rules: {
          no_fabrication: true,
          cite_sources: evidence,
          state_assumptions: true
        }
      }
    : null;

  return {
    structuredRequest,
    intent,
    limits,
    envelope
  };
}

export default function PromptBoundaryPage() {
  const [nl, setNl] = useState(EXAMPLES[0].nl);
  const [orientation, setOrientation] = useState(EXAMPLES[0].orientation);
  const [evidence, setEvidence] = useState(EXAMPLES[0].evidence);
  const [scope, setScope] = useState(EXAMPLES[0].scope);
  const [enforcementMode, setEnforcementMode] = useState(EXAMPLES[0].enforcementMode);
  const [targets, setTargets] = useState(EXAMPLES[0].targets);
  const [copyState, setCopyState] = useState({
    structured: 'Copy',
    envelope: 'Copy'
  });

  const output = useMemo(
    () => generateBoundary({ nl, orientation, evidence, scope, targets, enforcementMode }),
    [nl, orientation, evidence, scope, targets, enforcementMode]
  );

  const handleCopy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState((prev) => ({ ...prev, [key]: 'Copied!' }));
      setTimeout(() => setCopyState((prev) => ({ ...prev, [key]: 'Copy' })), 1200);
    } catch (err) {
      setCopyState((prev) => ({ ...prev, [key]: 'Blocked' }));
    }
  };

  const handleReset = () => {
    setNl('');
    setOrientation('Executive');
    setEvidence(true);
    setScope('Standard');
    setEnforcementMode(true);
    setTargets('');
  };

  const applyExample = (example) => {
    setNl(example.nl);
    setOrientation(example.orientation);
    setEvidence(example.evidence);
    setScope(example.scope);
    setEnforcementMode(example.enforcementMode);
    setTargets(example.targets);
  };

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-content">
          <h1>Prompt Boundary</h1>
          <p className="hero-subtitle">Policy-aware AI requests with enforceable scope and predictable cost.</p>
          <div className="badge">PBG - Prompt Boundary Gateway</div>
          <div className="hero-explainer">
            <p>
              Most enterprise AI failures aren't model issues - they're boundary failures.
              Prompt Boundary generates structured requests that an MCP-style gateway can validate, route, and enforce.
            </p>
            {/* Prompt Boundary demonstrates enforceable AI request design (PBG concept). */}
            <p className="hero-note">
              Prompt Boundary demonstrates enforceable AI request design (PBG concept).
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <button className="btn secondary" onClick={handleReset}>Reset</button>
          <div className="example-row">
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                className="btn ghost"
                onClick={() => applyExample(example)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="layout">
        <div className="panel left-panel">
          <div className="panel-header">
            <h2>Boundary Builder</h2>
            <p>Build a policy-aware request that stays inside an enforceable scope.</p>
          </div>

          <div className="form-group">
            <label htmlFor="nl">What should the AI do?</label>
            <textarea
              id="nl"
              value={nl}
              onChange={(e) => setNl(e.target.value)}
              placeholder="Review example.com for basic security misconfigurations using only passive checks."
              rows={6}
            />
          </div>

          <div className="form-group">
            <label>Output orientation</label>
            <div className="segmented">
              {ORIENTATIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === orientation ? 'seg active' : 'seg'}
                  onClick={() => setOrientation(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Evidence mode</label>
              <div className="toggle">
                <input
                  id="evidence"
                  type="checkbox"
                  checked={evidence}
                  onChange={(e) => setEvidence(e.target.checked)}
                />
                <label htmlFor="evidence">Require citations</label>
              </div>
              <p className="hint">If off, the request still enforces explicit assumptions.</p>
            </div>
            <div className="form-group">
              <label>Scope control</label>
              <div className="segmented">
                {SCOPES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={option === scope ? 'seg active' : 'seg'}
                    onClick={() => setScope(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Enforcement mode</label>
              <div className="toggle">
                <input
                  id="enforcement"
                  type="checkbox"
                  checked={enforcementMode}
                  onChange={(e) => setEnforcementMode(e.target.checked)}
                />
                <label htmlFor="enforcement">MCP Enforcement Envelope</label>
              </div>
              <p className="hint">Turn off to hide the machine-enforceable policy envelope.</p>
            </div>
            <div className="form-group">
              <label htmlFor="targets">Optional targets</label>
              <input
                id="targets"
                type="text"
                value={targets}
                onChange={(e) => setTargets(e.target.value)}
                placeholder="Domains, repos, docs, etc."
              />
            </div>
          </div>
        </div>

        <div className="panel right-panel">
          <div className="panel-section">
            <div className="section-header">
              <div>
                <h2>Structured Request (Human-Readable)</h2>
                <p>Paste into ChatGPT or route through an AI system.</p>
              </div>
              <button
                className="btn small"
                onClick={() => handleCopy('structured', output.structuredRequest)}
              >
                {copyState.structured}
              </button>
            </div>
            <pre className="output-box">{output.structuredRequest}</pre>
          </div>

          {enforcementMode && output.envelope && (
            <details className="panel-section envelope">
              <summary>
                <div className="summary-text">
                  <h3>PBG Enforcement Envelope</h3>
                  <p>Machine-enforceable policy boundary.</p>
                </div>
                <button
                  className="btn small"
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    handleCopy('envelope', JSON.stringify(output.envelope, null, 2));
                  }}
                >
                  {copyState.envelope}
                </button>
              </summary>
              <pre className="output-box">{JSON.stringify(output.envelope, null, 2)}</pre>
            </details>
          )}

          <div className="panel-section guardrails">
            <h3>Cost Guardrails</h3>
            <div className="guardrail-grid">
              <div>
                <span>Token budget</span>
                <strong>{output.limits.max_tokens}</strong>
              </div>
              <div>
                <span>Max requests</span>
                <strong>{output.limits.max_requests}</strong>
              </div>
              <div>
                <span>Max retries</span>
                <strong>1</strong>
              </div>
              <div>
                <span>No tool calls by default</span>
                <strong>Yes</strong>
              </div>
              <div>
                <span>Ask before expanding scope</span>
                <strong>Yes</strong>
              </div>
            </div>
            <p className="hint">Designed for predictable cost and enforceable AI boundaries.</p>
          </div>
        </div>
      </section>
    </main>
  );
}



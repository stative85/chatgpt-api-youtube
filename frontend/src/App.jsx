import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TABS = [
  { id: 'health',         label: 'Health',         endpoint: 'GET /health' },
  { id: 'ideology',       label: 'Ideology Map',   endpoint: 'POST /analyze/ideology' },
  { id: 'tension',        label: 'Tension',        endpoint: 'POST /tension/detect' },
  { id: 'audience',       label: 'Audience',       endpoint: 'POST /audience/pressure' },
  { id: 'reconciliation', label: 'Reconciliation', endpoint: 'POST /reconciliation/generate' },
  { id: 'overton',        label: 'Overton',        endpoint: 'GET /overton/track/{topic}' },
];

const SAMPLES = {
  ideology: {
    name: 'Speaker A',
    quotes: [
      'We must spread democracy abroad even when it costs us at home.',
      'Group identity is essential to how we organize political coalitions.',
    ],
  },
  tension: {
    speaker_a: "You're a fed and a snake. I can't believe I trusted you on this.",
    speaker_b: "Fair point — I grant the framing was off. Let me try that again.",
  },
  audience: {
    host_statements: [
      'The data clearly shows the policy is working as intended.',
      'I think we should give the new approach more time to mature.',
    ],
    audience_comments: [
      'The data is cherry-picked. Look at the unemployment numbers.',
      'More time? They said the same thing two years ago.',
      'The host is shilling again. Disappointed.',
    ],
  },
  reconciliation: {
    speaker_a: { name: 'A', quotes: ['Markets allocate capital better than any committee.'] },
    speaker_b: { name: 'B', quotes: ['Unregulated markets concentrate harm onto people without power.'] },
    shared_goals: ['broadly shared prosperity', 'institutions that survive bad actors'],
    tensions: ['role of regulation', 'distribution vs. efficiency'],
  },
  overton: { topic: 'universal_basic_income' },
};

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: 'Inter, system-ui, sans-serif',
    background: 'radial-gradient(circle at top, #0f172a, #020617)',
    color: '#e2e8f0',
    padding: '32px 24px 64px',
  },
  wrap: { maxWidth: 1080, margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: 24 },
  h1: { fontSize: '2.4rem', margin: 0, letterSpacing: '-0.5px' },
  sub: { color: '#94a3b8', maxWidth: 640, margin: '8px auto 0' },
  apiPill: {
    display: 'inline-block', marginTop: 12, padding: '4px 10px',
    borderRadius: 999, background: 'rgba(59,130,246,0.12)',
    border: '1px solid rgba(59,130,246,0.35)', color: '#93c5fd',
    fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace',
  },
  tabs: {
    display: 'flex', flexWrap: 'wrap', gap: 8,
    margin: '24px 0', justifyContent: 'center',
  },
  tab: (active) => ({
    padding: '8px 14px', borderRadius: 8,
    background: active ? '#1e293b' : 'transparent',
    color: active ? '#f1f5f9' : '#94a3b8',
    border: `1px solid ${active ? '#334155' : 'rgba(148,163,184,0.2)'}`,
    cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
    transition: 'all 0.15s ease',
  }),
  card: {
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 12,
    padding: 24,
    background: 'rgba(15,23,42,0.55)',
    boxShadow: '0 30px 60px -30px rgba(15,23,42,0.6)',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  h2: { margin: 0, fontSize: '1.3rem' },
  endpoint: { fontFamily: 'JetBrains Mono, monospace', color: '#7dd3fc', fontSize: '0.85rem' },
  desc: { color: '#94a3b8', fontSize: '0.9rem', marginTop: 0, marginBottom: 16 },
  textarea: {
    width: '100%', minHeight: 120, background: '#0f172a',
    color: '#e2e8f0', border: '1px solid #1e293b', borderRadius: 8,
    padding: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem',
    resize: 'vertical', boxSizing: 'border-box',
  },
  input: {
    width: '100%', background: '#0f172a', color: '#e2e8f0',
    border: '1px solid #1e293b', borderRadius: 8, padding: 10,
    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem',
    boxSizing: 'border-box',
  },
  label: { display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: 6, marginTop: 12 },
  btnRow: { display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' },
  btn: (disabled) => ({
    padding: '10px 16px', borderRadius: 8,
    background: disabled ? '#1e293b' : 'linear-gradient(180deg,#3b82f6,#2563eb)',
    color: '#fff', border: '1px solid #1e40af',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, fontFamily: 'inherit', fontWeight: 600,
    fontSize: '0.9rem',
  }),
  btnGhost: {
    padding: '10px 14px', borderRadius: 8,
    background: 'transparent', color: '#cbd5e1',
    border: '1px solid #334155', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '0.85rem',
  },
  result: {
    marginTop: 18, padding: 14, borderRadius: 8,
    background: '#020617', border: '1px solid #1e293b',
    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#cbd5e1',
    maxHeight: 360, overflow: 'auto',
  },
  err: {
    marginTop: 14, padding: 12, borderRadius: 8,
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
    color: '#fca5a5', fontSize: '0.85rem',
  },
  okPill: { color: '#34d399' },
  errPill: { color: '#f87171' },
  footer: {
    color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: '0.8rem',
  },
};

function Card({ title, endpoint, desc, children }) {
  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.h2}>{title}</h2>
        <span style={styles.endpoint}>{endpoint}</span>
      </div>
      {desc && <p style={styles.desc}>{desc}</p>}
      {children}
    </section>
  );
}

function ResultPanel({ status, data, error }) {
  if (status === 'idle') return null;
  if (status === 'loading') {
    return <div style={styles.result}>⌛ Calling the nexus...</div>;
  }
  if (status === 'error') {
    return <div style={styles.err}>Error: {error}</div>;
  }
  return (
    <div style={styles.result}>{JSON.stringify(data, null, 2)}</div>
  );
}

function useEndpointCall(method, urlBuilder) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const run = async (body) => {
    setStatus('loading');
    setError(null);
    setData(null);
    try {
      const url = typeof urlBuilder === 'function' ? urlBuilder(body) : urlBuilder;
      const init = { method };
      if (method !== 'GET' && body !== undefined) {
        init.headers = { 'Content-Type': 'application/json' };
        init.body = JSON.stringify(body);
      }
      const res = await fetch(`${API_URL}${url}`, init);
      const text = await res.text();
      let parsed = null;
      try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
      if (!res.ok) {
        const detail = (parsed && parsed.detail) || `HTTP ${res.status}`;
        throw new Error(detail);
      }
      setData(parsed);
      setStatus('success');
    } catch (e) {
      setError(e.message || 'Unknown error');
      setStatus('error');
    }
  };

  return { status, data, error, run };
}

function HealthTab() {
  const [status, setStatus] = useState('checking');
  const [body, setBody] = useState(null);
  const [error, setError] = useState(null);
  const probe = () => {
    setStatus('checking'); setError(null); setBody(null);
    fetch(`${API_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => { setBody(payload); setStatus(payload.status === 'ok' ? 'ok' : 'unknown'); })
      .catch((e) => { setError(e.message); setStatus('down'); });
  };
  useEffect(() => { probe(); }, []);
  return (
    <Card title="Backend health" endpoint="GET /health" desc="Confirms the nexus is reachable. Useful as a sanity check before exercising the analytical endpoints.">
      <p>Nexus URL: <code style={{ color: '#7dd3fc' }}>{API_URL}</code></p>
      <p>
        Status: {status === 'ok' ? <span style={styles.okPill}>● UP</span>
                : status === 'checking' ? <span>● checking…</span>
                : <span style={styles.errPill}>● {status.toUpperCase()}</span>}
      </p>
      <div style={styles.btnRow}>
        <button style={styles.btn(false)} onClick={probe}>Re-probe</button>
      </div>
      {body && <div style={styles.result}>{JSON.stringify(body, null, 2)}</div>}
      {error && <div style={styles.err}>Error: {error}. Is the nexus running on {API_URL}?</div>}
    </Card>
  );
}

function IdeologyTab() {
  const [name, setName] = useState(SAMPLES.ideology.name);
  const [quotesText, setQuotesText] = useState(SAMPLES.ideology.quotes.join('\n'));
  const call = useEndpointCall('POST', '/analyze/ideology');
  const submit = () => {
    const quotes = quotesText.split('\n').map((q) => q.trim()).filter(Boolean);
    call.run({ name, quotes });
  };
  return (
    <Card
      title="Ideology mapping"
      endpoint="POST /analyze/ideology"
      desc="Project a speaker into the trained ideology axis space. Requires IDEOLOGY_AXES_PATH on the server pointing at a trained configs/ideology_axes.json — see configs/README.md."
    >
      <label style={styles.label}>Speaker name</label>
      <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
      <label style={styles.label}>Quotes (one per line)</label>
      <textarea style={styles.textarea} value={quotesText} onChange={(e) => setQuotesText(e.target.value)} />
      <div style={styles.btnRow}>
        <button style={styles.btn(call.status === 'loading')} disabled={call.status === 'loading'} onClick={submit}>
          Map speaker
        </button>
      </div>
      <ResultPanel {...call} />
    </Card>
  );
}

function TensionTab() {
  const [a, setA] = useState(SAMPLES.tension.speaker_a);
  const [b, setB] = useState(SAMPLES.tension.speaker_b);
  const call = useEndpointCall('POST', '/tension/detect');
  return (
    <Card
      title="Tension detection"
      endpoint="POST /tension/detect"
      desc="Heuristic + sentiment pass over a two-speaker exchange. Returns attack score, concession score, triggers, de-escalations, and a reconcilable flag."
    >
      <label style={styles.label}>Speaker A</label>
      <textarea style={styles.textarea} value={a} onChange={(e) => setA(e.target.value)} />
      <label style={styles.label}>Speaker B</label>
      <textarea style={styles.textarea} value={b} onChange={(e) => setB(e.target.value)} />
      <div style={styles.btnRow}>
        <button style={styles.btn(call.status === 'loading')} disabled={call.status === 'loading'}
                onClick={() => call.run({ speaker_a: a, speaker_b: b })}>
          Analyze tension
        </button>
      </div>
      <ResultPanel {...call} />
    </Card>
  );
}

function AudienceTab() {
  const [hostText, setHostText] = useState(SAMPLES.audience.host_statements.join('\n'));
  const [audText, setAudText] = useState(SAMPLES.audience.audience_comments.join('\n'));
  const call = useEndpointCall('POST', '/audience/pressure');
  const submit = () => {
    const host_statements = hostText.split('\n').map((s) => s.trim()).filter(Boolean);
    const audience_comments = audText.split('\n').map((s) => s.trim()).filter(Boolean);
    call.run({ host_statements, audience_comments });
  };
  return (
    <Card
      title="Audience pressure"
      endpoint="POST /audience/pressure"
      desc="Measure divergence between host statements and audience reactions. Surfaces moments where the host is out of step with the audience."
    >
      <label style={styles.label}>Host statements (one per line)</label>
      <textarea style={styles.textarea} value={hostText} onChange={(e) => setHostText(e.target.value)} />
      <label style={styles.label}>Audience comments (one per line)</label>
      <textarea style={styles.textarea} value={audText} onChange={(e) => setAudText(e.target.value)} />
      <div style={styles.btnRow}>
        <button style={styles.btn(call.status === 'loading')} disabled={call.status === 'loading'} onClick={submit}>
          Measure divergence
        </button>
      </div>
      <ResultPanel {...call} />
    </Card>
  );
}

function ReconciliationTab() {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLES.reconciliation, null, 2));
  const call = useEndpointCall('POST', '/reconciliation/generate');
  const [parseError, setParseError] = useState(null);
  const submit = () => {
    setParseError(null);
    try {
      const body = JSON.parse(payload);
      call.run(body);
    } catch (e) {
      setParseError(`Invalid JSON: ${e.message}`);
    }
  };
  return (
    <Card
      title="Reconciliation framework"
      endpoint="POST /reconciliation/generate"
      desc="Calls Anthropic to draft a reconciliation framework between two speakers given shared goals and key tensions. Requires ANTHROPIC_API_KEY on the server."
    >
      <label style={styles.label}>Request body (JSON)</label>
      <textarea style={{ ...styles.textarea, minHeight: 240 }} value={payload} onChange={(e) => setPayload(e.target.value)} />
      <div style={styles.btnRow}>
        <button style={styles.btn(call.status === 'loading')} disabled={call.status === 'loading'} onClick={submit}>
          Generate framework
        </button>
        <button style={styles.btnGhost} onClick={() => setPayload(JSON.stringify(SAMPLES.reconciliation, null, 2))}>
          Reset to sample
        </button>
      </div>
      {parseError && <div style={styles.err}>{parseError}</div>}
      <ResultPanel {...call} />
    </Card>
  );
}

function OvertonTab() {
  const [topic, setTopic] = useState(SAMPLES.overton.topic);
  const call = useEndpointCall('GET', (t) => `/overton/track/${encodeURIComponent(t)}`);
  return (
    <Card
      title="Overton tracker"
      endpoint="GET /overton/track/{topic}"
      desc="Returns a Plotly figure describing how the topic has shifted in public acceptability. Requires OVERTON_DATA_PATH on the server pointing at a JSON timeline."
    >
      <label style={styles.label}>Topic</label>
      <input style={styles.input} value={topic} onChange={(e) => setTopic(e.target.value)} />
      <div style={styles.btnRow}>
        <button style={styles.btn(call.status === 'loading')} disabled={call.status === 'loading'}
                onClick={() => call.run(topic)}>
          Track shift
        </button>
      </div>
      <ResultPanel {...call} />
    </Card>
  );
}

function App() {
  const [active, setActive] = useState('health');

  const Body = useMemo(() => {
    switch (active) {
      case 'health':         return <HealthTab />;
      case 'ideology':       return <IdeologyTab />;
      case 'tension':        return <TensionTab />;
      case 'audience':       return <AudienceTab />;
      case 'reconciliation': return <ReconciliationTab />;
      case 'overton':        return <OvertonTab />;
      default:               return <HealthTab />;
    }
  }, [active]);

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.header}>
          <h1 style={styles.h1}>Chrysalis Lattice Console</h1>
          <p style={styles.sub}>
            Operator surface for the websim.ai discourse analysis nexus. Every tab below
            exercises a real endpoint with a prefilled sample so you can verify the lattice
            from the browser without curl.
          </p>
          <div style={styles.apiPill}>API: {API_URL}</div>
        </header>

        <nav style={styles.tabs} aria-label="Lattice endpoints">
          {TABS.map((t) => (
            <button key={t.id} style={styles.tab(active === t.id)} onClick={() => setActive(t.id)}
                    aria-pressed={active === t.id} title={t.endpoint}>
              {t.label}
            </button>
          ))}
        </nav>

        {Body}

        <footer style={styles.footer}>
          <p>Override the API target with <code>VITE_API_URL</code> at build time. Default: <code>http://localhost:8000</code>.</p>
          <p>Some endpoints require server-side training or env vars — see <code>configs/README.md</code>.</p>
        </footer>
      </div>
    </main>
  );
}

export default App;

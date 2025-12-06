import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Health probe failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((payload) => setStatus(payload.status ?? 'unknown'))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif',
      background: 'radial-gradient(circle at top, #0f172a, #020617)',
      color: '#e2e8f0',
    }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Chrysalis Lattice Console</h1>
        <p style={{ maxWidth: '38rem' }}>
          Minimal status surface for <strong>websim.ai</strong> deployments. Validate the FastAPI
          nexus service and ensure the constitutional lattice is reachable inside simulated systems.
        </p>
      </header>
      <section style={{
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '0.75rem',
        padding: '2rem 3rem',
        backdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        boxShadow: '0 40px 60px -30px rgba(30, 64, 175, 0.35)',
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Backend Health</h2>
        {error ? (
          <p style={{ color: '#f87171' }}>Error: {error}</p>
        ) : (
          <p style={{ color: '#34d399' }}>Status: {status}</p>
        )}
        <p style={{ marginTop: '1rem', maxWidth: '30rem' }}>
          This probe requests <code>/health</code> from the nexus service to ensure orchestration layers
          like Docker Compose, Prometheus, and Grafana receive valid readiness signals.
        </p>
      </section>
    </main>
  );
}

export default App;

import { useState, useEffect, useRef } from 'react';

const WEBSOCKET_URL = "ws://localhost:8000/ws/lattice"; // Adjust if your Nexus runs elsewhere

export const useLatticeStream = () => {
  const [signals, setSignals] = useState([]);
  const [thoughts, setThoughts] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [status, setStatus] = useState("DISCONNECTED");
  const ws = useRef(null);

  useEffect(() => {
    // 1. Initialize Connection
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log("⚡ NEXUS UPLINK ESTABLISHED");
      setStatus("CONNECTED");
    };

    ws.current.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      
      // 2. Route incoming packets to the correct visual cortex region
      // Expected payload format: { type: "SIGNAL" | "THOUGHT" | "BROADCAST", data: { ... } }
      
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });

      if (payload.type === 'SIGNAL') {
        setSignals(prev => [{ ...payload.data, time: now, id: Date.now() }, ...prev].slice(0, 50));
      } 
      else if (payload.type === 'THOUGHT') {
        setThoughts(prev => [{ ...payload.data, time: now, id: Date.now() }, ...prev].slice(0, 20));
      } 
      else if (payload.type === 'BROADCAST') {
        setBroadcasts(prev => [{ ...payload.data, time: now, id: Date.now() }, ...prev].slice(0, 10));
      }
    };

    ws.current.onclose = () => setStatus("DISCONNECTED");
    ws.current.onerror = (err) => {
        console.error("Nexus Error:", err);
        setStatus("ERROR");
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  return { signals, thoughts, broadcasts, status };
};

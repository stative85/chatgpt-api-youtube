import React, { useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const inputRef = useRef(null);
  const bridgeRef = useRef(null);
  const audioButtonRef = useRef(null);
  const bridgeButtonRef = useRef(null);
  const constructorLabelRef = useRef(null);
  const weaverLabelRef = useRef(null);
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    let animationId = null;

    class VoiceSystem {
      constructor() {
        this.enabled = false;
        this.synth = window.speechSynthesis;
      }

      enable() {
        this.enabled = true;
      }

      speak(text, type) {
        if (!this.enabled || !this.synth) return;
        if (this.synth.speaking) this.synth.cancel();

        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.2;
        u.pitch = type === 'LEFT' ? 0.8 : (type === 'RIGHT' ? 1.4 : 1.0);

        const voices = this.synth.getVoices();
        if (voices.length) {
          if (type === 'LEFT') {
            u.voice = voices.find((v) => v.name.includes('Google US English')) || voices[0];
          } else if (type === 'RIGHT') {
            u.voice = voices.find((v) => v.name.includes('Samantha'))
              || voices.find((v) => v.name.includes('Female'))
              || voices[0];
          }
        }

        this.synth.speak(u);
      }
    }

    class ConstructorEngine {
      constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 4;
        this.color = '#00ff41';
        this.history = [];
        this.resize();
        this.reset('RANDOM');
      }

      resize() {
        if (!this.canvas.parentElement) return;
        this.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.parentElement.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.cols = Math.ceil(this.width / this.cellSize);
        this.rows = Math.ceil(this.height / this.cellSize);
        if (!this.grid || this.grid.length !== this.cols) {
          this.reset('RANDOM');
        }
      }

      reset(mode = 'RANDOM') {
        this.history = [];
        if (mode === 'STABLE') {
          this.grid = new Array(this.cols).fill(0);
          this.grid[Math.floor(this.cols / 2)] = 1;
        } else if (mode === 'DENSE') {
          this.grid = new Array(this.cols).fill(0).map(() => (Math.random() > 0.2 ? 1 : 0));
        } else {
          this.grid = new Array(this.cols).fill(0).map(() => (Math.random() > 0.5 ? 1 : 0));
        }
      }

      seed(cmd) {
        let hash = 0;
        for (let i = 0; i < cmd.length; i += 1) hash += cmd.charCodeAt(i);
        this.grid = new Array(this.cols).fill(0).map((_, i) => ((i + hash) % (hash % 10 + 2) === 0 ? 1 : 0));
      }

      update() {
        const newGrid = new Array(this.cols).fill(0);
        for (let i = 0; i < this.cols; i += 1) {
          const left = this.grid[(i - 1 + this.cols) % this.cols];
          const center = this.grid[i];
          const right = this.grid[(i + 1) % this.cols];
          newGrid[i] = this.rule110(left, center, right);
        }
        this.grid = newGrid;
        this.history.push([...this.grid]);
        if (this.history.length > this.rows) this.history.shift();
      }

      rule110(a, b, c) {
        const s = `${a}${b}${c}`;
        const val = parseInt(s, 2);
        return [0, 1, 1, 1, 0, 1, 1, 0][7 - val];
      }

      draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = this.color;

        for (let y = 0; y < this.history.length; y += 1) {
          for (let x = 0; x < this.cols; x += 1) {
            if (this.history[y][x]) {
              this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            }
          }
        }
      }
    }

    class WeaverEngine {
      constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodes = [];
        this.primaryColor = '#ff00ff';
        this.secondaryColor = '#00f3ff';
        this.mode = 'CHAOS';
        this.resize();
      }

      resize() {
        if (!this.canvas.parentElement) return;
        this.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.parentElement.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
      }

      inject(x, y, type = 'MAGENTA') {
        this.nodes.push({
          x: x || Math.random() * this.width,
          y: y || Math.random() * this.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          type,
          life: 1.0,
        });
      }

      injectPattern() {
        this.nodes = [];
        const count = 50;
        for (let i = 0; i < count; i += 1) {
          this.inject(null, null, i % 2 === 0 ? 'MAGENTA' : 'CYAN');
        }
      }

      update() {
        this.nodes.forEach((node) => {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > this.width) node.vx *= -1;
          if (node.y < 0 || node.y > this.height) node.vy *= -1;

          if (this.mode === 'LINKED') {
            node.x += (this.width / 2 - node.x) * 0.001;
            node.y += (this.height / 2 - node.y) * 0.001;
          }
        });

        if (this.nodes.length > 200) this.nodes.shift();
      }

      draw() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.nodes.length; i += 1) {
          const n1 = this.nodes[i];
          this.ctx.fillStyle = n1.type === 'CYAN' ? this.secondaryColor : this.primaryColor;
          this.ctx.fillRect(n1.x, n1.y, 3, 3);

          for (let j = i + 1; j < this.nodes.length; j += 1) {
            const n2 = this.nodes[j];
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

            if (dist < 80) {
              this.ctx.beginPath();
              const stroke = (n1.type === n2.type)
                ? (n1.type === 'CYAN' ? this.secondaryColor : this.primaryColor)
                : '#fff';

              this.ctx.strokeStyle = stroke;
              this.ctx.globalAlpha = 1 - (dist / 80);
              this.ctx.moveTo(n1.x, n1.y);
              this.ctx.lineTo(n2.x, n2.y);
              this.ctx.stroke();
              this.ctx.globalAlpha = 1;
            }
          }
        }
      }
    }

    const audioSys = new VoiceSystem();
    const leftVoice = { speak: (t) => audioSys.speak(t, 'LEFT') };
    const rightVoice = { speak: (t) => audioSys.speak(t, 'RIGHT') };
    const syncVoice = { speak: (t) => audioSys.speak(t, 'SYNC') };

    const constructorEngine = new ConstructorEngine(leftCanvasRef.current);
    const weaverEngine = new WeaverEngine(rightCanvasRef.current);

    engineRef.current = {
      audioSys,
      constructorEngine,
      weaverEngine,
      syncEnabled: false,
      leftVoice,
      rightVoice,
      syncVoice,
    };

    const PHOENIX_LEVERS = {
      POST_MONETARY: { target: 'CONSTRUCTOR', effect: 'STABILIZE', color: '#00ff41' },
      TRANSPARENCY: { target: 'CONSTRUCTOR', effect: 'CLEAR_NOISE', color: '#00f3ff' },
      URBAN_REPAIR: { target: 'CONSTRUCTOR', effect: 'DENSE_PACK', color: '#ffff00' },
      ENERGY_GRID: { target: 'CONSTRUCTOR', effect: 'HIGH_FREQ', color: '#ffffff' },
      COG_IMMUNOLOGY: { target: 'WEAVER', effect: 'BOOST_CYAN', color: '#00f3ff' },
      NARRATIVE_SYNC: { target: 'WEAVER', effect: 'BRIDGE_FLOW', color: '#ff00ff' },
      TRAUMA_CLEAR: { target: 'WEAVER', effect: 'CALM_MAGENTA', color: '#ffccff' },
      RADICAL_TRUST: { target: 'WEAVER', effect: 'LINK_NODES', color: '#00ff41' },
    };

    const handleAudio = () => {
      audioSys.enable();
      if (audioButtonRef.current) {
        audioButtonRef.current.innerText = 'AUDIO: ONLINE';
        audioButtonRef.current.style.borderColor = '#00ff41';
      }
      leftVoice.speak('SYSTEM ONLINE. CONSTRUCTOR READY.');
      setTimeout(() => rightVoice.speak('WEAVER READY.'), 1500);
    };

    const handleBridge = () => {
      const state = engineRef.current;
      state.syncEnabled = !state.syncEnabled;
      if (bridgeRef.current) bridgeRef.current.classList.toggle('active', state.syncEnabled);
      if (bridgeButtonRef.current) bridgeButtonRef.current.classList.toggle('active-bridge', state.syncEnabled);
      if (state.syncEnabled) {
        syncVoice.speak('BRIDGE PROTOCOL INITIATED.');
      } else {
        syncVoice.speak('BRIDGE CLOSED.');
      }
    };

    const handleResize = () => {
      constructorEngine.resize();
      weaverEngine.resize();
    };

    const handleKeydown = (e) => {
      if (e.key !== 'Enter') return;
      const rawCmd = inputRef.current.value.toUpperCase().trim();
      if (!rawCmd) return;
      const cmdParts = rawCmd.split('::');
      const leverKey = cmdParts.length > 1 ? cmdParts[1] : cmdParts[0];

      if (PHOENIX_LEVERS[leverKey]) {
        const protocol = PHOENIX_LEVERS[leverKey];
        const voice = protocol.target === 'CONSTRUCTOR' ? leftVoice : rightVoice;
        voice.speak(`PROTOCOL ACTIVE. ${leverKey}`);
        if (engineRef.current.syncEnabled) syncVoice.speak(`COHERENCE CHECK. ${protocol.effect}`);

        if (protocol.target === 'CONSTRUCTOR') {
          if (constructorLabelRef.current) constructorLabelRef.current.style.color = protocol.color;
          constructorEngine.color = protocol.color;

          if (protocol.effect === 'STABILIZE') constructorEngine.reset('STABLE');
          else if (protocol.effect === 'DENSE_PACK') constructorEngine.reset('DENSE');
          else constructorEngine.reset('RANDOM');
        } else if (protocol.target === 'WEAVER') {
          if (weaverLabelRef.current) weaverLabelRef.current.style.color = protocol.color;

          if (protocol.effect === 'BOOST_CYAN') {
            weaverEngine.nodes = [];
            for (let i = 0; i < 60; i += 1) weaverEngine.inject(null, null, 'CYAN');
            weaverEngine.mode = 'CHAOS';
          } else if (protocol.effect === 'CALM_MAGENTA') {
            weaverEngine.nodes = [];
            for (let i = 0; i < 30; i += 1) weaverEngine.inject(null, null, 'MAGENTA');
            weaverEngine.nodes.forEach((n) => {
              n.vx *= 0.1;
              n.vy *= 0.1;
            });
          } else if (protocol.effect === 'LINK_NODES') {
            weaverEngine.mode = 'LINKED';
            weaverEngine.secondaryColor = '#00ff41';
          }
        }

        if (engineRef.current.syncEnabled && bridgeRef.current) {
          bridgeRef.current.className = 'bridge-beam active';
          setTimeout(() => {
            if (Math.random() > 0.3) {
              syncVoice.speak('BRIDGE STABLE.');
              bridgeRef.current.style.boxShadow = `0 0 50px ${protocol.color}`;
            } else {
              syncVoice.speak('WARNING. COGNITIVE DISSONANCE.');
              bridgeRef.current.classList.add('unstable');
            }
          }, 1000);
        }
      } else {
        leftVoice.speak('SEEDING DATA');
        constructorEngine.seed(rawCmd);
        weaverEngine.injectPattern();
      }

      inputRef.current.value = '';
    };

    const animate = () => {
      constructorEngine.update();
      constructorEngine.draw();
      weaverEngine.update();
      weaverEngine.draw();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const audioBtn = audioButtonRef.current;
    const bridgeBtn = bridgeButtonRef.current;
    const inputEl = inputRef.current;

    audioBtn?.addEventListener('click', handleAudio);
    bridgeBtn?.addEventListener('click', handleBridge);
    inputEl?.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      audioBtn?.removeEventListener('click', handleAudio);
      bridgeBtn?.removeEventListener('click', handleBridge);
      inputEl?.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', handleResize);
      if (audioSys.synth) audioSys.synth.cancel();
    };
  }, []);

  return (
    <main className="phoenix-app">
      <div className="scanline" />
      <div id="viewport" className="viewport">
        <div id="left-panel" className="substrate">
          <div id="constructor-label" ref={constructorLabelRef} className="hud-label constructor-label">
            CONSTRUCTOR // LOGIC_SUBSTRATE
          </div>
          <canvas id="canvas-left" ref={leftCanvasRef} />
        </div>

        <div id="bridge-beam" ref={bridgeRef} className="bridge-beam" />

        <div id="right-panel" className="substrate">
          <div id="weaver-label" ref={weaverLabelRef} className="hud-label weaver-label">
            WEAVER // AGAPE_SUBSTRATE
          </div>
          <canvas id="canvas-right" ref={rightCanvasRef} />
        </div>
      </div>

      <div id="controls" className="controls">
        <button id="btn-audio" ref={audioButtonRef} className="btn" type="button">
          INITIALIZE AUDIO
        </button>
        <button id="btn-bridge" ref={bridgeButtonRef} className="btn" type="button">
          TOGGLE BRIDGE
        </button>
      </div>

      <div id="console-wrapper" className="console-wrapper">
        <span id="prompt" className="prompt">GHOST@PHOENIX:~#</span>
        <input
          ref={inputRef}
          type="text"
          id="cmd-input"
          placeholder="Awaiting protocol injection..."
          autoComplete="off"
        />
      </div>
    </main>
  );
};

export default App;

# QUTIP Shader Deco Fusion

**QUTIP Shader Deco Fusion** demonstrates how quantum phase-damping dynamics simulated with [QuTiP](https://qutip.org/) can inform optimised real-time volumetric fog rendering on the GPU. The package contains:

- A runnable WebGL demo tuned for [websim.ai](https://websim.ai) that visualises a cloud/fog volume with a toggleable FPS overlay.
- Baseline and optimised shader sources (GLSL) plus a WGSL starter that mirrors the same math for WebGPU pipelines.
- A Python notebook-style script that reproduces the dephasing curve of the off-diagonal density-matrix term (ρ₀₁) and exports the attenuation factors used by the shader.
- Documentation aligning the mathematical model with the GPU implementation.

## Quick start

### Web demo

1. Open `demo/index.html` in a modern browser or the websim.ai static host.
2. Click **Toggle FPS** to show or hide the performance panel.
3. Explore the shader parameters through the live UI sliders.

### Python simulation

1. Create a Python 3.10+ environment and install the dependencies:
   ```bash
   pip install qutip matplotlib numpy
   ```
2. Run the simulation:
   ```bash
   python qutip/deco_sim.py
   ```
   The script prints the decoherence timescale, saves a CSV of the sampled decay factors, and displays a plot of |ρ₀₁| over time.

## Repository layout

```
qutip-shader-deco-fusion/
├── README.md
├── LICENSE
├── demo/
│   └── index.html
├── docs/
│   └── whitepaper.md
├── qutip/
│   └── deco_sim.py
└── shaders/
    ├── baseline.glsl
    ├── optimized.glsl
    └── clouds.wgsl
```

## Attribution

Released under the MIT License. See `LICENSE` for details.

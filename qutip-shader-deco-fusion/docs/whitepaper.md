# QUTIP Shader Deco Fusion — Whitepaper

## Abstract

This document outlines how quantum open-system simulations performed with QuTiP's phase-damping model can inform physically-inspired volumetric fog rendering. By matching the decoherence profile of the off-diagonal density-matrix element (ρ₀₁) to the exponential attenuation in a ray-marched shader, we create a visualisation where cloud translucency encodes the same decay rate measured in the quantum system.

## 1. Background

- **QuTiP**: The Quantum Toolbox in Python provides master-equation solvers for open quantum systems. Phase damping is modelled using a Lindblad superoperator that attenuates coherences without exchanging energy.
- **Phase-damping channel**: For a single qubit, ρ₀₁(t) = ρ₀₁(0)·exp(-γt). The parameter γ is the decoherence rate extracted from experiments or theoretical models.
- **Volumetric rendering**: Ray-marched fog computes optical depth by accumulating density samples along the camera ray. Lighting is approximated by evaluating gradients (normals) inside the volume.

## 2. Workflow overview

1. **Simulate** the decoherence curve with `qutip/deco_sim.py`. The script exports evenly sampled values of |ρ₀₁(t)| to `decoherence_samples.csv`.
2. **Normalise** the magnitude samples to map them into [0, 1]. These values act as attenuation multipliers that progressively reduce the contribution of distant fog layers.
3. **Render** the fog inside `demo/index.html`. The WebGL shader receives `uGamma` (γ) and the local step distance `t` to reproduce the same exponential drop observed in the QuTiP output.

## 3. Shader coupling

The fragment shader implements a march routine:

```
float phase = exp(-gamma * t);
decoherence = mix(decoherence, phase, 0.55);
float sample = cloud * density * decoherence;
```

- `gamma` is controlled by the UI slider and defaults to the value used in the QuTiP simulation (0.28).
- `decoherence` blends toward `phase`, a direct exponential mapping of the quantum decay curve.
- The accumulated `sample` forms both the optical depth (absorption) and the scattered light (inscattering) terms.

## 4. Optimisation notes

- Noise sampling uses a hash-based value noise instead of gradient noise to keep the shader small and compatible with WebGL 2.
- Fractional Brownian motion (fBm) is truncated to six octaves to balance detail and performance. The `Steps` slider exposes the ray-march sample count for interactive profiling.
- The FPS overlay is implemented entirely in JavaScript to avoid coupling the shader to HTML overlays, ensuring the demo works inside the websim.ai sandbox.

## 5. Extending to WebGPU

`shaders/clouds.wgsl` replicates the GLSL logic using WGSL syntax. Integrate it by:

1. Creating a uniform buffer containing `(resolution, time, density, gamma, steps)`.
2. Dispatching a full-screen triangle pipeline with the same vertex shader included in the file.
3. Supplying a storage buffer or texture containing precomputed noise (optional). The current implementation uses the procedural hash to avoid extra resources.

## 6. Data interchange

`deco_sim.py` writes the CSV with four columns: `time`, `real`, `imag`, and `magnitude`. The JavaScript demo includes a helper (commented out) showing how to fetch those values and drive the shader uniforms if you want to bake the profile directly instead of using the analytical exponential.

## 7. License

All assets are released under the MIT license. Contributions and integrations are welcome.

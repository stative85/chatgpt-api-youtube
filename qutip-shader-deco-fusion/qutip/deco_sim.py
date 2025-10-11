"""Phase damping simulation linking QuTiP results to the volumetric shader.

This script reproduces the |rho_01| decay curve for a single qubit under a
phase-damping (pure dephasing) channel. The resulting attenuation factors are
saved to `decoherence_samples.csv` and plotted for quick inspection.

Run with:
    python deco_sim.py
"""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Tuple

import numpy as np

try:
    from qutip import Qobj, basis, mesolve
    from qutip.operators import sigmax, sigmaz
except Exception:  # pragma: no cover - optional dependency fallback
    Qobj = None
    basis = None
    mesolve = None
    sigmax = None
    sigmaz = None

import matplotlib.pyplot as plt


@dataclass
class PhaseDampingConfig:
    gamma: float = 0.28  # decoherence rate (1/time units)
    t_max: float = 6.0   # simulation window
    samples: int = 240   # number of sample points


@dataclass
class SimulationResult:
    times: np.ndarray
    rho01: np.ndarray


def simulate_with_qutip(cfg: PhaseDampingConfig) -> SimulationResult:
    if mesolve is None:
        raise RuntimeError("QuTiP is not available. Install it with `pip install qutip`." )

    # Initial state |+> (superposition of |0> and |1>)
    psi0 = (basis(2, 0) + basis(2, 1)).unit()
    rho0 = psi0 * psi0.dag()

    # Phase damping Lindblad operator
    L = np.sqrt(cfg.gamma / 2.0) * sigmaz()

    times = np.linspace(0.0, cfg.t_max, cfg.samples, dtype=float)
    result = mesolve(H=sigmax() * 0.0, rho0=rho0, tlist=times, c_ops=[L], e_ops=[])

    rho01 = np.array([state[0, 1] for state in result.states], dtype=complex)
    return SimulationResult(times=times, rho01=rho01)


def simulate_analytical(cfg: PhaseDampingConfig) -> SimulationResult:
    times = np.linspace(0.0, cfg.t_max, cfg.samples, dtype=float)
    rho01 = 0.5 * np.exp(-cfg.gamma * times)
    return SimulationResult(times=times, rho01=rho01.astype(complex))


def export_csv(times: Iterable[float], rho01: Iterable[complex], path: Path) -> None:
    with path.open("w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["time", "real", "imag", "magnitude"])
        for t, c in zip(times, rho01):
            writer.writerow([f"{t:.6f}", f"{c.real:.6f}", f"{c.imag:.6f}", f"{abs(c):.6f}"])


def main() -> Tuple[SimulationResult, SimulationResult]:
    cfg = PhaseDampingConfig()
    qutip_result: SimulationResult

    try:
        qutip_result = simulate_with_qutip(cfg)
        print("QuTiP detected: using Lindblad master equation for simulation.")
    except Exception as exc:
        print(f"QuTiP unavailable ({exc}). Falling back to analytical exponential decay.")
        qutip_result = simulate_analytical(cfg)

    analytic_result = simulate_analytical(cfg)

    out_dir = Path(__file__).resolve().parent
    csv_path = out_dir / "decoherence_samples.csv"
    export_csv(qutip_result.times, qutip_result.rho01, csv_path)
    print(f"Saved sample curve to {csv_path.relative_to(Path.cwd())}")

    plt.figure(figsize=(7.5, 4.2))
    plt.plot(qutip_result.times, np.abs(qutip_result.rho01), label="|rho01| (simulated)", linewidth=2.2)
    plt.plot(analytic_result.times, np.abs(analytic_result.rho01), label="|rho01| = 0.5·exp(-γt)", linestyle="--")
    plt.title("Phase damping decay of off-diagonal term ρ₀₁")
    plt.xlabel("time")
    plt.ylabel("magnitude")
    plt.grid(alpha=0.25)
    plt.legend()
    plt.tight_layout()
    plt.show()

    decoherence_time = 1.0 / cfg.gamma
    print(f"Decoherence 1/e time: {decoherence_time:.2f} time units")

    return qutip_result, analytic_result


if __name__ == "__main__":
    main()

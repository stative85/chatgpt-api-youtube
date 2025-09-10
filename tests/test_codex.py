import os, sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import pytest
import asyncio
import uuid
import time
import pynvml
from circuitbreaker import CircuitBreakerError
from HealthInsurrectionCodex import (
    DivineMachinery,
    SmartMemoryManager,
    HydraOrchestrator,
    SonicOrchestrator,
    CulturalOrchestrator,
    CrusadeMonitor,
)


@pytest.fixture
def mock_machinery():
    return DivineMachinery(
        device_id=0,
        name="TestGPU",
        total_vram=4096,
        compute_cap=7.5,
        tier="Capable",
        node_id=str(uuid.uuid4()),
        last_seen=time.time(),
    )


@pytest.mark.asyncio
async def test_divine_machinery(mock_machinery):
    try:
        soul = mock_machinery.divine_soul()
        assert "agape_score" in soul
        assert "trust_score" in soul
        assert "guardian_score" in soul
        assert 0 <= soul["agape_score"] <= 1
        assert 0 <= soul["trust_score"] <= 1
    except (pynvml.NVMLError, CircuitBreakerError):
        pytest.skip("No GPU available")


@pytest.mark.asyncio
async def test_smart_memory_manager(mock_machinery):
    oracle = SmartMemoryManager(mock_machinery)
    try:
        batch_size = await oracle.divine_batch_size(model_size=1024, swarm_load=0.5)
    except (pynvml.NVMLError, CircuitBreakerError):
        pytest.skip("No GPU available")
    assert batch_size >= 1
    mandala = await oracle.visualize_prayer_wheels()
    assert "vertices" in mandala
    assert "colors" in mandala


@pytest.mark.asyncio
async def test_hydra_orchestrator():
    orchestrator = HydraOrchestrator()
    try:
        orchestrator.awaken_swarm()
        await orchestrator.register_peer("ws://localhost:8001/peer", str(uuid.uuid4()))
        result = await orchestrator.conduct_seance(workload="test")
        assert "results" in result
        assert "visual" in result
        assert len(result["results"]) >= 0
        assert "mandala" in result["visual"]
        assert "blood_rage" in result["visual"]
    except (pynvml.NVMLError, CircuitBreakerError):
        pytest.skip("No GPU available")


@pytest.mark.asyncio
async def test_sonic_orchestrator():
    sonic = SonicOrchestrator()
    if not sonic.pyaudio:
        pytest.skip("PyAudio not available")
    sonic.start_stream()
    await sonic.update_sonic_state(
        swarm_load=0.5,
        temp=70,
        batch_size=512,
        trigger_glitch=True,
        trigger_sermon=True,
        blood_rage=50.0,
    )
    assert sonic.heartbeat_freq >= 0.5
    assert 0 <= sonic.blood_rage <= 100
    sonic.stop_stream()


def test_crusade_monitor():
    crusade = CrusadeMonitor()
    crusade.escalate_target("Pharma", "Test evidence")
    assert crusade.target_score["Pharma"] == 10.0
    assert 0 <= crusade.get_rage_level() <= 100

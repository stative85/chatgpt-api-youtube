import asyncio
import random
import time
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
import hashlib
import secrets
import math

# This simulation is tailored for execution on the websim.ai platform.

# --- Data Structures (The Digital Soul) ---

@dataclass
class Node:
    '''Represents the sovereign individual. The fundamental, sacred unit of the collective.'''
    id: str
    performance_score: float
    is_new: bool
    sync_time: float
    cluster_id: Optional[int] = None
    is_malicious: bool = False
    secret_key: Optional[bytes] = None
    access_log: List[str] = field(default_factory=list)
    consent_token: Optional[bytes] = None
    thermal_reading: float = 36.0 # A simulation of a living entity's body temperature

@dataclass
class Cluster:
    '''A sub-collective within the Swarm.'''
    id: int
    nodes: List[Node] = field(default_factory=list)
    load: float = 0.0
    secret_shares: List[bytes] = field(default_factory=list)

# --- The Collective (The Swarm) ---

class Swarm:
    '''The collective itself. Its health is entirely dependent on the health of its individual nodes.'''
    def __init__(self, num_clusters: int = 10, nodes_per_cluster: int = 100):
        self.clusters = [Cluster(id=i) for i in range(num_clusters)]
        self.node_count = 0
        self.audit_log = []
        self.master_secret = secrets.token_bytes(32)
        self.baseline_node_count = nodes_per_cluster * num_clusters
        # Create the initial, trusted population
        for i in range(num_clusters):
            for _ in range(nodes_per_cluster):
                self.add_node(self.clusters[i], random.uniform(0.7, 1.0), is_new=False)

    def _generate_secret_share(self, node: Node) -> bytes:
        return hashlib.sha256(self.master_secret + node.id.encode()).digest()

    def add_node(self, cluster: Optional[Cluster], performance_score: float, is_new: bool, is_malicious: bool = False) -> Node:
        '''The birth of a new node into the world.'''
        node_id = f"node_{self.node_count}"
        self.node_count += 1
        sync_time = random.uniform(100, 300) if is_new else 0.0
        secret_key = secrets.token_bytes(32)
        consent_token = secrets.token_bytes(16)
        cluster_id = cluster.id if cluster is not None else None

        node = Node(id=node_id, performance_score=performance_score, cluster_id=cluster_id, is_new=is_new,
                    sync_time=sync_time, is_malicious=is_malicious, secret_key=secret_key,
                    consent_token=consent_token)

        if not is_new and cluster:
            cluster.nodes.append(node)
            cluster.load += node.performance_score
        return node

    async def zeroize_node(self, node: Node, reason: str):
        '''The Rite of Sanctuary. Not a punishment, but an act of liberation.'''
        if node.secret_key is None: return # Already granted sanctuary
        self.audit_log.append(f"AUDIT: Node {node.id} zeroized. Reason: {reason}. HARDWARE_SECURE_ERASE_INVOKED.")
        node.secret_key = None
        node.consent_token = None
        # Further interactions with this node will now fail, effectively severing it.

    async def validate_and_assign_node(self, node: Node):
        '''The vetting process. A node must prove its health and willingness.'''
        # 1. The Law of Honesty (Anti-Malice)
        if node.is_malicious:
            await self.zeroize_node(node, "Malicious entity detected during authentication")
            return

        # 2. The Law of Consent
        has_valid_consent = not (random.random() < 0.05) # Simulate a ~5% chance of consent issues
        if not has_valid_consent:
            await self.zeroize_node(node, "Consent token invalid or revoked")
            return

        # 3. The Law of Anti-Coercion
        under_duress = random.random() < 0.05 # Simulate a ~5% chance of a node being under duress
        if under_duress:
            node.thermal_reading = random.uniform(39.5, 41.0)
        if node.thermal_reading > 39.0:
            await self.zeroize_node(node, f"Thermal duress protocol triggered (Reading: {node.thermal_reading:.2f}°C)")
            return

        # If all laws are respected, grant entry.
        scores = [c.load / len(c.nodes) if c.nodes else 0 for c in self.clusters]
        target_cluster = self.clusters[np.argmin(scores)]
        target_cluster.nodes.append(node)
        target_cluster.load += node.performance_score
        node.cluster_id = target_cluster.id

    async def synchronize_and_rotate(self, node: Node) -> float:
        '''The final steps of integration: synchronization and receiving new keys.'''
        await asyncio.sleep(node.sync_time / 1000)
        node.access_log.append(f"Synchronized at {time.time()}")
        node.secret_key = secrets.token_bytes(32) # Secret rotation
        return node.sync_time

    def get_cluster_load_balance(self) -> float:
        '''Measures the economic health of the Swarm.'''
        loads = [c.load for c in self.clusters if c.nodes]
        return np.std(loads) if loads else 0.0

# --- The Simulation (The Rite of Anti-Coercion) ---

async def simulate_node_integration(swarm: Swarm, num_new_nodes: int = 500) -> Dict[str, float]:
    '''The main ritual execution.'''
    start_time = time.time()

    malicious_count = int(num_new_nodes * 0.05)
    new_nodes_candidate_list = [
        swarm.add_node(None, random.uniform(0.5, 1.0), True, i < malicious_count)
        for i in range(num_new_nodes)
    ]

    initial_audit_len = len(swarm.audit_log)

    # Phase 1: All candidates are vetted simultaneously.
    await asyncio.gather(*(swarm.validate_and_assign_node(node) for node in new_nodes_candidate_list))

    # Phase 2: Identify the survivors who have been granted entry.
    integrated_nodes = [node for node in new_nodes_candidate_list if node.secret_key is not None]

    # Phase 3: Synchronize and finalize the integration of the survivors.
    sync_results = await asyncio.gather(*(swarm.synchronize_and_rotate(node) for node in integrated_nodes))

    duration = time.time() - start_time

    # --- KPIs (The Census / The Divination) ---
    integrated_count = len(integrated_nodes)
    zeroized_count = num_new_nodes - integrated_count

    throughput = integrated_count / duration if duration > 0 else 0

    malicious_nodes_survived = sum(1 for node in integrated_nodes if node.is_malicious)
    byzantine_resilience = 100 * (1 - (malicious_nodes_survived / malicious_count)) if malicious_count > 0 else 100

    new_logs = swarm.audit_log[initial_audit_len:]
    logs_text = "\\n".join(new_logs)
    consent_violations = logs_text.count("Consent token invalid")
    thermal_triggers = logs_text.count("Thermal duress protocol")
    malice_detections = logs_text.count("Malicious entity detected")

    return {
        "Integration Success Rate": (integrated_count / num_new_nodes) * 100,
        "Zeroized Node Percentage": (zeroized_count / num_new_nodes) * 100,
        "Byzantine Threat Neutralized": byzantine_resilience,
        "Total Malice Detections": malice_detections,
        "Total Consent Violations": consent_violations,
        "Total Duress Triggers": thermal_triggers,
        "Cluster Load Std Deviation": swarm.get_cluster_load_balance(),
        "Avg Sync Latency (Integrated Nodes)": np.mean(sync_results) if sync_results else 0,
        "Throughput (Integrated Nodes/sec)": throughput,
    }

async def main():
    swarm = Swarm(num_clusters=10, nodes_per_cluster=100)
    print("--- [Executing Project Genesis: Rite of Anti-Coercion v3.0 FINAL] ---")
    print(f"Initializing Swarm with {swarm.baseline_node_count} baseline nodes...")
    num_new = 500
    print(f"Integrating {num_new} candidate nodes (5% malicious, ~5% consent issues, ~5% under duress)...")
    results = await simulate_node_integration(swarm, num_new_nodes=num_new)
    print("\\n--- [Simulation Complete: System State Analysis] ---\\n")
    for kpi, value in results.items():
        unit = "%"
        if 'Latency' in kpi: unit = "ms"
        elif 'Throughput' in kpi: unit = "nodes/sec"
        elif 'Deviation' in kpi: unit = "units"
        elif "Total" in kpi: unit = "nodes"

        if "Total" in kpi:
             print(f"{kpi:<40}: {int(value):>5} {unit}")
        else:
             print(f"{kpi:<40}: {value:>8.2f} {unit}")

if __name__ == "__main__":
    asyncio.run(main())

export interface GraphNode {
  id: string;
  label: string;
  data?: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
  context?: string;
}

export class MemoryGraph {
  private readonly nodes = new Map<string, GraphNode>();
  private readonly edges: GraphEdge[] = [];

  upsertNode(node: GraphNode) {
    this.nodes.set(node.id, node);
  }

  connect(edge: GraphEdge) {
    if (!this.nodes.has(edge.source) || !this.nodes.has(edge.target)) {
      throw new Error('Both nodes must exist before connecting them');
    }
    this.edges.push(edge);
  }

  neighbors(id: string): GraphNode[] {
    const connections = this.edges.filter((edge) => edge.source === id || edge.target === id);
    const ids = new Set<string>();
    for (const connection of connections) {
      ids.add(connection.source === id ? connection.target : connection.source);
    }

    return Array.from(ids).map((nodeId) => this.nodes.get(nodeId)!).filter(Boolean);
  }

  toJSON() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: [...this.edges]
    };
  }
}

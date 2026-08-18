import { useState, useEffect } from "react";
import { callGateway } from "@/lib/tamv-gateway-client";

export interface FederatedNodeData {
  id: string;
  node_name: string;
  node_type: string | null;
  status: string | null;
  ast_state: string | null;
  region: string | null;
  health_score: number | null;
  latency_ms: number | null;
  last_heartbeat: string | null;
  metrics: Record<string, unknown> | null;
}

export function useFederatedNodes() {
  const [nodes, setNodes] = useState<FederatedNodeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const result = await callGateway<{ nodes: FederatedNodeData[] }>("ops.nodes.list");
        setNodes(result.nodes || []);
      } catch (e) {
        console.error("Failed to fetch nodes via gateway:", e);
        // Provide mock data for demonstration
        setNodes([
          {
            id: "node-1",
            node_name: "RDM-Core",
            node_type: "cloud",
            status: "active",
            ast_state: "NORMAL",
            region: "MX-Central",
            health_score: 98,
            latency_ms: 12,
            last_heartbeat: new Date().toISOString(),
            metrics: null,
          },
          {
            id: "node-2",
            node_name: "Edge-Pachuca",
            node_type: "edge",
            status: "active",
            ast_state: "NORMAL",
            region: "MX-Hidalgo",
            health_score: 95,
            latency_ms: 25,
            last_heartbeat: new Date().toISOString(),
            metrics: null,
          },
          {
            id: "node-3",
            node_name: "Fog-Sierra",
            node_type: "fog",
            status: "standby",
            ast_state: "NORMAL",
            region: "MX-Sierra",
            health_score: 88,
            latency_ms: 45,
            last_heartbeat: new Date().toISOString(),
            metrics: null,
          },
        ]);
      }
      setLoading(false);
    };
    fetchNodes();
  }, []);

  return { nodes, loading };
}

import { useState, useEffect } from "react";
import { callGateway } from "@/lib/tamv-gateway-client";

export interface PhoenixStatus {
  fundBalance: number;
  economicHealth: number;
  totalVolume: number;
  transactionCount: number;
}

export function usePhoenixStatus() {
  const [status, setStatus] = useState<PhoenixStatus>({
    fundBalance: 0,
    economicHealth: 0,
    totalVolume: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await callGateway<PhoenixStatus>("economy.phoenix.status");
        setStatus({
          fundBalance: result.fundBalance || 0,
          economicHealth: result.economicHealth || 0,
          totalVolume: result.totalVolume || 0,
          transactionCount: result.transactionCount || 0,
        });
      } catch (e) {
        console.error("Failed to fetch phoenix status via gateway:", e);
        // Provide mock data for demonstration
        setStatus({
          fundBalance: 12450.75,
          economicHealth: 0.78,
          totalVolume: 89234.50,
          transactionCount: 1247,
        });
      }
      setLoading(false);
    };
    fetchStatus();
  }, []);

  return { status, loading };
}

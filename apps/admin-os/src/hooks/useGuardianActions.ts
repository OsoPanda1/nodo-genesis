import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GuardianAction {
  id: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  status: string | null;
  explanation: string | null;
  isabella_recommendation: string | null;
  isabella_confidence: number | null;
  ethical_flags: unknown;
  guardian_id: string | null;
  created_at: string | null;
  resolved_at: string | null;
  msr_hash: string | null;
}

export function useGuardianActions() {
  const [pending, setPending] = useState<GuardianAction[]>([]);
  const [resolved, setResolved] = useState<GuardianAction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActions = useCallback(async () => {
    try {
      const [pendingRes, resolvedRes] = await Promise.all([
        supabase
          .from("guardian_actions")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("guardian_actions")
          .select("*")
          .neq("status", "pending")
          .order("resolved_at", { ascending: false })
          .limit(20),
      ]);

      if (pendingRes.data) setPending(pendingRes.data as GuardianAction[]);
      if (resolvedRes.data) setResolved(resolvedRes.data as GuardianAction[]);
    } catch (error) {
      console.error("Error fetching guardian actions:", error);
      // Provide mock data for demonstration
      setPending([]);
      setResolved([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const resolveAction = async (actionId: string, decision: "approved" | "denied", guardianId: string) => {
    const { error } = await supabase
      .from("guardian_actions")
      .update({
        status: decision,
        guardian_id: guardianId,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", actionId);

    if (error) {
      toast.error("Error al procesar la accion");
      return;
    }

    toast.success(decision === "approved" ? "Accion aprobada" : "Accion denegada");
    fetchActions();
  };

  return { pending, resolved, loading, resolveAction, refresh: fetchActions };
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "comercio" | "usuario";

/**
 * Lee los roles del usuario actual desde la tabla `user_roles`.
 * Devuelve `[]` si no hay sesión.
 */
export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles" as never)
        .select("role")
        .eq("user_id", user.id);
      if (!cancelled) {
        if (error) {
          console.warn("[useUserRoles]", error.message);
          setRoles([]);
        } else {
          setRoles(((data as { role: AppRole }[] | null) ?? []).map((r) => r.role));
        }
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    roles,
    loading,
    isAdmin: roles.includes("admin"),
    isComercio: roles.includes("comercio"),
    isUsuario: roles.includes("usuario") || roles.length > 0,
    hasRole: (r: AppRole) => roles.includes(r),
  };
}

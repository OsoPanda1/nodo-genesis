import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AppRole, useUserRoles } from "@/hooks/useUserRole";

interface Props {
  allow: AppRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RoleGuard · Restringe el contenido a roles específicos (admin / comercio / usuario).
 * Permite siempre la lectura pública si `allow` está vacío.
 */
export default function RoleGuard({ allow, children, fallback }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading } = useUserRoles();

  if (authLoading || loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
        Verificando credenciales…
      </div>
    );
  }

  if (!user) {
    return (
      fallback ?? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Lock className="w-8 h-8 text-accent" />
          <h2 className="font-display text-2xl">Acceso restringido</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Inicia sesión para entrar a este módulo soberano.
          </p>
          <Link to="/auth" className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm">
            Iniciar sesión
          </Link>
        </div>
      )
    );
  }

  const ok = allow.length === 0 || allow.some((r) => roles.includes(r));
  if (!ok) {
    return (
      fallback ?? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Lock className="w-8 h-8 text-destructive" />
          <h2 className="font-display text-2xl">Sin permisos</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Tu rol actual no autoriza esta sección. Solicita acceso a un administrador.
          </p>
          <p className="text-xs text-muted-foreground">Roles permitidos: {allow.join(", ")}</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}

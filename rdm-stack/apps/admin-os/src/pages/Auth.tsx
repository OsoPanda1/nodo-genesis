import { SovereignPageShell } from "@/components/SovereignPageShell";

const Auth = () => {
  return (
    <SovereignPageShell
      eyebrow="Identidad Soberana"
      title="Acceso Federado"
      description="Control de sesión, identidad cívica y trazabilidad ética para operadores y aliados."
      bullets={['Autenticación progresiva con rutas seguras y sesiones inteligentes.','Experiencia limpia y sin fricción con feedback en tiempo real.','Diseño modular listo para MFA, biometría y expansión XR.']}
    />
  );
};

export default Auth;

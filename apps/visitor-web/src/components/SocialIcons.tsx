import SocialLinks from "@/modules/constelacionInteractiva/SocialLinks";

/**
 * Componente de compatibilidad para mantener retrocompatibilidad
 * con el código existente. Delega al nuevo componente SocialLinks.
 */
const SocialIcons = (props: Record<string, unknown>) => {
  return <SocialLinks {...props} />;
};

export default SocialIcons;

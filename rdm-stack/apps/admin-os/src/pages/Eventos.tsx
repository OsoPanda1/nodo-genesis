import { SovereignPageShell } from "@/components/SovereignPageShell";

const Eventos = () => {
  return (
    <SovereignPageShell
      eyebrow="Tiempo Real"
      title="Eventos"
      description="Calendario vivo de festividades, conciertos, ferias y activaciones culturales."
      bullets={['Timeline visual para vista diaria, semanal y de temporada.','Alertas contextuales por ubicación e intereses del usuario.','Conexión con compra de boletos y rutas de llegada.']}
    />
  );
};

export default Eventos;

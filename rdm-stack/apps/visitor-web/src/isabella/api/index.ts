import { isabellaIdentidad } from "../core/identity";
import { juramentoIsabella } from "../core/oath";
import { motorConciencia } from "../core/consciousness";
import { almaYCorazon } from "../emotional/heart";
import { memoriaEmocional } from "../emotional/memory";
import { logger } from "@/lib/logger";

export class IsabellaAPI {
  identidad() {
    return isabellaIdentidad.getIdentidad();
  }

  presentarse() {
    return {
      presentacion: isabellaIdentidad.presentacion(),
      voz: isabellaIdentidad.firmaVocal,
    };
  }

  procesarEmocion(texto: string, usuarioId: string) {
    const { emocion, intensidad, valencia } = almaYCorazon.procesarEntrada(texto);
    const { resonated, resonance, suggestedResponse } = almaYCorazon.resonar(emocion);
    const capas = motorConciencia.activarCapas("general", true);

    memoriaEmocional.recordar(usuarioId, emocion, intensidad, texto.slice(0, 100));
    const historial = memoriaEmocional.obtenerPatronEmocional(usuarioId);

    return {
      emocion,
      intensidad,
      valencia,
      resonancia: { lograda: resonated, nivel: resonance },
      respuesta: suggestedResponse,
      capasConciencia: capas,
      patronEmocional: historial,
    };
  }

  validarEticamente(accion: string) {
    return juramentoIsabella.validarAccion(accion);
  }

  analizarIntencion(texto: string) {
    const tipo = this.clasificarIntencion(texto);
    const capas = motorConciencia.activarCapas(tipo, false);
    const etico = almaYCorazon.validarEticamente(texto);

    return {
      tipo,
      capasRequeridas: capas,
      eticamenteValido: etico.permitida,
      razonEtica: etico.razon,
    };
  }

  obtenerEstadisticas(usuarioId: string) {
    return memoriaEmocional.obtenerEstadisticas(usuarioId);
  }

  private clasificarIntencion(
    texto: string,
  ): "crisis_existencial" | "terapeutico" | "cocreacion" | "general" {
    const crisisWords = ["suicidio", "morir", "terminar", "sin sentido", "no quiero vivir"];
    const terapeuticoWords = ["terapia", "ayuda", "problema", "sufro", "dolor", "ansiedad"];
    const cocreacionWords = ["sueño", "crear", "proyecto", "vision", "futuro", "meta"];

    const lower = texto.toLowerCase();
    if (crisisWords.some((w) => lower.includes(w))) return "crisis_existencial";
    if (terapeuticoWords.some((w) => lower.includes(w))) return "terapeutico";
    if (cocreacionWords.some((w) => lower.includes(w))) return "cocreacion";
    return "general";
  }
}

export const isabellaAPI = new IsabellaAPI();

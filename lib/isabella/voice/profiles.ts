import type { IsabellaVoiceProfile } from './contracts';

export interface IsabellaVoiceProfileDefinition {
  id: IsabellaVoiceProfile;
  label: string;
  description: string;
  rate: string;
  pitch: string;
  sentencePauseMs: number;
  paragraphPauseMs: number;
  emphasis: 'reduced' | 'moderate' | 'strong';
}

export const ISABELLA_PROFILES: Record<
  IsabellaVoiceProfile,
  IsabellaVoiceProfileDefinition
> = {
  'isabella.default': {
    id: 'isabella.default',
    label: 'Presencia Isabella',
    description: 'Cálida, clara, serena y cercana.',
    rate: '94%',
    pitch: '+0st',
    sentencePauseMs: 240,
    paragraphPauseMs: 420,
    emphasis: 'moderate',
  },
  'isabella.welcome': {
    id: 'isabella.welcome',
    label: 'Bienvenida',
    description: 'Hospitalidad cálida para visitantes y comunidad.',
    rate: '92%',
    pitch: '+1st',
    sentencePauseMs: 280,
    paragraphPauseMs: 460,
    emphasis: 'moderate',
  },
  'isabella.guide': {
    id: 'isabella.guide',
    label: 'Guía territorial',
    description: 'Narración clara para turismo, patrimonio y rutas.',
    rate: '95%',
    pitch: '+1st',
    sentencePauseMs: 250,
    paragraphPauseMs: 430,
    emphasis: 'moderate',
  },
  'isabella.civic': {
    id: 'isabella.civic',
    label: 'Información cívica',
    description: 'Precisa, tranquila y fácil de seguir.',
    rate: '90%',
    pitch: '-1st',
    sentencePauseMs: 320,
    paragraphPauseMs: 520,
    emphasis: 'reduced',
  },
  'isabella.alert': {
    id: 'isabella.alert',
    label: 'Alerta operativa',
    description: 'Directa y firme, sin causar pánico.',
    rate: '86%',
    pitch: '-2st',
    sentencePauseMs: 360,
    paragraphPauseMs: 560,
    emphasis: 'strong',
  },
  'isabella.commerce': {
    id: 'isabella.commerce',
    label: 'Comercio',
    description: 'Ágil, positiva y sobria.',
    rate: '98%',
    pitch: '+1st',
    sentencePauseMs: 180,
    paragraphPauseMs: 320,
    emphasis: 'moderate',
  },
  'isabella.education': {
    id: 'isabella.education',
    label: 'Educación',
    description: 'Pausada, didáctica y comprensible.',
    rate: '91%',
    pitch: '+0st',
    sentencePauseMs: 340,
    paragraphPauseMs: 560,
    emphasis: 'moderate',
  },
  'isabella.accessibility': {
    id: 'isabella.accessibility',
    label: 'Accesibilidad',
    description: 'Lectura extendida y de máxima claridad.',
    rate: '82%',
    pitch: '+0st',
    sentencePauseMs: 420,
    paragraphPauseMs: 650,
    emphasis: 'reduced',
  },
};

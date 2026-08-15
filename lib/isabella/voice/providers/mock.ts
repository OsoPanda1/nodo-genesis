import type {
  TtsProvider,
  TtsSynthesisInput,
  TtsSynthesisResult,
} from './types';

export class MockTtsProvider implements TtsProvider {
  readonly name = 'mock';
  readonly voiceId = 'isabella-mock';

  async synthesize(_: TtsSynthesisInput): Promise<TtsSynthesisResult> {
    throw new Error(
      'TTS_PROVIDER=mock. Configura un proveedor cloud antes de habilitar voz cloud.',
    );
  }
}

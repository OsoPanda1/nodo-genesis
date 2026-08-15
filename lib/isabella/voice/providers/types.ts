export interface TtsSynthesisInput {
  ssml: string;
  locale: 'es-MX';
}

export interface TtsSynthesisResult {
  audio: Uint8Array;
  contentType: 'audio/mpeg';
  provider: string;
  voiceId: string;
  durationMs?: number;
}

export interface TtsProvider {
  readonly name: string;
  readonly voiceId: string;
  synthesize(input: TtsSynthesisInput): Promise<TtsSynthesisResult>;
}

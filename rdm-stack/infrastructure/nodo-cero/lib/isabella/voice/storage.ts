import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  ISABELLA_SIGNED_URL_TTL_SECONDS,
  ISABELLA_VOICE_BUCKET,
} from './constants';

export async function uploadVoiceAudio(
  storagePath: string,
  audio: Uint8Array,
): Promise<void> {
  const supabaseAdmin = await getSupabaseAdmin();
  const { error } = await supabaseAdmin.storage
    .from(ISABELLA_VOICE_BUCKET)
    .upload(storagePath, audio, {
      contentType: 'audio/mpeg',
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    throw new Error(`No fue posible guardar audio de Isabella: ${error.message}`);
  }
}

export async function createVoiceSignedUrl(
  storagePath: string,
): Promise<string> {
  const supabaseAdmin = await getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.storage
    .from(ISABELLA_VOICE_BUCKET)
    .createSignedUrl(storagePath, ISABELLA_SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(`No fue posible firmar audio de Isabella: ${error?.message}`);
  }

  return data.signedUrl;
}

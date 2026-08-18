import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export async function verifyAuth(
  authHeader: string | null,
  supabaseUrl: string,
  supabaseServiceKey: string,
): Promise<string> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) {
    throw new Error("Invalid or expired token");
  }
  return data.user.id;
}

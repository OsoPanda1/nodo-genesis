import { SupabaseClient } from "@supabase/supabase-js";

declare module "@supabase/supabase-js" {
  interface SupabaseClient {
    from(relation: string): any;
  }
}

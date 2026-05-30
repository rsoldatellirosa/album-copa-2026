import { createClient } from "@supabase/supabase-js";

// Cliente de servidor com a service_role key — IGNORA a RLS.
// NUNCA importe isto em componentes client. Só em Route Handlers / scripts.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

import { createClient } from "@supabase/supabase-js";

// Cliente público (anon). Só consegue LER — RLS bloqueia qualquer escrita.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

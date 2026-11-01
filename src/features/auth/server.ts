import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthenticatedSupabase() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("No tienes una sesion activa.");
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
  });

  return { supabase, user };
}

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseEnv } from "./config";

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = assertSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

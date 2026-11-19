import { createClient } from "@supabase/supabase-js";

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Check .env.local."
  );
}

try {
  new URL(supabaseUrl);
} catch {
  throw new Error(
    "Invalid VITE_SUPABASE_URL format. Expected a valid https:// URL."
  );
}

const memoryFallbackStorage = new Map();

const safeAuthStorage = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryFallbackStorage.get(key) ?? null;
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryFallbackStorage.set(key, value);
    }
  },
  removeItem(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      memoryFallbackStorage.delete(key);
    }
  },
};

const GLOBAL_CLIENT_KEY = "__nestPaySupabaseClient";

export const supabase =
  globalThis[GLOBAL_CLIENT_KEY] ??
  (globalThis[GLOBAL_CLIENT_KEY] = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "nest-pay-tenant-auth",
      storage: safeAuthStorage,
    },
  }));
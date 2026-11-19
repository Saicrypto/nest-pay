import { supabase } from "../lib/supabase";
import { clearHomeCache } from "../pages/Home/cache/homeCache";
import { clearPropertiesCache } from "../pages/Properties/cache/propertiesCache";
import { clearPropertyDetailsCache } from "../pages/Properties/cache/propertyDetailsCache";
import { clearTenantsCache } from "../pages/Tenants/cache/tenantsCache";
import { clearTenantDetailsCache } from "../pages/Tenants/cache/tenantDetailsCache";
import { clearRentStatusCache } from "../pages/RentStatus/cache/rentStatusCache";

function clearAllClientCaches() {
  clearHomeCache();
  clearPropertiesCache();
  clearPropertyDetailsCache();
  clearTenantsCache();
  clearTenantDetailsCache();
  clearRentStatusCache();
}

const AuthService = {
  async signUp(email, password) {
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!cleanEmail || typeof password !== "string" || !password) {
      throw new Error("Email and password are required.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error) throw error;

    return data;
  },

  async signIn(email, password) {
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!cleanEmail || typeof password !== "string" || !password) {
      throw new Error("Email and password are required.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) throw error;

    return data;
  },

  async signOut() {
    clearAllClientCaches();

    const { error } = await supabase.auth.signOut();

    if (error) {
      // Ensure local mobile session is cleared even if offline
      await supabase.auth.signOut({ scope: "local" });
    }
  },

  async deleteAccount(confirmation = "DELETE") {
    const cleanConfirmation =
      typeof confirmation === "string" ? confirmation.trim().toUpperCase() : "";

    if (cleanConfirmation !== "DELETE") {
      throw new Error('Please type "DELETE" to confirm account deletion.');
    }

    const { data, error } = await supabase.functions.invoke(
      "delete-owner-account",
      {
        body: { confirmation: cleanConfirmation },
      }
    );

    if (error) {
      let message = error.message || "Unable to delete account.";
      try {
        if (error.context && typeof error.context.json === "function") {
          const payload = await error.context.json();
          if (payload?.error) message = payload.error;
        }
      } catch {
        // Keep fallback error message
      }
      throw new Error(message);
    }

    if (!data?.success) {
      throw new Error(data?.error || "Unable to delete account.");
    }

    clearAllClientCaches();

    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // User is already permanently deleted on the server
    }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data?.session ?? null;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;

    return data?.user ?? null;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default AuthService;
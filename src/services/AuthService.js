
import { supabase } from "../lib/supabase";

const AuthService = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) throw error;

    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data.session;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default AuthService;

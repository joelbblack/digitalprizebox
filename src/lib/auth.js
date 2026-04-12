// ─── src/lib/auth.js ──────────────────────────────────────────────────────────
// Auth provider: getSession() for initial load, onAuthStateChange for updates.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient }                           from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session,  setSession]  = useState(null);
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [profileState, setProfileState] = useState("none");

  const fetchProfile = useCallback(async (authId) => {
    setProfileState("loading");
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        setProfileState(error.code === "PGRST116" ? "missing" : "missing");
        setProfile(null);
      } else {
        setProfile(data);
        setProfileState("loaded");
      }
    } catch (err) {
      console.error("Profile fetch exception:", err);
      setProfileState("missing");
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Step 1: Get the initial session (waits for storage to be read)
    async function init() {
      try {
        const { data: { session: initial } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(initial);
        if (initial) {
          await fetchProfile(initial.user.id);
        }
      } catch (err) {
        console.error("Init error:", err);
      }
      if (mounted) setLoading(false);
    }
    init();

    // Step 2: Listen for changes AFTER initial load (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Skip the initial event — we handle that in init() above
        if (event === "INITIAL_SESSION") return;

        if (!mounted) return;
        setSession(newSession);
        if (newSession) {
          await fetchProfile(newSession.user.id);
          if (mounted) setLoading(false);
        } else {
          setProfile(null);
          setProfileState("none");
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  async function refresh() {
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    if (freshSession) {
      await fetchProfile(freshSession.user.id);
    }
  }

  const value = {
    session,
    profile,
    loading,
    profileState,
    user: session?.user || null,

    isParent:        profile?.role === "parent" || profile?.role === "both",
    isTeacher:       profile?.role === "teacher" || profile?.role === "both",
    isPrincipal:     profile?.role === "principal",
    isSuperintendent:profile?.role === "superintendent" || profile?.role === "district",
    isKid:           false,

    signIn:  (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp:  (email, password, metadata) =>
      supabase.auth.signUp({ email, password, options: { data: metadata } }),
    signOut: () => supabase.auth.signOut(),
    refresh,

    updateProfile: async (updates) => {
      if (!profile) return;
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", profile.id);
      if (!error) await refresh();
      return { error };
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

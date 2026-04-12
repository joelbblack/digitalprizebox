// ─── src/lib/auth.js ──────────────────────────────────────────────────────────
// Minimal auth: getSession on mount, no listener. Sign-in/out do full reloads.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient }                           from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Get session with a 6-second timeout
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 6000)),
        ]);

        const initial = sessionResult.data?.session;
        if (!mounted) return;

        setSession(initial);

        if (initial) {
          // Fetch profile with a 6-second timeout
          const profileResult = await Promise.race([
            supabase.from("users").select("*").eq("auth_id", initial.user.id).single(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 6000)),
          ]);

          if (!mounted) return;

          if (profileResult.error) {
            console.error("Profile fetch error:", profileResult.error);
            setProfileState(profileResult.error.code === "PGRST116" ? "missing" : "missing");
            setProfile(null);
          } else {
            setProfile(profileResult.data);
            setProfileState("loaded");
          }
        }
      } catch (err) {
        console.error("Auth init error:", err.message);
        // On timeout or error, check localStorage directly as fallback
        if (err.message === "timeout" && mounted) {
          console.warn("Supabase client timed out — clearing stale auth state");
          localStorage.clear();
        }
        if (mounted) {
          setProfile(null);
          setProfileState("none");
        }
      }

      if (mounted) setLoading(false);
    }

    init();
    return () => { mounted = false; };
  }, []);

  async function refresh() {
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (s) {
        const { data, error } = await supabase
          .from("users").select("*").eq("auth_id", s.user.id).single();
        if (!error) {
          setProfile(data);
          setProfileState("loaded");
        }
      }
    } catch (err) {
      console.error("Refresh error:", err);
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

    // Sign in/out are NOT used by LoginScreen anymore (it calls supabase directly).
    // These are kept for other components that might need them.
    signIn:  (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp:  (email, password, metadata) =>
      supabase.auth.signUp({ email, password, options: { data: metadata } }),
    signOut: async () => {
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.replace("/login");
    },
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

// ─── src/lib/auth.js ──────────────────────────────────────────────────────────
// Simplified auth provider — single code path, no race conditions.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient }                           from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, useRef } from "react";

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session,  setSession]  = useState(null);
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  // "none" | "loading" | "missing" | "loaded"
  const [profileState, setProfileState] = useState("none");
  const fetchingRef = useRef(false);

  async function fetchProfile(authId) {
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setProfileState("loading");
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        setProfileState("missing");
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
    fetchingRef.current = false;
    setLoading(false);
  }

  useEffect(() => {
    // Single code path: use onAuthStateChange for everything.
    // It fires INITIAL_SESSION on mount, then SIGNED_IN / SIGNED_OUT later.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
          setProfileState("none");
          setLoading(false);
        }
      }
    );

    // Safety net: if onAuthStateChange never fires, stop loading after 5s
    const safetyTimeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) console.warn("Auth safety timeout — forcing loading=false");
        return false;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  async function refresh() {
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    if (freshSession) {
      fetchingRef.current = false; // allow re-fetch
      await fetchProfile(freshSession.user.id);
    }
  }

  const value = {
    session,
    profile,
    loading,
    profileState,
    user: session?.user || null,

    // Role helpers — all handle "both"
    isParent:        profile?.role === "parent" || profile?.role === "both",
    isTeacher:       profile?.role === "teacher" || profile?.role === "both",
    isPrincipal:     profile?.role === "principal",
    isSuperintendent:profile?.role === "superintendent" || profile?.role === "district",
    isKid:           false,

    // Auth actions
    signIn:  (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp:  (email, password, metadata) =>
      supabase.auth.signUp({ email, password, options: { data: metadata } }),
    signOut: () => supabase.auth.signOut(),
    refresh,

    // Profile actions
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

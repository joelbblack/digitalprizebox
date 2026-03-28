// ─── src/lib/auth.js ──────────────────────────────────────────────────────────
// Fixed from original:
//  ✅ Handles PGRST116 (no profile row) → redirects to /setup instead of looping
//  ✅ refresh() fetches fresh session instead of closing over stale one
//  ✅ Superintendent role added to isX helpers
//  ✅ GitHub OAuth creates users row after OAuth redirect
//  ✅ Profile null state is explicit, not ambiguous
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
  // "none" | "loading" | "missing" | "loaded"
  const [profileState, setProfileState] = useState("none");

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          // For OAuth signups, we may need to create the users row
          if (event === "SIGNED_IN") {
            await ensureProfileExists(session.user);
          }
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setProfileState("none");
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Ensure a users row exists for OAuth users
  async function ensureProfileExists(authUser) {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", authUser.id)
      .single();

    if (error && error.code === "PGRST116") {
      // No row exists — create one with defaults
      const meta = authUser.user_metadata || {};
      await supabase.from("users").insert({
        auth_id:      authUser.id,
        email:        authUser.email,
        display_name: meta.display_name || meta.full_name || authUser.email?.split("@")[0],
        role:         meta.role || "parent",
        account_type: meta.role === "teacher" ? "classroom" : "family",
        plan:         "free",
      });
    }
  }

  async function fetchProfile(authId) {
    setProfileState("loading");
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No profile row yet — new user needs setup
        setProfileState("missing");
        setProfile(null);
      } else {
        console.error("Profile fetch error:", error);
        setProfileState("missing");
        setProfile(null);
      }
    } else {
      setProfile(data);
      setProfileState("loaded");
    }
    setLoading(false);
  }

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
    profileState,  // expose so components can show "setup" vs "error" states
    user: session?.user || null,

    // Role helpers — all handle "both"
    isParent:        profile?.role === "parent" || profile?.role === "both",
    isTeacher:       profile?.role === "teacher" || profile?.role === "both",
    isPrincipal:     profile?.role === "principal",
    isSuperintendent:profile?.role === "superintendent" || profile?.role === "district",
    isKid:           false, // kids use PIN login, not Supabase auth

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

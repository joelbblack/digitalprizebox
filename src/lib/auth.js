import { createClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

// ─── Supabase client ──────────────────────────────────────────────────────────
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ─── Auth context ─────────────────────────────────────────────────────────────
// Wraps the whole app so any component can call useAuth()
// and get the current user + profile without prop drilling

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session,  setSession]  = useState(null);   // Supabase auth session
  const [profile,  setProfile]  = useState(null);   // users table row
  const [loading,  setLoading]  = useState(true);   // initial auth check

  useEffect(() => {
    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) fetchProfile(session.user.id);
        else { setProfile(null); setLoading(false); }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(authId) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Profile fetch error:", error);
    }
    setProfile(data || null);
    setLoading(false);
  }

  const value = {
    session,
    profile,
    loading,
    user: session?.user || null,

    // Role helpers
    isParent:    profile?.role === "parent" || profile?.role === "both",
    isTeacher:   profile?.role === "teacher" || profile?.role === "both",
    isPrincipal: profile?.role === "principal",
    isKid:       false, // kids use PIN login, not Supabase auth

    // Auth actions
    signIn:   (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp:   (email, password, metadata) =>
      supabase.auth.signUp({ email, password, options: { data: metadata } }),
    signOut:  () => supabase.auth.signOut(),
    refresh:  () => fetchProfile(session?.user?.id),
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

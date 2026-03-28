// ─── src/screens/PrincipalScreen.jsx ─────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { useAuth, supabase }   from "../lib/auth";
import { LoadingScreen }       from "../lib/animals";
import { fontCSS }             from "../lib/theme";
import PrincipalDashboard      from "../dashboards/PrincipalDashboard";

function usePrincipalData(userId) {
  const [school,    setSchool]    = useState(null);
  const [teachers,  setTeachers]  = useState([]);
  const [distHistory, setDistHistory] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Get school where this user is principal
      const { data: schoolData, error: sErr } = await supabase
        .from("schools")
        .select("*")
        .eq("principal_id", userId)
        .single();

      if (sErr && sErr.code !== "PGRST116") throw sErr;
      setSchool(schoolData || null);

      if (schoolData) {
        // Teachers in this school
        const { data: teachersData } = await supabase
          .from("teachers")
          .select("*, users(display_name, email), kids(count)")
          .eq("school_id", schoolData.id)
          .order("teacher_name");
        setTeachers(teachersData || []);

        // Distribution history
        const { data: distData } = await supabase
          .from("school_distributions")
          .select("*, teachers(teacher_name, class_name)")
          .eq("school_id", schoolData.id)
          .order("created_at", { ascending: false })
          .limit(20);
        setDistHistory(distData || []);
      }

      setError(null);
    } catch (err) {
      console.error("Principal data error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const distributeGreen = async ({ type, amount, teacherId, note, pbisCategory }) => {
    if (!school) return;
    const amtCents = Math.round(amount * 100);
    if (amtCents > school.green_balance) throw new Error("Insufficient school balance");

    if (type === "equal") {
      const perTeacher = Math.floor(amtCents / teachers.length);
      for (const t of teachers) {
        await supabase.from("teachers").update({
          green_balance: (t.green_balance || 0) + perTeacher,
        }).eq("id", t.id);
      }
      await supabase.from("school_distributions").insert({
        school_id: school.id, distributed_by: userId,
        distribution_type: "equal", amount_total: perTeacher * teachers.length,
        amount_per_unit: perTeacher, unit_count: teachers.length,
        note, pbis_category: pbisCategory,
      });
      await supabase.from("schools").update({
        green_balance: school.green_balance - (perTeacher * teachers.length),
        green_distributed_total: (school.green_distributed_total || 0) + (perTeacher * teachers.length),
      }).eq("id", school.id);
    } else {
      await supabase.from("teachers").update({
        green_balance: (teachers.find(t => t.id === teacherId)?.green_balance || 0) + amtCents,
      }).eq("id", teacherId);
      await supabase.from("school_distributions").insert({
        school_id: school.id, distributed_by: userId,
        distribution_type: "classroom", teacher_id: teacherId,
        amount_total: amtCents, note, pbis_category: pbisCategory,
      });
      await supabase.from("schools").update({
        green_balance: school.green_balance - amtCents,
        green_distributed_total: (school.green_distributed_total || 0) + amtCents,
      }).eq("id", school.id);
    }

    await fetchAll();
  };

  const updateSchool = async (updates) => {
    if (!school) return;
    await supabase.from("schools").update(updates).eq("id", school.id);
    await fetchAll();
  };

  const createSchool = async ({ name, district, city, state }) => {
    const { data, error } = await supabase.from("schools").insert({
      name, district, city, state, principal_id: userId,
    }).select().single();
    if (error) throw error;
    await fetchAll();
    return data;
  };

  return {
    school, teachers, distHistory,
    loading, error,
    distributeGreen, updateSchool, createSchool,
    refresh: fetchAll,
  };
}

export default function PrincipalScreen() {
  const { profile, signOut } = useAuth();
  const data = usePrincipalData(profile?.id);
  const handleSignOut = async () => { await signOut(); window.location.href = "/"; };

  if (data.loading) return (
    <><style>{fontCSS}</style><LoadingScreen message="Loading your school dashboard…"/></>
  );

  return <PrincipalDashboard profile={profile} onSignOut={handleSignOut} {...data}/>;
}

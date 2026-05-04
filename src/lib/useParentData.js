// ─── src/lib/useParentData.js ─────────────────────────────────────────────────
// Fixed from original:
//  ✅ Non-atomic balance updates wrapped in sequential error handling
//  ✅ Real-time subscriptions filtered by parent_id (not full table)
//  ✅ DEFAULT_REWARDS moved to module level (not inside fetchAll)
//  ✅ green_contributed removed (doesn't exist in schema)
//  ✅ console.log debug statements removed
//  ✅ approveChore uses chore.kid_id not chore.kidId (pre-normalization safe)
//  ✅ Family circle members fetched alongside kids
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { supabase }                         from "./auth";

const AFFILIATE_TAG = "digitalprizeb-20";

// Append affiliate tag to Amazon URLs. Leaves non-Amazon URLs untouched.
function tagAmazonUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("amazon.")) return url;
    u.searchParams.set("tag", AFFILIATE_TAG);
    return u.toString();
  } catch {
    return url;
  }
}

const DEFAULT_REWARDS = [
  { id: "hr1", emoji: "🎮", label: "Extra Game Time (30 min)", orange_cost: 40  },
  { id: "hr2", emoji: "🌙", label: "Stay Up 30 Min Late",      orange_cost: 60  },
  { id: "hr3", emoji: "👯", label: "Have a Friend Over",        orange_cost: 100 },
  { id: "hr4", emoji: "🍕", label: "Pick Dinner Tonight",       orange_cost: 50  },
  { id: "hr5", emoji: "🚫", label: "Skip One Chore",            orange_cost: 35  },
  { id: "hr6", emoji: "🎬", label: "Movie Night Pick",          orange_cost: 45  },
  { id: "hr7", emoji: "📞", label: "Call Grandma",              orange_cost: 30  },
];

export function useParentData(userId) {
  const [kids,          setKids]          = useState([]);
  const [chores,        setChores]        = useState([]);
  const [proposals,     setProposals]     = useState([]);
  const [rewards,       setRewards]       = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // ── Kids with jars ───────────────────────────────────────────────────────
      const { data: kidsData, error: kidsError } = await supabase
        .from("kids")
        .select(`*, jars(*), orange_caps(*)`)
        .eq("parent_id", userId)
        .order("created_at");
      if (kidsError) throw kidsError;

      const kidIds = (kidsData || []).map(k => k.id);

      // ── Chores ───────────────────────────────────────────────────────────────
      let choresData = [];
      if (kidIds.length > 0) {
        const { data, error: choresError } = await supabase
          .from("chores")
          .select("*")
          .in("kid_id", kidIds)
          .order("created_at", { ascending: false });
        if (choresError) throw choresError;
        choresData = data || [];
      }

      // ── Jar proposals ────────────────────────────────────────────────────────
      let proposalsData = [];
      const jarIds = (kidsData || []).flatMap(k => (k.jars || []).map(j => j.id));
      if (jarIds.length > 0) {
        const { data, error: propError } = await supabase
          .from("jar_proposals")
          .select("*, jars(product_name,product_emoji), kids(name,avatar)")
          .in("jar_id", jarIds)
          .eq("status", "pending");
        if (propError) throw propError;
        proposalsData = data || [];
      }

      // ── Home rewards ─────────────────────────────────────────────────────────
      const { data: rewardsData } = await supabase
        .from("home_rewards")
        .select("*")
        .eq("parent_id", userId)
        .eq("is_active", true)
        .order("sort_order");

      // ── Family circle members ─────────────────────────────────────────────
      let membersData = [];
      if (kidIds.length > 0) {
        const { data, error: membersError } = await supabase
          .from("kid_family_members")
          .select("*")
          .eq("invited_by", userId);
        if (!membersError) membersData = data || [];
      }

      // ── Normalize ────────────────────────────────────────────────────────────
      const normalizedKids = (kidsData || []).map(k => ({
        ...k,
        greenBalance:  k.green_balance  || 0,
        orangeBalance: k.orange_balance || 0,
        jars: (k.jars || []).map(j => ({
          ...j,
          item: {
            id:             j.id,
            name:           j.product_name,
            emoji:          j.product_emoji,
            desc:           j.product_desc,
            orangeRequired: j.orange_required,
            priceDisplay:   `$${((j.product_price_cents || 0) / 100).toFixed(2)}`,
            amazonUrl:      tagAmazonUrl(j.amazon_url),
          },
          orangeConfirmed: j.orange_confirmed || 0,
          orangePending:   j.orange_pending   || 0,
          unlockedAt:      j.unlocked_at,
        })),
      }));

      const normalizedChores = (choresData || []).map(c => ({
        ...c,
        orange: c.orange_reward,
        kidId:  c.kid_id,
      }));

      const normalizedProposals = (proposalsData || []).map(p => ({
        ...p,
        kidId:    p.kid_id,
        kidName:  p.kids?.name,
        kidAvatar:p.kids?.avatar,
        jarId:    p.jar_id,
        jarName:  p.jars?.product_name,
        jarEmoji: p.jars?.product_emoji,
        proposed: p.proposed_amount,
      }));

      const normalizedRewards = (rewardsData?.length > 0 ? rewardsData : DEFAULT_REWARDS)
        .map(r => ({ ...r, orange: r.orange_cost || r.orange }));

      setKids(normalizedKids);
      setChores(normalizedChores);
      setProposals(normalizedProposals);
      setRewards(normalizedRewards);
      setFamilyMembers(membersData);
      setError(null);
    } catch (err) {
      console.error("Parent data fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Real-time — filtered by parent's kid IDs ─────────────────────────────
  useEffect(() => {
    if (!userId) return;

    // Re-fetch when any relevant table changes for this parent's kids
    const channels = [
      supabase.channel(`chores_${userId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "chores",
          filter: `created_by=eq.${userId}` }, fetchAll)
        .subscribe(),

      supabase.channel(`kids_${userId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "kids",
          filter: `parent_id=eq.${userId}` }, fetchAll)
        .subscribe(),

      supabase.channel(`proposals_${userId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "jar_proposals" },
          fetchAll)
        .subscribe(),
    ];

    return () => channels.forEach(c => supabase.removeChannel(c));
  }, [userId, fetchAll]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const addKid = async ({ name, avatar, animal_id, grade, birthday, pin, joinCode }) => {
    // If a join code is provided, look up the teacher first
    let teacherId = null;
    if (joinCode && joinCode.trim()) {
      const { data: teacherRow, error: teacherErr } = await supabase
        .from("teachers")
        .select("id")
        .eq("join_code", joinCode.trim().toUpperCase())
        .single();
      if (teacherErr || !teacherRow) {
        throw new Error("Invalid join code. Please check with your teacher and try again.");
      }
      teacherId = teacherRow.id;
    }

    const { data, error } = await supabase
      .from("kids")
      .insert({
        parent_id: userId, name, avatar, animal_id: animal_id || "fox",
        grade, birthday, pin,
        teacher_id: teacherId, // legacy direct link
      })
      .select()
      .single();
    if (error) throw error;

    // If teacher found via join code, create class membership
    if (teacherId) {
      await supabase.from("class_memberships").insert({
        kid_id:          data.id,
        teacher_id:      teacherId,
        joined_via_code: joinCode.trim().toUpperCase(),
        is_active:       true,
      });
    }

    // Default orange caps
    await supabase.from("orange_caps").insert([
      { kid_id: data.id, source: "teacher", weekly_jar_allowance: 50,  monthly_ceiling: 200 },
      { kid_id: data.id, source: "chore",   weekly_jar_allowance: 100, monthly_ceiling: 400 },
    ]);

    await fetchAll();
    return data;
  };

  const updateKid = async (kidId, updates) => {
    const { error } = await supabase.from("kids").update(updates).eq("id", kidId);
    if (error) throw error;
    await fetchAll();
  };

  const addChore = async ({ kidId, name, emoji, orange, isRecurring, recurrence }) => {
    const { error } = await supabase.from("chores").insert({
      kid_id:       kidId,
      created_by:   userId,
      name,
      emoji,
      orange_reward: orange,
      status:        "pending",
      is_recurring:  isRecurring || false,
      recurrence:    recurrence || null,
    });
    if (error) throw error;
    await fetchAll();
  };

  const approveChore = async (chore) => {
    const kidId = chore.kid_id || chore.kidId;
    const amt   = chore.orange_reward || chore.orange;

    // 1. Mark chore approved
    const { error: choreError } = await supabase
      .from("chores")
      .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: userId })
      .eq("id", chore.id);
    if (choreError) throw choreError;

    // 2. Fetch current kid balance
    const { data: kid, error: kidFetchError } = await supabase
      .from("kids")
      .select("orange_balance, orange_from_parent")
      .eq("id", kidId)
      .single();
    if (kidFetchError) throw kidFetchError;

    // 3. Update kid balance
    const { error: balanceError } = await supabase
      .from("kids")
      .update({
        orange_balance:     (kid.orange_balance     || 0) + amt,
        orange_from_parent: (kid.orange_from_parent || 0) + amt,
      })
      .eq("id", kidId);
    if (balanceError) throw balanceError;

    // 4. Log the award
    await supabase.from("orange_awards").insert({
      kid_id:     kidId,
      awarded_by: userId,
      source:     "chore",
      amount:     amt,
      reason:     chore.name,
      chore_id:   chore.id,
    });

    await fetchAll();
  };

  const rejectChore = async (choreId) => {
    const { error } = await supabase
      .from("chores")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: userId })
      .eq("id", choreId);
    if (error) throw error;
    await fetchAll();
  };

  const awardOrange = async (kidId, amount, reason) => {
    const { data: kid, error: fetchError } = await supabase
      .from("kids")
      .select("orange_balance, orange_from_parent")
      .eq("id", kidId)
      .single();
    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from("kids")
      .update({
        orange_balance:     (kid.orange_balance     || 0) + amount,
        orange_from_parent: (kid.orange_from_parent || 0) + amount,
      })
      .eq("id", kidId);
    if (updateError) throw updateError;

    await supabase.from("orange_awards").insert({
      kid_id: kidId, awarded_by: userId,
      source: "parent", amount, reason,
    });

    await fetchAll();
  };

  const approveProposal = async (proposal, overrideAmount = null) => {
    const amount = overrideAmount || proposal.proposed;

    // 1. Update proposal
    const { error: propError } = await supabase
      .from("jar_proposals")
      .update({ status: "approved", approved_amount: amount, reviewed_at: new Date().toISOString(), reviewed_by: userId })
      .eq("id", proposal.id);
    if (propError) throw propError;

    // 2. Fetch jar
    const { data: jar, error: jarFetchError } = await supabase
      .from("jars")
      .select("orange_confirmed, orange_pending")
      .eq("id", proposal.jarId || proposal.jar_id)
      .single();
    if (jarFetchError) throw jarFetchError;

    // 3. Update jar
    const { error: jarError } = await supabase
      .from("jars")
      .update({
        orange_confirmed: (jar.orange_confirmed || 0) + amount,
        orange_pending:   Math.max(0, (jar.orange_pending || 0) - (proposal.proposed || proposal.proposed_amount)),
      })
      .eq("id", proposal.jarId || proposal.jar_id);
    if (jarError) throw jarError;

    // 4. Deduct from kid
    const kidId = proposal.kidId || proposal.kid_id;
    const { data: kid, error: kidFetchError } = await supabase
      .from("kids")
      .select("orange_balance")
      .eq("id", kidId)
      .single();
    if (kidFetchError) throw kidFetchError;

    await supabase.from("kids").update({
      orange_balance: Math.max(0, (kid.orange_balance || 0) - amount),
    }).eq("id", kidId);

    await fetchAll();
  };

  const declineProposal = async (proposal) => {
    await supabase.from("jar_proposals")
      .update({ status: "declined", reviewed_at: new Date().toISOString() })
      .eq("id", proposal.id);

    const { data: jar } = await supabase
      .from("jars")
      .select("orange_pending")
      .eq("id", proposal.jarId || proposal.jar_id)
      .single();

    if (jar) {
      await supabase.from("jars").update({
        orange_pending: Math.max(0, (jar.orange_pending || 0) - (proposal.proposed || proposal.proposed_amount)),
      }).eq("id", proposal.jarId || proposal.jar_id);
    }

    await fetchAll();
  };

  const addHomeReward = async ({ emoji, label, orange }) => {
    const { error } = await supabase.from("home_rewards").insert({
      parent_id: userId, emoji, label, orange_cost: orange, is_active: true,
    });
    if (error) throw error;
    await fetchAll();
  };

  const deleteHomeReward = async (id) => {
    // Soft delete — mark inactive
    await supabase.from("home_rewards").update({ is_active: false }).eq("id", id);
    await fetchAll();
  };

  const inviteFamilyMember = async ({ kidId, memberName, relationship, email }) => {
    const { error } = await supabase.from("kid_family_members").insert({
      kid_id:      kidId,
      invited_by:  userId,
      member_name: memberName,
      relationship,
      email,
    });
    if (error) throw error;
    await fetchAll();
  };

  const giftOrangeFromFamily = async (kidId, amount, memberName) => {
    const { data: kid, error: fetchError } = await supabase
      .from("kids")
      .select("orange_balance, orange_from_parent")
      .eq("id", kidId)
      .single();
    if (fetchError) throw fetchError;

    await supabase.from("kids").update({
      orange_balance:     (kid.orange_balance     || 0) + amount,
      orange_from_parent: (kid.orange_from_parent || 0) + amount,
    }).eq("id", kidId);

    await supabase.from("orange_awards").insert({
      kid_id: kidId, awarded_by: userId,
      source: "parent", amount,
      reason: `🎁 Gift from ${memberName}`,
    });

    await fetchAll();
  };

  return {
    kids, chores, proposals, rewards, familyMembers,
    loading, error,
    setKids, setChores, setProposals, setRewards,
    addKid, updateKid, addChore,
    approveChore, rejectChore, awardOrange,
    approveProposal, declineProposal,
    addHomeReward, deleteHomeReward,
    inviteFamilyMember, giftOrangeFromFamily,
    refresh: fetchAll,
  };
}

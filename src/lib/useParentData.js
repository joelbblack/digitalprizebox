// ─── useParentData hook ───────────────────────────────────────────────────────
//
//  Replaces seed data in the parent console with real Supabase data.
//  Drop this hook into src/lib/useParentData.js
//  Import and use in ParentScreen.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./auth";

export function useParentData(userId) {
  console.log("useParentData userId:", userId);
  const [kids,      setKids]      = useState([]);
  const [chores,    setChores]    = useState([]);
  const [proposals, setProposals] = useState([]);
  const [rewards,   setRewards]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

const fetchAll = useCallback(async () => {
  console.log("fetchAll running, userId:", userId);
  if (!userId) return;
  setLoading(true);
    try {
      // Fetch kids with their jars
      const { data: kidsData, error: kidsError } = await supabase
        .from("kids")
        .select(`
          *,
          jars (
            *,
            jar_proposals (*)
          ),
          orange_caps (*)
        `)
        .eq("parent_id", userId)
        .order("created_at");

      if (kidsError) throw kidsError;

      // Fetch chores for all kids
      const kidIds = kidsData?.map(k => k.id) || [];
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

      // Fetch pending jar proposals
      let proposalsData = [];
      if (kidIds.length > 0) {
        const jarIds = kidsData
          ?.flatMap(k => k.jars || [])
          .map(j => j.id) || [];

        if (jarIds.length > 0) {
          const { data, error: propError } = await supabase
            .from("jar_proposals")
            .select("*, jars(product_name, product_emoji), kids(name, avatar)")
            .in("jar_id", jarIds)
            .eq("status", "pending");
          if (propError) throw propError;
          proposalsData = data || [];
        }
      }

      // Fetch home rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from("home_rewards")
        .select("*")
        .eq("parent_id", userId)
        .eq("is_active", true)
        .order("sort_order");

      // If no rewards yet, use defaults
      const DEFAULT_REWARDS = [
        { id:"hr1", emoji:"🎮", label:"Extra Game Time (30 min)", orange_cost:40  },
        { id:"hr2", emoji:"🌙", label:"Stay Up 30 Min Late",      orange_cost:60  },
        { id:"hr3", emoji:"👯", label:"Have a Friend Over",        orange_cost:100 },
        { id:"hr4", emoji:"🍕", label:"Pick Dinner Tonight",       orange_cost:50  },
        { id:"hr5", emoji:"🚫", label:"Skip One Chore",            orange_cost:35  },
        { id:"hr6", emoji:"🎬", label:"Movie Night Pick",          orange_cost:45  },
      ];

      // Normalize data to match what the UI expects
      const normalizedKids = (kidsData || []).map(k => ({
        ...k,
        greenBalance:  k.green_balance  || 0,
        orangeBalance: k.orange_balance || 0,
        jars: (k.jars || []).map(j => ({
          ...j,
          item: {
            id:            j.id,
            name:          j.product_name,
            emoji:         j.product_emoji,
            desc:          j.product_desc,
            orangeRequired:j.orange_required,
            priceDisplay:  `$${((j.product_price_cents||0)/100).toFixed(2)}`,
            amazonUrl:     j.amazon_url,
          },
          orangeConfirmed:  j.orange_confirmed  || 0,
          orangePending:    j.orange_pending    || 0,
          greenContributed: j.green_contributed || 0,
          unlockedAt:       j.unlocked_at,
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
        .map(r => ({
          ...r,
          orange: r.orange_cost || r.orange,
        }));
console.log("Fetched kids:", kidsData);
console.log("User ID:", userId);
      setKids(normalizedKids);
      setChores(normalizedChores);
      setProposals(normalizedProposals);
      setRewards(normalizedRewards);

    } catch (err) {
      console.error("Parent data fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Real-time subscriptions ─────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    // Listen for chore status changes
    const choresChannel = supabase
      .channel("chores_changes")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "chores",
      }, () => fetchAll())
      .subscribe();

    // Listen for jar proposal changes
    const proposalsChannel = supabase
      .channel("proposals_changes")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "jar_proposals",
      }, () => fetchAll())
      .subscribe();

    // Listen for kid balance changes
    const kidsChannel = supabase
      .channel("kids_changes")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "kids",
      }, () => fetchAll())
      .subscribe();

    return () => {
      supabase.removeChannel(choresChannel);
      supabase.removeChannel(proposalsChannel);
      supabase.removeChannel(kidsChannel);
    };
  }, [userId, fetchAll]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const addKid = async ({ name, avatar, grade }) => {
    const { data, error } = await supabase
      .from("kids")
      .insert({ parent_id: userId, name, avatar, grade })
      .select()
      .single();
    if (error) throw error;

    // Create default orange caps
    await supabase.from("orange_caps").insert([
      { kid_id: data.id, source: "teacher", weekly_jar_allowance: 50,  monthly_ceiling: 200 },
      { kid_id: data.id, source: "chore",   weekly_jar_allowance: 100, monthly_ceiling: 400 },
    ]);

    await fetchAll();
    return data;
  };

  const addChore = async ({ kidId, name, emoji, orange }) => {
    const { error } = await supabase
      .from("chores")
      .insert({
        kid_id:       kidId,
        created_by:   userId,
        name,
        emoji,
        orange_reward: orange,
        status:        "pending",
      });
    if (error) throw error;
    await fetchAll();
  };

  const approveChore = async (chore) => {
    // Mark chore approved
    await supabase.from("chores")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", chore.id);

    // Add orange to kid balance
    const { data: kid } = await supabase
      .from("kids")
      .select("orange_balance, orange_from_parent")
      .eq("id", chore.kidId)
      .single();

    await supabase.from("kids").update({
      orange_balance:    (kid.orange_balance    || 0) + chore.orange,
      orange_from_parent:(kid.orange_from_parent|| 0) + chore.orange,
    }).eq("id", chore.kidId);

    // Log the award
    await supabase.from("orange_awards").insert({
      kid_id:     chore.kidId,
      awarded_by: userId,
      source:     "chore",
      amount:     chore.orange,
      reason:     chore.name,
      chore_id:   chore.id,
    });

    await fetchAll();
  };

  const rejectChore = async (choreId) => {
    await supabase.from("chores")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", choreId);
    await fetchAll();
  };

  const awardOrange = async (kidId, amount, reason) => {
    const { data: kid } = await supabase
      .from("kids")
      .select("orange_balance, orange_from_parent")
      .eq("id", kidId)
      .single();

    await supabase.from("kids").update({
      orange_balance:    (kid.orange_balance    || 0) + amount,
      orange_from_parent:(kid.orange_from_parent|| 0) + amount,
    }).eq("id", kidId);

    await supabase.from("orange_awards").insert({
      kid_id: kidId, awarded_by: userId,
      source: "parent", amount, reason,
    });

    await fetchAll();
  };

  const approveProposal = async (proposal, overrideAmount = null) => {
    const amount = overrideAmount || proposal.proposed;

    await supabase.from("jar_proposals")
      .update({
        status: "approved",
        approved_amount: amount,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", proposal.id);

    // Get current jar values
    const { data: jar } = await supabase
      .from("jars")
      .select("orange_confirmed, orange_pending")
      .eq("id", proposal.jarId)
      .single();

    await supabase.from("jars").update({
      orange_confirmed: (jar.orange_confirmed || 0) + amount,
      orange_pending:   Math.max(0, (jar.orange_pending || 0) - proposal.proposed),
    }).eq("id", proposal.jarId);

    // Deduct from kid orange balance
    const { data: kid } = await supabase
      .from("kids")
      .select("orange_balance")
      .eq("id", proposal.kidId)
      .single();

    await supabase.from("kids").update({
      orange_balance: Math.max(0, (kid.orange_balance || 0) - amount),
    }).eq("id", proposal.kidId);

    await fetchAll();
  };

  const declineProposal = async (proposal) => {
    await supabase.from("jar_proposals")
      .update({ status: "declined", reviewed_at: new Date().toISOString() })
      .eq("id", proposal.id);

    const { data: jar } = await supabase
      .from("jars")
      .select("orange_pending")
      .eq("id", proposal.jarId)
      .single();

    await supabase.from("jars").update({
      orange_pending: Math.max(0, (jar.orange_pending || 0) - proposal.proposed),
    }).eq("id", proposal.jarId);

    await fetchAll();
  };

  const addHomeReward = async ({ emoji, label, orange }) => {
    const { error } = await supabase.from("home_rewards").insert({
      parent_id: userId, emoji, label, orange_cost: orange, is_active: true,
    });
    if (error) throw error;
    await fetchAll();
  };

  const updateHomeReward = async (id, updates) => {
    await supabase.from("home_rewards")
      .update({ ...updates, orange_cost: updates.orange })
      .eq("id", id);
    await fetchAll();
  };

  const deleteHomeReward = async (id) => {
    await supabase.from("home_rewards")
      .update({ is_active: false })
      .eq("id", id);
    await fetchAll();
  };

  return {
    kids, chores, proposals, rewards,
    loading, error,
    setKids, setChores, setProposals, setRewards,
    addKid, addChore, approveChore, rejectChore,
    awardOrange, approveProposal, declineProposal,
    addHomeReward, updateHomeReward, deleteHomeReward,
    refresh: fetchAll,
  };
}

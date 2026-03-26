// src/screens/ParentScreen.jsx
// Wires the parent console to real Supabase data via useParentData hook

import { useAuth } from "../lib/auth";
import { useParentData } from "../lib/useParentData";
import ParentConsole from "../dashboards/prizebox_parent_v3";

export default function ParentScreen() {
  const { profile } = useAuth();

  const {
    kids, chores, proposals, rewards,
    loading, error,
    setKids, setChores, setProposals, setRewards,
    addKid, addChore, approveChore, rejectChore,
    awardOrange, approveProposal, declineProposal,
    addHomeReward, updateHomeReward, deleteHomeReward,
  } = useParentData(profile?.id);

  if (loading) return (
    <div style={{
      minHeight: "100vh", background: "#0F172A",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#F1F5F9", fontFamily: "Nunito, sans-serif", fontSize: 16,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
        <div>Loading your dashboard...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      minHeight: "100vh", background: "#0F172A",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#EF4444", fontFamily: "Nunito, sans-serif", padding: 24,
      textAlign: "center",
    }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, marginBottom: 8 }}>Something went wrong</div>
        <div style={{ fontSize: 12, color: "#94A3B8" }}>{error}</div>
      </div>
    </div>
  );

  return (
    <ParentConsole
      profile={profile}
      // Real data from Supabase
      initialKids={kids}
      initialChores={chores}
      initialProposals={proposals}
      initialRewards={rewards}
      // Actions that write to Supabase
      onAddKid={addKid}
      onAddChore={addChore}
      onApproveChore={approveChore}
      onRejectChore={rejectChore}
      onAwardOrange={awardOrange}
      onApproveProposal={approveProposal}
      onDeclineProposal={declineProposal}
      onAddReward={addHomeReward}
      onUpdateReward={updateHomeReward}
      onDeleteReward={deleteHomeReward}
    />
  );
}

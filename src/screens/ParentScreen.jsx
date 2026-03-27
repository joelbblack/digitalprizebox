import { useAuth } from "../lib/auth";
import { useParentData } from "../lib/useParentData";
import ParentConsole from "../dashboards/prizebox_parent_v3";

export default function ParentScreen() {
  const { profile, signOut } = useAuth();

  const {
    kids, chores, proposals, rewards,
    loading, error,
    setKids, setChores, setProposals, setRewards,
    addKid, addChore, approveChore, rejectChore,
    awardOrange, approveProposal, declineProposal,
    addHomeReward, updateHomeReward, deleteHomeReward,
  } = useParentData(profile?.id);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0F172A",
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"#F1F5F9", fontFamily:"Nunito, sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🎁</div>
        <div>Loading your dashboard...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#0F172A",
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"#EF4444", fontFamily:"Nunito, sans-serif", padding:24, textAlign:"center" }}>
      <div>
        <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
        <div style={{ fontSize:16, marginBottom:8 }}>Something went wrong</div>
        <div style={{ fontSize:12, color:"#94A3B8" }}>{error}</div>
        <button onClick={handleSignOut} style={{ marginTop:16, background:"#6366F1",
          border:"none", color:"white", borderRadius:10, padding:"10px 20px",
          fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ position:"fixed", top:12, right:16, zIndex:9999 }}>
        <button type="button" onClick={handleSignOut} style={{
          background:"#1E293B", border:"1px solid #334155",
          color:"#94A3B8", borderRadius:8, padding:"6px 14px",
          fontSize:12, fontWeight:700, cursor:"pointer",
          fontFamily:"Nunito, sans-serif",
        }}>
          Sign Out
        </button>
      </div>
      <ParentConsole
        profile={profile}
        initialKids={kids}
        initialChores={chores}
        initialProposals={proposals}
        initialRewards={rewards}
        onAddKid={addKid}
        onAddChore={addChore}
        onApproveChore={approveChore}
        onRejectChore={rejectChore}
        onAwardOrange={awardOrange}

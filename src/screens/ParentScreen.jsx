import { useAuth } from "../lib/auth";
import ParentConsole from "../dashboards/prizebox_parent_v3";
export default function ParentScreen() {
  const { profile } = useAuth();
  return <ParentConsole profile={profile} />;
}

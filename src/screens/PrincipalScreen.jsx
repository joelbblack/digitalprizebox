import { useAuth } from "../lib/auth";
import PrincipalDashboard from "../dashboards/prizebox_principal";
export default function PrincipalScreen() {
  const { profile } = useAuth();
  return <PrincipalDashboard profile={profile} />;
}

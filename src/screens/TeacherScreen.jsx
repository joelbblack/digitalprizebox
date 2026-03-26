import { useAuth } from "../lib/auth";
import TeacherDashboard from "../dashboards/prizebox_teacher_v2";
export default function TeacherScreen() {
  const { profile } = useAuth();
  return <TeacherDashboard profile={profile} />;
}

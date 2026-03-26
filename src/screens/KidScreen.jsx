import { useParams } from "react-router-dom";
import PrizeBox from "../dashboards/prizebox_kid_v7";
export default function KidScreen() {
  const { kidId } = useParams();
  return <PrizeBox kidId={kidId} />;
}

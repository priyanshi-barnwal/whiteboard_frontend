

import { useParams, useSearchParams } from "react-router-dom";
import TutorWhiteboard from "./src/components/TutorWhiteboard";
import StudentWhiteboard from "./src/components/StudentWhiteboard";
function RoomRouter() {
  const { roomId } = useParams();
  const [params] = useSearchParams();
  const role = params.get("role");

  if (role === "tutor") return <TutorWhiteboard />;
  return <StudentWhiteboard/>;
}

export default RoomRouter;

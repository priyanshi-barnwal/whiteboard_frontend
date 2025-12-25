import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import MyPage from "../pages/MyPage";
import TutorWhiteboard from "../components/TutorWhiteboard";
import StudentWhiteboard from "../components/StudentWhiteboard";
import RoomRouter from "../../RoomRouter";

function MyRoutes() {
  return (
    <Routes>
      {/* Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/mypage" element={<MyPage />} />

      {/* Whiteboard routes */}
      <Route path="/tutor" element={<TutorWhiteboard />} />
      <Route path="/student" element={<StudentWhiteboard />} />

      {/* Fallback */}
      <Route path="*" element={<h2>Page Not Found</h2>} />


       <Route path="/room/:roomId" element={<RoomRouter />} />
    </Routes>
  );
}

export default MyRoutes;

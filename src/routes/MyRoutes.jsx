// import React, { Suspense, lazy } from "react";
// import { Routes, Route } from "react-router-dom";

// import Home from "../pages/Home";
// import MyPage from "../pages/MyPage";
// const TutorWhiteboard = lazy(() => import("../components/TutorWhiteboard"));
// const StudentWhiteboard = lazy(() => import("../components/StudentWhiteboard"));
// import RoomRouter from "../../RoomRouter";

// function MyRoutes() {
//   return (
//     <Routes>
//       {/* Pages */}
//       <Route path="/" element={<Home />} />
//       <Route path="/mypage" element={<MyPage />} />

//       {/* Whiteboard routes - lazy loaded because they include Excalidraw and weights */}
//       <Route
//         path="/tutor"
//         element={
//           <Suspense fallback={<div>Loading tutor whiteboard…</div>}>
//             <TutorWhiteboard />
//           </Suspense>
//         }
//       />
//       <Route
//         path="/student"
//         element={
//           <Suspense fallback={<div>Loading student whiteboard…</div>}>
//             <StudentWhiteboard />
//           </Suspense>
//         }
//       />

//       {/* Fallback */}
//       <Route path="*" element={<h2>Page Not Found</h2>} />


//        <Route path="/room/:roomId" element={<RoomRouter />} />
//     </Routes>
//   );
// }

// export default MyRoutes;


import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import MyPage from "../pages/MyPage";
import RoomRouter from "../RoomRouter";

const TutorWhiteboard = lazy(() => import("../components/TutorWhiteboard"));
const StudentWhiteboard = lazy(() => import("../components/StudentWhiteboard"));

function MyRoutes() {
  return (
    <Routes>
      {/* Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/mypage" element={<MyPage />} />

      {/* Optional standalone routes */}
      <Route
        path="/tutor"
        element={
          <Suspense fallback={<div>Loading tutor whiteboard…</div>}>
            <TutorWhiteboard />
          </Suspense>
        }
      />

      <Route
        path="/student"
        element={
          <Suspense fallback={<div>Loading student whiteboard…</div>}>
            <StudentWhiteboard />
          </Suspense>
        }
      />

      {/* ✅ IMPORTANT: room route MUST be before "*" */}
      <Route path="/room/:roomId" element={<RoomRouter />} />

      {/* Fallback */}
      <Route path="*" element={<h2>Page Not Found</h2>} />
    </Routes>
  );
}

export default MyRoutes;

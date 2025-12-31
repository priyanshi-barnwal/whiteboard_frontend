

// import React, { Suspense, lazy } from "react";
// import { useParams, useSearchParams } from "react-router-dom";

// const TutorWhiteboard = lazy(() => import("./src/components/TutorWhiteboard"));
// const StudentWhiteboard = lazy(() => import("./src/components/StudentWhiteboard"));

// function RoomRouter() {
//   const { roomId } = useParams();
//   const [params] = useSearchParams();
//   const role = params.get("role");

//   if (role === "tutor")
//     return (
//       <Suspense fallback={<div>Loading tutor whiteboard…</div>}>
//         <TutorWhiteboard />
//       </Suspense>
//     );

//   return (
//     <Suspense fallback={<div>Loading student whiteboard…</div>}>
//       <StudentWhiteboard />
//     </Suspense>
//   );
// }

// export default RoomRouter;


import React, { Suspense, lazy } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const TutorWhiteboard = lazy(() => import("./src/components/TutorWhiteboard"));
const StudentWhiteboard = lazy(() => import("./src/components/StudentWhiteboard"));

function RoomRouter() {
  const { roomId } = useParams();
  const [params] = useSearchParams();
  const role = params.get("role");

  if (role === "tutor")
    return (
      <Suspense fallback={<div>Loading tutor whiteboard…</div>}>
        <TutorWhiteboard />
      </Suspense>
    );

  return (
    <Suspense fallback={<div>Loading student whiteboard…</div>}>
      <StudentWhiteboard />
    </Suspense>
  );
}

export default RoomRouter;

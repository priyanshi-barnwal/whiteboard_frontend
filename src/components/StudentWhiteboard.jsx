// import { Excalidraw } from "@excalidraw/excalidraw";
// import "@excalidraw/excalidraw/index.css";
// import { io } from "socket.io-client";
// import { useEffect, useRef, useState } from "react";

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";
// const socket = io.connect(SOCKET_URL, {
//   transports: ["websocket"],
// });
// const ROOM_ID = "room1";

// function StudentWhiteboard() {
//   const excalidrawRef = useRef(null);
//   const [scene, setScene] = useState(null);
//   const [sceneKey, setSceneKey] = useState("student-initial");

//  useEffect(() => {
//   socket.emit("join-room", {
//     roomId: ROOM_ID,
//     role: "student",
//   });

//   socket.on("whiteboard-sync", (msg) => {
//     console.log("STUDENT RECEIVED:", msg);
//     console.log('excalidrawRef currently:', excalidrawRef.current);
//     setScene(msg);
//     setSceneKey(`scene-${Date.now()}`);
//     if (excalidrawRef.current && msg) {
//       try {
//         excalidrawRef.current.updateScene({
//           elements: msg.elements,
//           appState: {
//             ...msg.appState,
//             viewBackgroundColor: "#ffffff",
//           },
//         });
//       } catch (e) {
//         console.error('failed to update excalidraw scene directly', e);
//       }
//     }
//   });

//   return () => {
//     socket.off("whiteboard-sync");
//   };
// }, []);

//   useEffect(() => {
//     if (scene && excalidrawRef.current) {
//       excalidrawRef.current.updateScene({
//         elements: scene.elements,
//         appState: {
//           ...scene.appState,
//           viewBackgroundColor: "#ffffff",
//         },
//       });
//     }
//   }, [scene]);

//   return (
//     <div style={{ height: "100vh", width: "100vw" }}>
//       <h2>Student View (Read Only)</h2>
//       <h1>this is student view</h1>
//       <Excalidraw
//         ref={excalidrawRef}
//         key={sceneKey}
//         initialData={
//           scene
//             ? {
//                 elements: scene.elements,
//                 appState: {
//                   ...scene.appState,
//                   viewBackgroundColor: "#ffffff",
//                 },
//               }
//             : undefined
//         }
//         viewModeEnabled={true}
//         zenModeEnabled={true}
//         gridModeEnabled={false}
//       />
//     </div>
//   );
// }

// export default StudentWhiteboard;



// import { Excalidraw } from "@excalidraw/excalidraw";
// import "@excalidraw/excalidraw/index.css";
// import { useEffect, useRef, useState } from "react";
// import { socket } from "./socket";

// const ROOM_ID = "room1";

// function StudentWhiteboard() {
//   const excalidrawRef = useRef(null);
//   const [scene, setScene] = useState(null);

//   const [canDraw, setCanDraw] = useState(false);
//   const [requestStatus, setRequestStatus] = useState("idle"); 
//   // idle | waiting | granted | denied

//   useEffect(() => {
//     socket.connect();

//     socket.emit("join-room", {
//       roomId: ROOM_ID,
//       role: "student",
//     });

//     socket.on("whiteboard-sync", (msg) => {
//       setScene(msg);
//       if (excalidrawRef.current && msg) {
//         excalidrawRef.current.updateScene({
//           elements: msg.elements,
//           appState: {
//             ...msg.appState,
//             viewBackgroundColor: "#ffffff",
//           },
//         });
//       }
//     });

//     socket.on("DRAW_ACCESS_GRANTED", () => {
//       setCanDraw(true);
//       setRequestStatus("granted");
//     });

//     socket.on("DRAW_ACCESS_DENIED", () => {
//       setCanDraw(false);
//       setRequestStatus("denied");
//     });

//     return () => {
//       socket.off("whiteboard-sync");
//       socket.off("DRAW_ACCESS_GRANTED");
//       socket.off("DRAW_ACCESS_DENIED");
//     };
//   }, []);

//   const requestAccess = () => {
//     socket.emit("REQUEST_DRAW_ACCESS", {
//       roomId: ROOM_ID,
//       studentId: socket.id,
//     });
//     setRequestStatus("waiting");
//   };

//   return (
//     <div style={{ height: "100vh", width: "100vw" }}>
//       <h2>Student View</h2>

//       {!canDraw && (
//         <div style={{ marginBottom: "10px" }}>
//           <button onClick={requestAccess} disabled={requestStatus === "waiting"}>
//             Request Access
//           </button>

//           {requestStatus === "waiting" && <p>Waiting for tutor approval...</p>}
//           {requestStatus === "denied" && (
//             <p style={{ color: "red" }}>Access denied by tutor</p>
//           )}
//         </div>
//       )}

//       <Excalidraw
//         ref={excalidrawRef}
//         initialData={
//           scene
//             ? {
//                 elements: scene.elements,
//                 appState: {
//                   ...scene.appState,
//                   viewBackgroundColor: "#ffffff",
//                 },
//               }
//             : undefined
//         }
//         viewModeEnabled={!canDraw}
//         zenModeEnabled={true}
//         gridModeEnabled={false}
//       />
//     </div>
//   );
// }

// export default StudentWhiteboard;




import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useRef, useState } from "react";
import { socket } from "./socket";

const ROOM_ID = "room1";

function StudentWhiteboard() {
  const excalidrawRef = useRef(null);
  const rafRef = useRef(null);
  const pendingSceneRef = useRef(null);

  const [canDraw, setCanDraw] = useState(false);
  const [requestStatus, setRequestStatus] = useState("idle");
  // idle | waiting | granted | denied

  useEffect(() => {
    // 🔥 connect to backend laptop
    socket.connect();

    socket.emit("join-room", {
      roomId: ROOM_ID,
      role: "student",
    });

    // 🔁 receive teacher drawing - use a stable handler and batch updates via rAF
    const handleWhiteboardSync = (msg) => {
      if (!msg) return;
      // if excalidraw not ready yet, store latest and return
      if (!excalidrawRef.current) {
        pendingSceneRef.current = msg;
        return;
      }

      // store latest scene and schedule a single rAF to apply it
      pendingSceneRef.current = msg;
      if (rafRef.current) return; // already scheduled

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const latest = pendingSceneRef.current;
        if (!latest || !excalidrawRef.current) return;
        try {
          excalidrawRef.current.updateScene({
            elements: latest.elements,
            appState: {
              ...latest.appState,
              viewBackgroundColor: "#ffffff",
            },
          });
        } catch (e) {
          console.error("failed to update excalidraw scene:", e);
        }
      });
    };

    socket.on("whiteboard-sync", handleWhiteboardSync);

    // ✅ permission granted
    socket.on("DRAW_ACCESS_GRANTED", () => {
      setCanDraw(true);
      setRequestStatus("granted");
    });

    // ❌ permission denied
    socket.on("DRAW_ACCESS_DENIED", () => {
      setCanDraw(false);
      setRequestStatus("denied");
    });

    return () => {
      // remove the exact handler references to avoid leaking listeners
      socket.off("whiteboard-sync", handleWhiteboardSync);
      socket.off("DRAW_ACCESS_GRANTED");
      socket.off("DRAW_ACCESS_DENIED");
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const requestAccess = () => {
    socket.emit("REQUEST_DRAW_ACCESS", {
      roomId: ROOM_ID,
      studentId: socket.id,
    });
    setRequestStatus("waiting");
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <h2>Student View</h2>

      {!canDraw && (
        <div style={{ marginBottom: "10px" }}>
          <button onClick={requestAccess} disabled={requestStatus === "waiting"}>
            Request Access
          </button>

          {requestStatus === "waiting" && <p>Waiting for tutor approval...</p>}
          {requestStatus === "denied" && (
            <p style={{ color: "red" }}>Access denied by tutor</p>
          )}
        </div>
      )}

      <Excalidraw
        ref={excalidrawRef}
        viewModeEnabled={!canDraw}
        zenModeEnabled={true}
        gridModeEnabled={false}
      />
    </div>
  );
}

export default StudentWhiteboard;

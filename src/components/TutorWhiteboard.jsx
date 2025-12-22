// import { Excalidraw } from "@excalidraw/excalidraw";
// import "@excalidraw/excalidraw/index.css";
// import { io } from "socket.io-client";
// import { useEffect, useRef } from "react";

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";
// const socket = io(SOCKET_URL);
// const ROOM_ID = "room1";

// function TutorWhiteboard() {
//   const excalidrawRef = useRef(null);

//   useEffect(() => {
//     socket.emit("join-room", {
//       roomId: ROOM_ID,
//       role: "tutor",
//     });
//   }, []);

// const handleChange = (elements, appState) => {
//   if (!elements || elements.length === 0) return;

//   socket.emit("whiteboard-update", {
//     elements,
//     appState: {
//       scrollX: appState.scrollX,
//       scrollY: appState.scrollY,
//       zoom: appState.zoom,
//       viewBackgroundColor: appState.viewBackgroundColor,
//     },
//   });
// };


//   return (
//     <div style={{ height: "100vh", width: "100vw" }}>
//       <h2>Tutor Board</h2>
//       <h1>This is the tutor's view</h1>
//       <Excalidraw
//         ref={excalidrawRef}
//         onChange={handleChange}
//       />
//     </div>
//   );
// }

// export default TutorWhiteboard;



// import { Excalidraw } from "@excalidraw/excalidraw";
// import "@excalidraw/excalidraw/index.css";
// import { useEffect, useRef, useState } from "react";
// import { socket } from "./socket";

// const ROOM_ID = "room1";

// function TutorWhiteboard() {
//   const excalidrawRef = useRef(null);
//   const [pendingStudent, setPendingStudent] = useState(null);

//   useEffect(() => {
//     socket.connect();

//     socket.emit("join-room", {
//       roomId: ROOM_ID,
//       role: "tutor",
//     });

//     socket.on("REQUEST_DRAW_ACCESS", ({ studentId }) => {
//       setPendingStudent(studentId);
//     });

//     return () => {
//       socket.off("REQUEST_DRAW_ACCESS");
//     };
//   }, []);

//   const handleChange = (elements, appState) => {
//     if (!elements || elements.length === 0) return;

//     socket.emit("whiteboard-update", {
//       elements,
//       appState: {
//         scrollX: appState.scrollX,
//         scrollY: appState.scrollY,
//         zoom: appState.zoom,
//         viewBackgroundColor: appState.viewBackgroundColor,
//       },
//     });
//   };

//   const allowAccess = () => {
//     socket.emit("GRANT_DRAW_ACCESS", {
//       studentId: pendingStudent,
//     });
//     setPendingStudent(null);
//   };

//   const denyAccess = () => {
//     socket.emit("DENY_DRAW_ACCESS", {
//       studentId: pendingStudent,
//     });
//     setPendingStudent(null);
//   };

//   return (
//     <div style={{ height: "100vh", width: "100vw" }}>
//       <h2>Tutor Board</h2>

//       {pendingStudent && (
//         <div style={{
//           position: "absolute",
//           top: 20,
//           right: 20,
//           padding: 15,
//           background: "#fff",
//           border: "1px solid #ccc",
//           zIndex: 1000,
//         }}>
//           <p>Student is requesting access</p>
//           <button onClick={allowAccess}>Allow</button>
//           <button onClick={denyAccess} style={{ marginLeft: 10 }}>
//             Deny
//           </button>
//         </div>
//       )}

//       <Excalidraw
//         ref={excalidrawRef}
//         onChange={handleChange}
//       />
//     </div>
//   );
// }

// export default TutorWhiteboard;



import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setScene, selectScene } from "../store/whiteboardSlice";
import { socket } from "./socket";

const ROOM_ID = "room1";

function TutorWhiteboard() {
  const excalidrawRef = useRef(null);
  const [pendingStudent, setPendingStudent] = useState(null);
  const dispatch = useDispatch();
  const sceneFromStore = useSelector(selectScene);
  const saveTimeoutRef = useRef(null);
  const prevElementsRef = useRef([]);
  const bcRef = useRef(null);

  useEffect(() => {
    socket.connect();

    // ensure we emit join-room after socket actually connects
    socket.on("connect", () => {
      console.log("tutor socket connected", socket.id);
      socket.emit("join-room", {
        roomId: ROOM_ID,
        role: "tutor",
      });
      console.log("tutor emitted join-room", ROOM_ID);
    });

    try {
      bcRef.current = new BroadcastChannel("whiteboard-sync");
      bcRef.current.onmessage = () => {};
    } catch (e) {
      // ignore
    }

    socket.on("REQUEST_DRAW_ACCESS", ({ studentId }) => {
      setPendingStudent(studentId);
    });

    // debug: log any socket events to help trace delivery
    try {
      socket.onAny((event, ...args) => {
        console.debug('[tutor socket event]', event, args && args.length ? args[0] : undefined);
      });
    } catch (e) {
      // onAny may not exist in some client lib versions
    }

    return () => {
      socket.off("REQUEST_DRAW_ACCESS");
      try { socket.offAny && socket.offAny(); } catch (e) {}
      try {
        if (bcRef.current) {
          bcRef.current.close();
          bcRef.current = null;
        }
      } catch (e) {}
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  // apply persisted scene (if any) on mount so refresh keeps the drawing for tutor
  useEffect(() => {
    if (sceneFromStore && excalidrawRef.current && sceneFromStore.elements?.length) {
      try {
        excalidrawRef.current.updateScene({
          elements: sceneFromStore.elements,
          appState: {
            ...sceneFromStore.appState,
            viewBackgroundColor: "#ffffff",
          },
        });
      } catch (e) {
        // non-fatal
      }
    }
    // only run on mount; sceneFromStore is read once intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (elements, appState) => {
    // 🔒 safety check
    if (!elements) return;

    // Emit a small delta immediately for low-latency realtime updates
    try {
      const prev = prevElementsRef.current || [];
      const prevMap = new Map(prev.map((e) => [e.id, e]));
      const delta = elements.filter((e) => {
        const p = prevMap.get(e.id);
        return !p || JSON.stringify(p) !== JSON.stringify(e);
      });

      if (delta.length > 0) {
        socket.emit("whiteboard-delta", {
          roomId: ROOM_ID,
          deltaElements: delta,
        });

        // broadcast to other tabs in same browser as well
        if (bcRef.current) {
          try {
            bcRef.current.postMessage({ deltaElements: delta, senderId: socket.id });
          } catch (e) {}
        }
      }

      prevElementsRef.current = elements;
    } catch (e) {
      // fallback to full scene emit
      socket.emit("whiteboard-update", {
        elements,
        appState: {
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
          zoom: appState.zoom,
          viewBackgroundColor: appState.viewBackgroundColor || "#ffffff",
        },
      });
    }

    // debounce persisting to Redux/localStorage so we don't dispatch on every stroke
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        dispatch(
          setScene({
            elements,
            appState: {
              scrollX: appState.scrollX,
              scrollY: appState.scrollY,
              zoom: appState.zoom,
              viewBackgroundColor: appState.viewBackgroundColor || "#ffffff",
            },
          })
        );
        // also emit a debounced full scene to server so other devices get a consistent full update
        try {
          socket.emit("whiteboard-update", {
            roomId: ROOM_ID,
            elements,
            appState: {
              scrollX: appState.scrollX,
              scrollY: appState.scrollY,
              zoom: appState.zoom,
              viewBackgroundColor: appState.viewBackgroundColor || "#ffffff",
            },
          });
        } catch (e) {}
      } catch (e) {
        // swallow
      }
    }, 1000);
  };

  const allowAccess = () => {
    socket.emit("GRANT_DRAW_ACCESS", {
      studentId: pendingStudent,
    });
    setPendingStudent(null);
  };

  const denyAccess = () => {
    socket.emit("DENY_DRAW_ACCESS", {
      studentId: pendingStudent,
    });
    setPendingStudent(null);
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <h2>Tutor Board</h2>

      {pendingStudent && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            padding: 15,
            background: "#fff",
            border: "1px solid #ccc",
            zIndex: 1000,
          }}
        >
          <p>Student is requesting access</p>
          <button onClick={allowAccess}>Allow</button>
          <button onClick={denyAccess} style={{ marginLeft: 10 }}>
            Deny
          </button>
        </div>
      )}

      <Excalidraw
        ref={excalidrawRef}
        initialData={
          sceneFromStore && sceneFromStore.elements && sceneFromStore.elements.length
            ? {
                elements: sceneFromStore.elements,
                appState: {
                  ...sceneFromStore.appState,
                  viewBackgroundColor: "#ffffff",
                },
              }
            : undefined
        }
        onChange={handleChange}
      />
    </div>
  );
}

export default TutorWhiteboard;

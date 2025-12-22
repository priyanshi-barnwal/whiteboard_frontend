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

    // debug: log any socket events to help trace why whiteboard-sync may not arrive
    try {
      socket.onAny((event, ...args) => {
        console.debug('[student socket event]', event, args && args.length ? args[0] : undefined);
      });
    } catch (e) {
      // ignore if onAny not supported
    }
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
import { useDispatch, useSelector } from "react-redux";
import { setScene, selectScene } from "../store/whiteboardSlice";
import { socket } from "./socket";

const ROOM_ID = "room1";

function StudentWhiteboard() {
  const excalidrawRef = useRef(null);
  const rafRef = useRef(null);
  const pendingSceneRef = useRef(null);
  const lastElementsRef = useRef([]);
  const lastAppStateRef = useRef({});
  const bcRef = useRef(null);

  const dispatch = useDispatch();
  const sceneFromStore = useSelector(selectScene);

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
              // remember last applied scene for delta merges
              lastElementsRef.current = latest.elements || [];
              lastAppStateRef.current = latest.appState || {};
            // also persist incoming teacher updates into redux store so refresh retains it
            try {
              dispatch(
                setScene({
                  elements: latest.elements,
                  appState: latest.appState || {},
                })
              );
            } catch (e) {
              // swallow non-fatal errors
            }
          } catch (e) {
            console.error("failed to update excalidraw scene:", e);
          }
      });
    };

    socket.on("whiteboard-sync", handleWhiteboardSync);

    // Handle lightweight delta updates (low-latency) if tutor emits them
    const handleWhiteboardDelta = (msg) => {
      if (!msg || !msg.deltaElements) return;
      // merge delta into lastElementsRef
      try {
        const current = lastElementsRef.current || [];
        const map = new Map(current.map((e) => [e.id, e]));
        msg.deltaElements.forEach((e) => map.set(e.id, e));
        const merged = Array.from(map.values());
        lastElementsRef.current = merged;
        // apply to excalidraw if ready
        if (excalidrawRef.current) {
          excalidrawRef.current.updateScene({
            elements: merged,
            appState: {
              ...lastAppStateRef.current,
              viewBackgroundColor: "#ffffff",
            },
          });
        }
        // persist merged scene
        try {
          dispatch(setScene({ elements: merged, appState: lastAppStateRef.current || {} }));
        } catch (e) {}
      } catch (e) {
        // non-fatal
      }
    };

    socket.on("whiteboard-delta", handleWhiteboardDelta);

    // same-tab BroadcastChannel delta receiver
    try {
      bcRef.current = new BroadcastChannel("whiteboard-sync");
      bcRef.current.onmessage = (ev) => {
        const data = ev.data || {};
        if (data.senderId === socket.id) return; // ignore own messages
        if (data.deltaElements) {
          handleWhiteboardDelta({ deltaElements: data.deltaElements });
        }
      };
    } catch (e) {
      // ignore browsers without BroadcastChannel
    }

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
      socket.off("whiteboard-delta", handleWhiteboardDelta);
      socket.off("DRAW_ACCESS_GRANTED");
      socket.off("DRAW_ACCESS_DENIED");
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      try {
        if (bcRef.current) {
          bcRef.current.close();
          bcRef.current = null;
        }
      } catch (e) {}
    };
  }, []);

  // apply persisted scene from redux/localStorage on mount so refresh keeps the drawing
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
        lastElementsRef.current = sceneFromStore.elements || [];
        lastAppStateRef.current = sceneFromStore.appState || {};
      } catch (e) {
        // non-fatal
      }
    }

    // If we received a scene before Excalidraw was ready, apply it now
    if (pendingSceneRef.current && excalidrawRef.current) {
      try {
        const latest = pendingSceneRef.current;
        excalidrawRef.current.updateScene({
          elements: latest.elements,
          appState: {
            ...latest.appState,
            viewBackgroundColor: "#ffffff",
          },
        });
        // persist it as well
        try {
          dispatch(setScene({ elements: latest.elements, appState: latest.appState || {} }));
        } catch (e) {}
        pendingSceneRef.current = null;
      } catch (e) {
        console.error('failed to apply pending scene', e);
      }
    }

    // only run on mount; sceneFromStore read once intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // apply persisted scene from redux/localStorage on mount so refresh keeps the drawing
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
    // only run on mount; sceneFromStore read once intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        viewModeEnabled={!canDraw}
        zenModeEnabled={true}
        gridModeEnabled={false}
      />
    </div>
  );
}

export default StudentWhiteboard;

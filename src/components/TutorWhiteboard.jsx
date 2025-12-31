
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

// const SOCKET_URL =
//   import.meta.env.VITE_SOCKET_URL || "https://whiteboard-backend-vtmo.onrender.com/";


const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://whiteboard-backend-vtmo.onrender.com/";

function TutorWhiteboard() {
  const { roomId } = useParams();

  const socketRef = useRef(null);
  const lastEmitRef = useRef(0);
  const excalidrawAPIRef = useRef(null);
  const isRemoteUpdateRef = useRef(false);

  const [pendingStudent, setPendingStudent] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      query: {
        roomId,
        role: "tutor",
      },
    });

    // 🔥 Receive updates from students (or server sync)
    socketRef.current.on("whiteboard-sync", (scene) => {
      isRemoteUpdateRef.current = true;
      excalidrawAPIRef.current?.updateScene(scene);
      // Reset flag after a short delay to allow scene update to complete
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 100);
    });

    // 🔥 RECEIVE STUDENT REQUEST
    socketRef.current.on("request-access", ({ studentId }) => {
      setPendingStudent(studentId);
    });

    return () => socketRef.current?.disconnect();
  }, [roomId]);

  const handleChange = (elements, appState) => {
    if (!socketRef.current) return;
    // 🔥 Skip if this change came from a remote update (student)
    if (isRemoteUpdateRef.current) return;

    const now = Date.now();
    if (now - lastEmitRef.current < 50) return;
    lastEmitRef.current = now;

    socketRef.current.emit("whiteboard-update", {
      elements,
      appState: {
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
        zoom: appState.zoom,
        viewBackgroundColor: appState.viewBackgroundColor,
      },
    });
  };

  const handleReady = (api) => {
    excalidrawAPIRef.current = api;
  };

  const allowStudent = () => {
    socketRef.current.emit("access-response", {
      studentId: pendingStudent,
      status: "approved",
    });
    setPendingStudent(null);
  };

  const denyStudent = () => {
    socketRef.current.emit("access-response", {
      studentId: pendingStudent,
      status: "denied",
    });
    setPendingStudent(null);
  };

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
      <h2 style={{ margin: 0, padding: "10px 16px", background: "#f5f5f5", flexShrink: 0 }}>Tutor Board</h2>

      <div style={{ flex: 1, position: "relative" }}>
        <Excalidraw
          excalidrawAPI={handleReady}
          onChange={handleChange}
        />

        {pendingStudent && (
          <div
            style={{
              position: "absolute",
              top: "80px",
              right: "20px",
              background: "#fff",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              zIndex: 9999,
            }}
          >
            <p>Student is requesting access</p>

            <button onClick={allowStudent} style={{ marginRight: "8px" }}>
              Allow
            </button>

            <button onClick={denyStudent}>
              Deny
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorWhiteboard;

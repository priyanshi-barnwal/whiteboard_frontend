import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://whiteboard-backend-vtmo.onrender.com/";

function StudentWhiteboard() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");

  const excalidrawAPIRef = useRef(null);
  const pendingSceneRef = useRef(null);
  const socketRef = useRef(null);
  const lastEmitRef = useRef(0);


  const [accessStatus, setAccessStatus] = useState("idle");
  // idle | waiting | approved | denied

  useEffect(() => {
    if (!roomId || role !== "student") return;

    socketRef.current = io(SOCKET_URL, {
      query: { roomId, role },
    });

    socketRef.current.on("whiteboard-sync", (scene) => {
      if (!excalidrawAPIRef.current) {
        pendingSceneRef.current = scene;
        return;
      }

      excalidrawAPIRef.current.updateScene({
        elements: scene.elements,
        appState: {
          ...scene.appState,
          viewBackgroundColor: "#ffffff",
        },
      });
    });

    // 🔥 LISTEN FOR TUTOR DECISION
    socketRef.current.on("access-response", ({ status }) => {
      setAccessStatus(status);
    });

    return () => socketRef.current?.disconnect();
  }, [roomId, role]);

  const handleReady = (api) => {
    excalidrawAPIRef.current = api;

    if (pendingSceneRef.current) {
      api.updateScene({
        elements: pendingSceneRef.current.elements,
        appState: pendingSceneRef.current.appState,
      });
      pendingSceneRef.current = null;
    }
  };

  const requestAccess = () => {
    if (!socketRef.current) return;

    socketRef.current.emit("request-access", {
      roomId,
      studentId: socketRef.current.id,
    });

    setAccessStatus("waiting");
  };
  const handleChange = (elements, appState) => {
    if (!socketRef.current) return;

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


  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
      }}
    >
      <Excalidraw
        excalidrawAPI={handleReady}
        viewModeEnabled={accessStatus !== "approved"} // 🔥 KEY
        UIOptions={{ canvasActions: { viewMode: false } }}
        onPointerDown={(e) =>
          accessStatus !== "approved" && e.preventDefault()
        }
        onChange={accessStatus === "approved" ? handleChange : undefined}
      />

      {accessStatus !== "approved" && (
        <button
          onClick={requestAccess}
          disabled={accessStatus === "waiting"}
          style={{
            position: "absolute",
            top: "18px",
            right: "130px",
            zIndex: 9999,
            padding: "8px 18px",
            fontSize: "13px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#4f46e5",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          {accessStatus === "waiting"
            ? "Waiting for approval..."
            : accessStatus === "denied"
              ? "Access denied"
              : "✋ Request Access"}
        </button>
      )}
    </div>
  );
}

export default StudentWhiteboard;

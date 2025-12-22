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


import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { io } from "socket.io-client";
import { useEffect, useRef } from "react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";
const socket = io(SOCKET_URL);
const ROOM_ID = "room1";

function TutorWhiteboard() {
  const excalidrawRef = useRef(null);

  useEffect(() => {
    socket.emit("join-room", {
      roomId: ROOM_ID,
      role: "tutor",
    });
  }, []);

const handleChange = (elements, appState) => {
  if (!elements || elements.length === 0) return;

  socket.emit("whiteboard-update", {
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
    <div style={{ height: "100vh", width: "100vw" }}>
      <h2>Tutor Board</h2>
      <h1>This is the tutor's view</h1>
      <Excalidraw
        ref={excalidrawRef}
        onChange={handleChange}
      />
    </div>
  );
}

export default TutorWhiteboard;

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://192.168.1.147:8080";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  // reconnection options (tweak if needed)
  // reconnection: true,
  // reconnectionAttempts: 5,
  // reconnectionDelay: 1000,
});

//console.log("socket helper created, connecting to:", SOCKET_URL);

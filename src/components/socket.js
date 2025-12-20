import { io } from "socket.io-client";

export const socket = io("http://192.168.1.147:8080", {
  autoConnect: false,
  //autoConnect: true,
});

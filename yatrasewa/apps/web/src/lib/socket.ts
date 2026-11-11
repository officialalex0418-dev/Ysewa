import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      auth: { token: `Bearer ${getAccessToken() ?? ""}` },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

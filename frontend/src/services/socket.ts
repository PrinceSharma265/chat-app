import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants/config";

let socketInstance: Socket | null = null;

export function connectSocket() {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  socketInstance = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
  });

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function getSocket() {
  return socketInstance;
}

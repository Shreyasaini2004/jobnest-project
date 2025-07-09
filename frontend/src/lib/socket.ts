// src/lib/socket.ts
import { io } from "socket.io-client";

// This should be your main backend server URL, which now handles sockets.
const URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create a single instance of the socket.
// We set autoConnect to false so we can control when it connects.
export const socket = io(URL, {
  autoConnect: false,
});
import { useSearchParams } from "react-router-dom";
import React from "react";
import Chat from "./Chat";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001"); // adjust if your backend is on another port

const ChatWrapper = () => {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room");
  const username = searchParams.get("user");

  if (!room || !username) {
    return (
      <div className="text-center mt-10 text-red-600 font-semibold">
        Missing room or username in the URL.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chat Room: {room}</h1>
      <Chat socket={socket} username={username} room={room} />
    </div>
  );
};

export default ChatWrapper;

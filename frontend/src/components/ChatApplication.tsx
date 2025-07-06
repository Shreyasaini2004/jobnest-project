import { io, Socket } from "socket.io-client";
import { useState, useEffect } from "react";
import Chat from "./Chat";
import { useSearchParams } from "react-router-dom";
import "../App.css";

const socket: Socket = io("http://localhost:3001");

function ChatApplication() {
  const [userName, setUsername] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [showChat, setShowChat] = useState<boolean>(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const userFromQuery = searchParams.get("user");
    const roomFromQuery = searchParams.get("room");

    if (userFromQuery && roomFromQuery) {
      setUsername(userFromQuery);
      setRoom(roomFromQuery);
      socket.emit("join_room", roomFromQuery);
      setShowChat(true);
    }
  }, [searchParams]);

  const joinRoom = () => {
    if (userName !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join a Chat</h3>
          <input
            type="text"
            placeholder="John.."
            value={userName}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID.."
            value={room}
            onChange={(event) => setRoom(event.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <Chat socket={socket} username={userName} room={room} />
      )}
    </div>
  );
}

export default ChatApplication;

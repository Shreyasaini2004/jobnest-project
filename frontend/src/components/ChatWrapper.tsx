// import { useSearchParams } from "react-router-dom";
// import React from "react";
// import Chat from "./Chat";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000"); // adjust if your backend is on another port

// const ChatWrapper = () => {
//   const [searchParams] = useSearchParams();
//   const room = searchParams.get("room");
//   const username = searchParams.get("user");

//   if (!room || !username) {
//     return (
//       <div className="text-center mt-10 text-red-600 font-semibold">
//         Missing room or username in the URL.
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-4">Chat Room: {room}</h1>
//       <Chat socket={socket} username={username} room={room} />
//     </div>
//   );
// };

// export default ChatWrapper;



// src/components/ChatWrapper.tsx
import { useSearchParams } from "react-router-dom";
import React, { useEffect } from "react";
import Chat from "./Chat";
import { socket } from "../lib/socket"; // Import our shared socket instance

const ChatWrapper = () => {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room");
  const username = searchParams.get("user");
  const partnerName = searchParams.get("partnerName");

  useEffect(() => {
    // Connect our shared socket when we enter the page
    socket.connect();
    
    if (room) {
      socket.emit("join_room", room);
    }

    // Disconnect when we leave the page to save resources
    return () => {
      socket.disconnect();
    };
  }, [room]); // Re-join the room if the URL parameter changes

  if (!room || !username) {
    return (
      <div className="p-8 text-center text-red-600">
        <h1>Error</h1>
        <p>Missing room or username information in the URL.</p>
      </div>
    );
  }

  return <Chat socket={socket} username={username} room={room} chatPartnerName={partnerName || "Chat Partner"} />;
};

export default ChatWrapper;



// src/components/ChatWrapper.tsx (UPDATED)

// import { useSearchParams } from "react-router-dom";
// import React, { useEffect } from "react";
// import { useUser } from "@/contexts/UserContext"; // Your auth context
// import { socket } from "@/lib/socket"; // Your shared socket instance
// import { ChatPage } from "@/pages/ChatPage"; // The new beautiful UI component

// const ChatWrapper = () => {
//   const [searchParams] = useSearchParams();
//   const { user } = useUser();
  
//   // Get chat parameters from the URL
//   const room = searchParams.get("room");
//   const partnerName = searchParams.get("partnerName");

//   useEffect(() => {
//     // Only proceed if we have a room ID
//     if (!room) return;
    
//     // Connect our shared socket when we enter the page
//     socket.connect();
//     socket.emit("join_room", room);

//     // Disconnect when we leave the page to save resources
//     return () => {
//       socket.disconnect();
//     };
//   }, [room]);

//   if (!room || !partnerName) {
//     return <div className="p-8 text-center text-red-600">Error: Chat information is missing from the URL.</div>;
//   }

//   if (!user) {
//     return <div className="p-8 text-center text-red-600">Error: You must be logged in to chat.</div>;
//   }

//   // Determine the current user's name for the chat
//   const username = user.role === 'employer' ? user.companyName : user.firstName;

//   return (
//     <ChatPage
//       socket={socket}
//       username={username || "Me"}
//       room={room}
//       chatPartnerName={partnerName}
//     />
//   );
// };

// export default ChatWrapper;





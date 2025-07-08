// import React, { useState, useEffect } from 'react';
// import ScrollToBottom from 'react-scroll-to-bottom';
// import { io , Socket } from 'socket.io-client';

// interface Message {
//   room: string;
//   author: string;
//   message: string;
//   time: string;
// }

// interface ChatProps {
//   socket: Socket;
//   username: string;
//   room: string;
// }

// const Chat: React.FC<ChatProps> = ({ socket, username, room }) => {
//   const [currentMessage, setCurrentMessage] = useState<string>("");
//   const [messageList, setMessageList] = useState<Message[]>([]);

//   const sendMessage = async () => {
//     if (currentMessage !== "") {
//       const time = new Date();
//       const formattedTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
//       const messageData: Message = {
//         room: room,
//         author: username,
//         message: currentMessage,
//         time: formattedTime,
//       };
//       await socket.emit("send_message", messageData);
//       setMessageList((list) => [...list, messageData]);
//       setCurrentMessage("");
//     }
//   };

//   useEffect(() => {
//   const handler = (data: Message) => {
//     setMessageList((list) => [...list, data]);
//   };
//   socket.on("receive_message", handler);

//   return () => {
//     socket.off("receive_message", handler);
//   };
// }, [socket]);


//   return (
//     <div className="chat-window">
//       <div className="chat-header">
//         <p>Live Chat</p>
//       </div>
//       <div className="chat-body">
//         <ScrollToBottom className="message-container">
//           {messageList.map((messageContent, idx) => (
//             <div className="message" id={username === messageContent.author ? "you" : "other"} key={idx}>
//               <div className="message-content">
//                 <p>{messageContent.message}</p>
//               </div>
//               <div className="message-meta">
//                 <p id="time">{messageContent.author}</p>
//                 <p id="author">{messageContent.time}</p>
//               </div>
//             </div>
//           ))}
//         </ScrollToBottom>
//       </div>
//       <div className='chat-footer'>
//         <input
//           type="text"
//           placeholder="Type a message..."
//           value={currentMessage}
//           onChange={(event) => setCurrentMessage(event.target.value)}
//           onKeyDown={(event) => event.key === "Enter" && sendMessage()}
//         />
//         <button onClick={sendMessage}>&#9658;</button>
//       </div>
//     </div>
//   );
// };

// export default Chat;



// src/components/Chat.tsx (The new, reusable chat UI)
import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

// Define the shape of our message object and the props this component expects
interface Message {
  room: string;
  author: string;
  message: string;
  time: string;
}
interface ChatProps {
  socket: Socket;
  username: string;
  room: string;
}

const Chat: React.FC<ChatProps> = ({ socket, username, room }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to listen for incoming messages from other users
  useEffect(() => {
    const receiveMessageHandler = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };
    socket.on("receive_message", receiveMessageHandler);

    // Clean up the listener when the component is unmounted
    return () => {
      socket.off("receive_message", receiveMessageHandler);
    };
  }, [socket]);

  // Effect to scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to send a message
  const sendMessage = () => {
    if (!input.trim()) return;

    const messageData: Message = {
      room: room,
      author: username,
      message: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit("send_message", messageData);
    // Add our own message to the list immediately for a snappy UI
    setMessages((prev) => [...prev, messageData]);
    setInput("");
  };

  return (
    <Card className="flex-1 flex flex-col max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700">
          Conversation Room: {room}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col h-[400px] overflow-y-auto bg-indigo-50 rounded-xl p-4">
        {messages.length === 0 ? (
          <div className="text-slate-400 text-center my-auto">
            No messages yet. Send the first message!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`mb-2 flex ${username === msg.author ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-xs ${username === msg.author ? "bg-indigo-500 text-white" : "bg-white text-indigo-700 border"}`}>
                <div className="text-sm font-semibold">{msg.author}</div>
                <div className="text-base">{msg.message}</div>
                <div className="text-xs text-right opacity-60 mt-1">{msg.time}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="flex gap-2 p-4 border-t bg-white rounded-b-2xl">
        <input
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default Chat;

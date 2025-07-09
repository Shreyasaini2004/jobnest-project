
// // src/components/Chat.tsx (The new, reusable chat UI)
// import React, { useEffect, useRef, useState } from "react";
// import { Socket } from "socket.io-client";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Check, Send, ArrowLeft } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useUser } from "@/contexts/UserContext";

// // Define the shape of our message object and the props this component expects
// interface Message {
//   room: string;
//   author: string;
//   message: string;
//   time: string;
//   // Optionally, add a delivered/read flag
//   delivered?: boolean;
// }
// interface ChatProps {
//   socket: Socket;
//   username: string;
//   room: string;
//   chatPartnerName?: string;
// }

// const getInitials = (name: string) => {
//   if (!name) return "?";
//   const parts = name.split(" ");
//   if (parts.length === 1) return parts[0][0].toUpperCase();
//   return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
// };

// // Add animation utility
// const fadeInSlideUp = "animate-fade-in-slide-up";

// const Chat: React.FC<ChatProps> = ({ socket, username, room, chatPartnerName }) => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const navigate = useNavigate();
//   const { user } = useUser();

//   // Determine the other user's name for the header
//   const otherUser = chatPartnerName || "Chat Partner";

//   // Effect to listen for incoming messages and message history
//   useEffect(() => {
//     // Handler for receiving new messages
//     const receiveMessageHandler = (data: Message) => {
//       setMessages((prev) => [...prev, data]);
//     };
    
//     // Handler for receiving message history when joining a room
//     const messageHistoryHandler = (history: Message[]) => {
//       setMessages(history);
//     };
    
//     // Register event listeners
//     socket.on("receive_message", receiveMessageHandler);
//     socket.on("message_history", messageHistoryHandler);
    
//     // Cleanup event listeners when component unmounts
//     return () => {
//       socket.off("receive_message", receiveMessageHandler);
//       socket.off("message_history", messageHistoryHandler);
//     };
//   }, [socket]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!input.trim()) return;
//     const messageData: Message = {
//       room: room,
//       author: username,
//       message: input,
//       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       delivered: true,
//     };
//     socket.emit("send_message", messageData);
//     setMessages((prev) => [...prev, messageData]);
//     setInput("");
//   };

//   // Determine if a message is from the employer (purple bubble)
//   const isEmployer = (author: string) => author.toLowerCase().includes("employer");

//   return (
//     <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden">
//       {/* Full-page animated background (softer, more textured) */}
//       <div className="fixed inset-0 z-0 pointer-events-none">
//         <div className="w-full h-full animate-gradient-move bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 opacity-80" />
//         {/* Subtle dot pattern overlay */}
//         <svg className="absolute inset-0 w-full h-full opacity-20" style={{ pointerEvents: 'none' }} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//             <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
//               <circle cx="2" cy="2" r="1.5" fill="#a5b4fc" />
//             </pattern>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#dots)" />
//         </svg>
//         {/* Watermark icon (e.g., chat bubble) */}
//         <svg className="absolute bottom-8 right-8 opacity-10 w-64 h-64" fill="none" viewBox="0 0 100 100">
//           <ellipse cx="50" cy="50" rx="45" ry="30" fill="#6366f1" />
//           <ellipse cx="70" cy="70" rx="10" ry="5" fill="#6366f1" />
//         </svg>
//       </div>
//       {/* Chat card with light greenish background */}
//       <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto rounded-2xl shadow-lg min-h-[600px] relative overflow-hidden z-10 bg-gradient-to-br from-green-100 via-white to-green-50/80 backdrop-blur-md">
//         <CardHeader className="bg-white/80 rounded-t-2xl border-b flex flex-row justify-between items-center z-10 relative">
//           <Button 
//             variant="ghost" 
//             size="sm" 
//             className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
//             onClick={() => {
//               if (user?.userType === "employer") {
//                 navigate("/employer-dashboard");
//               } else {
//                 navigate("/dashboard");
//               }
//             }}
//           >
//             <ArrowLeft className="h-4 w-4" />
//             <span>Dashboard</span>
//           </Button>
//           <CardTitle className="flex items-center gap-2 text-indigo-700 text-lg">
//             <span>Chat with {otherUser}</span>
//           </CardTitle>
//           <div className="w-24"></div> {/* Empty div for spacing */}
//         </CardHeader>
//         <CardContent className="flex-1 flex flex-col h-[400px] overflow-y-auto p-6 z-10 relative">
//           {messages.length === 0 ? (
//             <div className="text-slate-400 text-center my-auto opacity-80">
//               No messages yet. Start the conversation!
//             </div>
//           ) : (
//             messages.map((msg, idx) => {
//               const mine = username === msg.author;
//               const employer = isEmployer(msg.author);
//               return (
//                 <div key={idx} className={`mb-4 flex ${mine ? "justify-end" : "justify-start"} ${fadeInSlideUp}`} style={{ animationDelay: `${idx * 60}ms` }}>
//                   <div className={`flex items-end gap-2 max-w-[80%] ${mine ? "flex-row-reverse" : ""}`}>
//                     {/* Avatar */}
//                     <Avatar className="h-10 w-10 shadow-md">
//                       <AvatarFallback className={employer ? "bg-indigo-500 text-white" : "bg-blue-200 text-blue-900"}>
//                         {getInitials(msg.author)}
//                       </AvatarFallback>
//                     </Avatar>
//                     {/* Bubble */}
//                     <div className={`rounded-3xl px-5 py-3 shadow-lg ${mine
//                       ? "bg-indigo-500 text-white"
//                       : employer
//                         ? "bg-indigo-100 text-indigo-900"
//                         : "bg-blue-100 text-blue-900"}
//                       `}>
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className={`font-bold text-base ${employer ? "text-indigo-200" : "text-blue-700"}`}>{msg.author}</span>
//                       </div>
//                       <div className="text-base break-words whitespace-pre-line">{msg.message}</div>
//                       <div className="flex items-center gap-1 mt-2">
//                         <span className="text-xs text-gray-400">{msg.time}</span>
//                         {mine && msg.delivered && (
//                           <Check className="h-3 w-3 text-green-400 ml-1" aria-label="Delivered" />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//           <div ref={messagesEndRef} />
//         </CardContent>
//         <div className="flex gap-2 p-5 border-t bg-white rounded-b-2xl z-10 relative">
//           <input
//             className="flex-1 border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg bg-indigo-50 placeholder:text-indigo-300"
//             placeholder="Type your message here..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           />
//           <Button onClick={sendMessage} disabled={!input.trim()} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-md h-12 w-12 flex items-center justify-center">
//             <Send className="h-6 w-6 fill-white" />
//           </Button>
//         </div>
//       </div>
//       {/* Animation styles */}
//       <style>{`
//         @keyframes fade-in-slide-up {
//           0% { opacity: 0; transform: translateY(30px); }
//           100% { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in-slide-up {
//           animation: fade-in-slide-up 0.5s cubic-bezier(0.4,0,0.2,1) both;
//         }
//         @keyframes gradient-move {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }
//         .animate-gradient-move {
//           background-size: 200% 200%;
//           animation: gradient-move 12s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Chat;




// for clear chat and chat persistance
// frontend/src/components/Chat.tsx

import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Send, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

// NEW: Import AlertDialog components for the confirmation
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define the shape of our message object from the database
interface Message {
  _id?: string;
  room: string;
  author: string;
  message: string;
  time: string;
  delivered?: boolean;
  createdAt?: string;
}
interface ChatProps {
  socket: Socket;
  username: string;
  room: string;
  chatPartnerName?: string;
}

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const fadeInSlideUp = "animate-fade-in-slide-up";

const Chat: React.FC<ChatProps> = ({ socket, username, room, chatPartnerName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const otherUser = chatPartnerName || "Chat Partner";

  useEffect(() => {
    const fetchHistory = async () => {
      if (room) {
        setIsLoadingHistory(true);
        try {
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          const response = await fetch(`${apiBaseUrl}/api/chat/${room}/history`);
          if (!response.ok) throw new Error('Failed to fetch chat history');
          const history: Message[] = await response.json();
          setMessages(history);
        } catch (error) {
          console.error("Error fetching message history:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };
    fetchHistory();
  }, [room]);

  // MODIFIED: useEffect to handle all real-time socket events
  useEffect(() => {
    const receiveMessageHandler = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    // NEW: Handler for when the chat is cleared by anyone in the room
    const chatClearedHandler = () => {
      setMessages([]); // Simply clear the messages state
    };
    
    socket.on("receive_message", receiveMessageHandler);
    socket.on("chat_cleared", chatClearedHandler); // NEW: Listen for the clear event
    
    return () => {
      socket.off("receive_message", receiveMessageHandler);
      socket.off("chat_cleared", chatClearedHandler); // NEW: Clean up the listener
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const messageData: Message = { room, author: username, message: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), delivered: true };
    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setInput("");
  };

  // NEW: Function to handle clearing the chat
  const handleClearChat = () => {
    if (room) {
      socket.emit("clear_chat", room);
    }
  };

  const isEmployer = (author: string) => author.toLowerCase().includes("employer");

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="w-full h-full animate-gradient-move bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 opacity-80" />
        <svg className="absolute inset-0 w-full h-full opacity-20" style={{ pointerEvents: 'none' }} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#a5b4fc" /></pattern></defs><rect width="100%" height="100%" fill="url(#dots)" /></svg>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto rounded-2xl shadow-lg min-h-[600px] relative overflow-hidden z-10 bg-gradient-to-br from-green-100 via-white to-green-50/80 backdrop-blur-md">
        <CardHeader className="bg-white/80 rounded-t-2xl border-b flex flex-row justify-between items-center z-10 relative">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100" onClick={() => navigate(user?.userType === "employer" ? "/employer-dashboard" : "/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
          <CardTitle className="flex items-center gap-2 text-indigo-700 text-lg">
            <span>Chat with {otherUser}</span>
          </CardTitle>
          
          {/* NEW: Clear Chat Button and Confirmation Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 hover:text-red-700">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the entire chat history for both you and {otherUser}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearChat} className="bg-red-600 hover:bg-red-700">
                  Yes, Clear Chat
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col h-[400px] overflow-y-auto p-6 z-10 relative">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center text-slate-400 my-auto"><Loader2 className="h-8 w-8 animate-spin mb-2" /><span>Loading conversation...</span></div>
          ) : messages.length === 0 ? (
            <div className="text-slate-400 text-center my-auto opacity-80">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg, idx) => {
              const key = msg._id || `optimistic-${idx}`;
              const mine = username === msg.author;
              const employer = isEmployer(msg.author);
              return (
                <div key={key} className={`mb-4 flex ${mine ? "justify-end" : "justify-start"} ${fadeInSlideUp}`} style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className={`flex items-end gap-2 max-w-[80%] ${mine ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-10 w-10 shadow-md"><AvatarFallback className={employer ? "bg-indigo-500 text-white" : "bg-blue-200 text-blue-900"}>{getInitials(msg.author)}</AvatarFallback></Avatar>
                    <div className={`rounded-3xl px-5 py-3 shadow-lg ${mine ? "bg-indigo-500 text-white" : employer ? "bg-indigo-100 text-indigo-900" : "bg-blue-100 text-blue-900"}`}>
                      <div className="flex items-center gap-2 mb-1"><span className={`font-bold text-base ${employer && !mine ? "text-indigo-700" : "text-slate-300"}`}>{msg.author}</span></div>
                      <div className="text-base break-words whitespace-pre-line">{msg.message}</div>
                      <div className="flex items-center gap-1 mt-2"><span className="text-xs text-gray-400">{msg.time}</span>{mine && msg.delivered && <Check className="h-3 w-3 text-green-400 ml-1" aria-label="Delivered" />}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="flex gap-2 p-5 border-t bg-white rounded-b-2xl z-10 relative">
          <input className="flex-1 border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg bg-indigo-50 placeholder:text-indigo-300" placeholder="Type your message here..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
          <Button onClick={sendMessage} disabled={!input.trim()} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-md h-12 w-12 flex items-center justify-center"><Send className="h-6 w-6 fill-white" /></Button>
        </div>
      </div>
      
      {/* Animation styles */}
      <style>{`@keyframes fade-in-slide-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } } .animate-fade-in-slide-up { animation: fade-in-slide-up 0.5s cubic-bezier(0.4,0,0.2,1) both; } @keyframes gradient-move { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } } .animate-gradient-move { background-size: 200% 200%; animation: gradient-move 12s ease-in-out infinite; }`}</style>
    </div>
  );
};

export default Chat;

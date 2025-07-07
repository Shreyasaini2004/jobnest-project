import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Video, Send } from "lucide-react";
// @ts-ignore
import io from "socket.io-client";

// Mock applicants
const applicants = [
  { id: "1", name: "Alice Smith" },
  { id: "2", name: "John Doe" },
  { id: "3", name: "Jane Lee" }
];

const socket = io("http://localhost:5001"); // Change to your backend URL

const EmployerMessages = () => {
  const [selectedApplicant, setSelectedApplicant] = useState(applicants[0]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit("joinRoom", selectedApplicant.id);
    socket.on("receiveMessage", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedApplicant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { sender: "employer", text: input, time: new Date().toLocaleTimeString() };
    socket.emit("sendMessage", { room: selectedApplicant.id, message: msg });
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto mt-6">
      {/* Applicants List */}
      <Card className="w-full md:w-64 flex-shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <MessageCircle className="h-5 w-5 text-indigo-400" /> Applicants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {applicants.map((app) => (
              <li key={app.id}>
                <Button
                  variant={selectedApplicant.id === app.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedApplicant(app)}
                >
                  {app.name}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {/* Chat Window */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            Chat with {selectedApplicant.name}
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => setShowVideo(true)}>
              <Video className="h-4 w-4 mr-1" /> Start Video Interview
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col h-[400px] overflow-y-auto bg-indigo-50 rounded-xl p-4">
          {messages.length === 0 ? (
            <div className="text-slate-400 text-center my-auto">No messages yet.</div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`mb-2 flex ${msg.sender === "employer" ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-xs ${msg.sender === "employer" ? "bg-indigo-500 text-white" : "bg-white text-indigo-700 border"}`}>
                  <div className="text-sm">{msg.text}</div>
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
      {/* Video Interview Modal (placeholder) */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-indigo-700">Video Interview with {selectedApplicant.name}</h2>
            <div className="w-full h-64 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 mb-4">
              [Video Call Placeholder]
            </div>
            <Button variant="outline" onClick={() => setShowVideo(false)}>End Call</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerMessages; 
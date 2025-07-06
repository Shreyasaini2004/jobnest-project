import React, { useState, useEffect } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import { io , Socket } from 'socket.io-client';

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
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [messageList, setMessageList] = useState<Message[]>([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const time = new Date();
      const formattedTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      const messageData: Message = {
        room: room,
        author: username,
        message: currentMessage,
        time: formattedTime,
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
  const handler = (data: Message) => {
    setMessageList((list) => [...list, data]);
  };
  socket.on("receive_message", handler);

  return () => {
    socket.off("receive_message", handler);
  };
}, [socket]);


  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, idx) => (
            <div className="message" id={username === messageContent.author ? "you" : "other"} key={idx}>
              <div className="message-content">
                <p>{messageContent.message}</p>
              </div>
              <div className="message-meta">
                <p id="time">{messageContent.author}</p>
                <p id="author">{messageContent.time}</p>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className='chat-footer'>
        <input
          type="text"
          placeholder="Type a message..."
          value={currentMessage}
          onChange={(event) => setCurrentMessage(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
};

export default Chat;

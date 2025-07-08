import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { socket } from '@/lib/socket';
import axios from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatRoom {
  roomId: string;
  partnerName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface JobSeeker {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const EmployerMessages = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');

  // Function to generate a unique room ID based on employer and job seeker IDs
  const generateRoomId = (employerId: string, jobSeekerId: string) => {
    // Sort IDs to ensure the same room ID regardless of who initiates
    const sortedIds = [employerId, jobSeekerId].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  // Fetch job seekers who have applied to this employer's jobs
  useEffect(() => {
    const fetchJobSeekers = async () => {
      if (!user || user.userType !== 'employer') return;
      
      try {
        // First get all jobs posted by this employer
        const jobsResponse = await axios.get(`/api/jobs/employer/${user._id}`);
        const jobs = jobsResponse.data;
        
        // Then get applications for each job
        const jobSeekerSet = new Set<string>();
        const jobSeekerDetails: JobSeeker[] = [];
        
        for (const job of jobs) {
          const applicationsResponse = await axios.get(`/api/applications/job/${job._id}`);
          const applications = applicationsResponse.data;
          
          for (const application of applications) {
            // Avoid duplicates
            if (!jobSeekerSet.has(application.jobSeeker._id)) {
              jobSeekerSet.add(application.jobSeeker._id);
              jobSeekerDetails.push({
                _id: application.jobSeeker._id,
                firstName: application.jobSeeker.firstName,
                lastName: application.jobSeeker.lastName,
                email: application.jobSeeker.email
              });
            }
          }
        }
        
        setJobSeekers(jobSeekerDetails);
      } catch (error) {
        console.error('Error fetching job seekers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobSeekers();
  }, [user]);

  // Connect to socket and listen for message history
  useEffect(() => {
    if (!user) return;
    
    // Connect to socket
    socket.connect();
    
    // Listen for message history to identify existing chat rooms
    socket.on('message_history', (history) => {
      if (history && history.length > 0) {
        // Extract room ID and partner info from the history
        const roomId = history[0].room;
        const messages = history;
        
        // Find the partner name (the one that's not the current user)
        const partnerMessage = messages.find(msg => msg.author !== user.name);
        const partnerName = partnerMessage ? partnerMessage.author : 'Unknown User';
        
        // Get the last message
        const lastMessage = messages[messages.length - 1];
        
        // Update chat rooms if this room isn't already in the list
        setChatRooms(prevRooms => {
          const roomExists = prevRooms.some(room => room.roomId === roomId);
          if (!roomExists) {
            return [...prevRooms, {
              roomId,
              partnerName,
              lastMessage: lastMessage.message,
              lastMessageTime: lastMessage.time
            }];
          }
          return prevRooms;
        });
      }
    });
    
    // Clean up on unmount
    return () => {
      socket.off('message_history');
      socket.disconnect();
    };
  }, [user]);

  // Function to start a new chat with a job seeker
  const startChat = (jobSeeker: JobSeeker) => {
    if (!user) return;
    
    const roomId = generateRoomId(user._id, jobSeeker._id);
    const partnerName = `${jobSeeker.firstName} ${jobSeeker.lastName}`;
    
    // Navigate to chat page
    navigate(`/chat?room=${roomId}&user=${encodeURIComponent(user.name)}&partnerName=${encodeURIComponent(partnerName)}`);
  };

  // Function to open an existing chat room
  const openChatRoom = (room: ChatRoom) => {
    if (!user) return;
    
    navigate(`/chat?room=${room.roomId}&user=${encodeURIComponent(user.name)}&partnerName=${encodeURIComponent(room.partnerName)}`);
  };

  // Filter job seekers based on search term
  const filteredJobSeekers = jobSeekers.filter(js => {
    const fullName = `${js.firstName} ${js.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || js.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter chat rooms based on search term
  const filteredChatRooms = chatRooms.filter(room => {
    return room.partnerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Search conversations or contacts..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'chats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('chats')}
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={18} />
            <span>Chats</span>
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'contacts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('contacts')}
        >
          <div className="flex items-center gap-2">
            <User size={18} />
            <span>Contacts</span>
          </div>
        </button>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'chats' ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">Recent Conversations</h2>
          
          {isLoading ? (
            // Loading skeletons for chat rooms
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredChatRooms.length > 0 ? (
            // List of chat rooms
            filteredChatRooms.map((room) => (
              <Card key={room.roomId} className="mb-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => openChatRoom(room)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {room.partnerName.split(' ').map(name => name[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium">{room.partnerName}</h3>
                        {room.lastMessage && (
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">{room.lastMessage}</p>
                        )}
                      </div>
                    </div>
                    {room.lastMessageTime && (
                      <span className="text-xs text-gray-400">{room.lastMessageTime}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No conversations found. Start a chat with a job applicant!</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">Job Applicants</h2>
          
          {isLoading ? (
            // Loading skeletons for contacts
            Array(5).fill(0).map((_, i) => (
              <Card key={i} className="mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[180px]" />
                        <Skeleton className="h-3 w-[120px]" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-[80px]" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredJobSeekers.length > 0 ? (
            // List of job seekers
            filteredJobSeekers.map((jobSeeker) => (
              <Card key={jobSeeker._id} className="mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                        {jobSeeker.firstName[0]}{jobSeeker.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-medium">{jobSeeker.firstName} {jobSeeker.lastName}</h3>
                        <p className="text-sm text-gray-500">{jobSeeker.email}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => startChat(jobSeeker)}>
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No job applicants found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployerMessages;
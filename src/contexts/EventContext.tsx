import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { eventApi } from '@/lib/api';

export interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'job-fair' | 'webinar';
  meetingLink?: string;
  description?: string;
}

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, event: Partial<Omit<Event, 'id'>>) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Sample initial events
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Career Fair 2023',
    date: new Date(Date.now() + 86400000 * 3), // 3 days from now
    type: 'job-fair',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    description: 'Join us for a virtual tech career fair with top companies.'
  },
  {
    id: '2',
    title: 'Resume Building Workshop',
    date: new Date(Date.now() + 86400000 * 5), // 5 days from now
    type: 'webinar',
    meetingLink: 'https://zoom.us/j/123456789',
    description: 'Learn how to create a standout resume that gets noticed.'
  },
  {
    id: '3',
    title: 'Healthcare Industry Insights',
    date: new Date(Date.now() + 86400000 * 7), // 7 days from now
    type: 'webinar',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/123',
    description: 'Discover career opportunities in the growing healthcare sector.'
  },
  {
    id: '4',
    title: 'Engineering Recruitment Day',
    date: new Date(Date.now() + 86400000 * 10), // 10 days from now
    type: 'job-fair',
    meetingLink: 'https://meet.google.com/xyz-abcd-efg',
    description: 'Connect with engineering firms looking for fresh talent.'
  },
  {
    id: '5',
    title: 'Interview Skills Masterclass',
    date: new Date(Date.now() + 86400000 * 12), // 12 days from now
    type: 'webinar',
    meetingLink: 'https://zoom.us/j/987654321',
    description: 'Master the art of interviewing with our expert panel.'
  }
];

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);

  // Load events from the API on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await eventApi.getEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    
    fetchEvents();
  }, []);

  const addEvent = async (event: Omit<Event, 'id'>) => {
    try {
      const newEvent = await eventApi.createEvent(event);
      setEvents(prevEvents => {
        const updatedEvents = [...prevEvents, newEvent];
        return updatedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      });
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const removeEvent = async (id: string) => {
    try {
      const success = await eventApi.deleteEvent(id);
      if (success) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
      }
    } catch (error) {
      console.error('Failed to remove event:', error);
    }
  };

  const updateEvent = async (id: string, updatedFields: Partial<Omit<Event, 'id'>>) => {
    try {
      const updatedEvent = await eventApi.updateEvent(id, updatedFields);
      if (updatedEvent) {
        setEvents(prevEvents => {
          const updatedEvents = prevEvents.map(event => 
            event.id === id ? updatedEvent : event
          );
          return updatedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
        });
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  return (
    <EventContext.Provider value={{ events, addEvent, removeEvent, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
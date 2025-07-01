// Mock API service for events

import { Event } from '@/contexts/EventContext';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API endpoints for events
export const eventApi = {
  // Get all events
  getEvents: async (): Promise<Event[]> => {
    // Simulate API call delay
    await delay(500);
    
    // Try to get events from localStorage
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      // Parse dates back to Date objects
      const events = JSON.parse(storedEvents, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
      });
      return events;
    }
    
    return [];
  },
  
  // Create a new event
  createEvent: async (event: Omit<Event, 'id'>): Promise<Event> => {
    // Simulate API call delay
    await delay(500);
    
    // Generate a new ID
    const newEvent: Event = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    // Get existing events
    const storedEvents = localStorage.getItem('events');
    const events: Event[] = storedEvents ? JSON.parse(storedEvents, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
    
    // Add new event
    events.push(newEvent);
    
    // Sort events by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Save to localStorage
    localStorage.setItem('events', JSON.stringify(events));
    
    return newEvent;
  },
  
  // Update an existing event
  updateEvent: async (id: string, eventUpdate: Partial<Omit<Event, 'id'>>): Promise<Event | null> => {
    // Simulate API call delay
    await delay(500);
    
    // Get existing events
    const storedEvents = localStorage.getItem('events');
    if (!storedEvents) return null;
    
    const events: Event[] = JSON.parse(storedEvents, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    });
    
    // Find the event to update
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) return null;
    
    // Update the event
    const updatedEvent: Event = {
      ...events[eventIndex],
      ...eventUpdate,
    };
    
    events[eventIndex] = updatedEvent;
    
    // Sort events by date if the date was updated
    if (eventUpdate.date) {
      events.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    
    // Save to localStorage
    localStorage.setItem('events', JSON.stringify(events));
    
    return updatedEvent;
  },
  
  // Delete an event
  deleteEvent: async (id: string): Promise<boolean> => {
    // Simulate API call delay
    await delay(500);
    
    // Get existing events
    const storedEvents = localStorage.getItem('events');
    if (!storedEvents) return false;
    
    const events: Event[] = JSON.parse(storedEvents, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    });
    
    // Filter out the event to delete
    const filteredEvents = events.filter(e => e.id !== id);
    
    // If no event was removed, return false
    if (filteredEvents.length === events.length) return false;
    
    // Save to localStorage
    localStorage.setItem('events', JSON.stringify(filteredEvents));
    
    return true;
  }
};
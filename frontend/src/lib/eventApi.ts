import axios from './axios';
import { Event } from '@/contexts/EventContext';

// Event API with real backend connections
export const eventApi = {
  // Get all events
  getEvents: async (): Promise<Event[]> => {
    try {
      const res = await axios.get('/api/events');
      // Convert date strings to Date objects
      return res.data.map((event: any) => ({ ...event, date: new Date(event.date) }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },
  
  // Get events created by the logged-in employer
  getMyEvents: async (): Promise<Event[]> => {
    try {
      const res = await axios.get('/api/events/mine');
      return res.data.map((event: any) => ({ ...event, date: new Date(event.date) }));
    } catch (error) {
      console.error('Error fetching my events:', error);
      return [];
    }
  },
  
  // Create a new event
  createEvent: async (event: Omit<Event, 'id'>): Promise<Event> => {
    try {
      const res = await axios.post('/api/events', event);
      return { ...res.data, date: new Date(res.data.date) };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  // Update an existing event
  updateEvent: async (id: string, eventUpdate: Partial<Omit<Event, 'id'>>): Promise<Event | null> => {
    try {
      const res = await axios.put(`/api/events/${id}`, eventUpdate);
      return { ...res.data, date: new Date(res.data.date) };
    } catch (error) {
      console.error('Error updating event:', error);
      return null;
    }
  },
  
  // Delete an event
  deleteEvent: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`/api/events/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }
};
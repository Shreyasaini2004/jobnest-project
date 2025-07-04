// API services for events and jobs

import { Event } from '@/contexts/EventContext';
import { Job } from '@/contexts/SavedJobsContext';
import { jobApi as realJobApi } from './realApi';
import { applicationApi as realApplicationApi } from './applicationApi';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock job data
const mockJobs: Job[] = [
  {
    id: "job1",
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    salary: "$120k - $160k",
    type: "Full-time",
    posted: "2 days ago",
    description: "Join our innovative team building next-generation web applications using React, TypeScript, and modern development practices.",
    skills: ["React", "TypeScript", "Redux", "Node.js", "GraphQL"],
    featured: true
  },
  {
    id: "job2",
    title: "UX/UI Designer",
    company: "DesignHub",
    location: "Remote",
    salary: "$90k - $120k",
    type: "Full-time",
    posted: "1 week ago",
    description: "Create beautiful, intuitive interfaces for web and mobile applications. Work with a collaborative team of designers and developers.",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "UI Design"],
    featured: true
  },
  {
    id: "job3",
    title: "DevOps Engineer",
    company: "CloudSystems",
    location: "Chicago, IL",
    salary: "$110k - $140k",
    type: "Full-time",
    posted: "3 days ago",
    description: "Manage our cloud infrastructure and CI/CD pipelines. Implement automation and ensure high availability of our services.",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    featured: true
  },
  {
    id: "job4",
    title: "Data Scientist",
    company: "AnalyticsPro",
    location: "Boston, MA",
    salary: "$130k - $170k",
    type: "Full-time",
    posted: "Just now",
    description: "Apply machine learning and statistical modeling to solve complex business problems. Work with large datasets and create actionable insights.",
    skills: ["Python", "Machine Learning", "SQL", "Data Visualization", "Statistics"],
    featured: false
  },
  {
    id: "job5",
    title: "Product Manager",
    company: "InnovateCo",
    location: "New York, NY",
    salary: "$115k - $150k",
    type: "Full-time",
    posted: "2 weeks ago",
    description: "Lead product development from conception to launch. Work with cross-functional teams to define product vision and roadmap.",
    skills: ["Product Strategy", "Agile", "User Stories", "Market Research", "Roadmapping"],
    featured: false
  },
  {
    id: "job6",
    title: "Backend Engineer",
    company: "ServerStack",
    location: "Seattle, WA",
    salary: "$125k - $155k",
    type: "Full-time",
    posted: "3 days ago",
    description: "Design and implement scalable backend services. Work with databases, APIs, and server-side technologies.",
    skills: ["Java", "Spring Boot", "PostgreSQL", "RESTful APIs", "Microservices"],
    featured: false
  },
  {
    id: "job7",
    title: "Frontend Developer",
    company: "WebWorks",
    location: "Austin, TX",
    salary: "$90k - $120k",
    type: "Contract",
    posted: "1 week ago",
    description: "Create responsive and interactive user interfaces using modern frontend technologies.",
    skills: ["JavaScript", "React", "CSS", "HTML", "Responsive Design"],
    featured: false
  },
  {
    id: "job8",
    title: "Mobile App Developer",
    company: "AppGenius",
    location: "Remote",
    salary: "$100k - $130k",
    type: "Part-time",
    posted: "5 days ago",
    description: "Develop native mobile applications for iOS and Android platforms. Focus on performance and user experience.",
    skills: ["Swift", "Kotlin", "Mobile UI Design", "API Integration", "App Store Deployment"],
    featured: false
  },
];

// API endpoints for jobs with fallback to mock data
export const jobApi = {
  // Get all jobs
  getJobs: async (): Promise<Job[]> => {
    try {
      return await realJobApi.getJobs();
    } catch (error) {
      console.error('Error using real API, falling back to mock data:', error);
      // Fallback to mock data
      await delay(500);
      return mockJobs;
    }
  },
  
  // Search jobs with filters
  searchJobs: async (searchTerm: string, jobType: string, location: string): Promise<Job[]> => {
    try {
      return await realJobApi.searchJobs(searchTerm, jobType, location);
    } catch (error) {
      console.error('Error using real API, falling back to mock data:', error);
      // Fallback to mock data
      await delay(700);
      
      return mockJobs.filter(job => {
        const matchesSearch = searchTerm ? (
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
        ) : true;
        
        const matchesType = jobType !== 'all' ? 
          job.type.toLowerCase() === jobType.toLowerCase() : true;
        
        const matchesLocation = location !== 'all' ? 
          job.location.toLowerCase().includes(location.toLowerCase()) : true;
        
        return matchesSearch && matchesType && matchesLocation;
      });
    }
  },
  
  // Get job by ID
  getJobById: async (id: string): Promise<Job | null> => {
    try {
      return await realJobApi.getJobById(id);
    } catch (error) {
      console.error('Error using real API, falling back to mock data:', error);
      // Fallback to mock data
      await delay(300);
      
      const job = mockJobs.find(job => job.id === id);
      return job || null;
    }
  },
  
  // Get featured jobs
  getFeaturedJobs: async (): Promise<Job[]> => {
    try {
      return await realJobApi.getFeaturedJobs();
    } catch (error) {
      console.error('Error using real API, falling back to mock data:', error);
      // Fallback to mock data
      await delay(400);
      
      return mockJobs.filter(job => job.featured);
    }
  },
  
  // Apply for a job
  applyForJob: async (jobId: string, application: any): Promise<boolean> => {
    try {
      return await realJobApi.applyForJob(jobId, application);
    } catch (error) {
      console.error('Error using real API, falling back to mock data:', error);
      // Fallback to mock data
      await delay(1000);
      
      // In a real app, this would send the application to the backend
      console.log(`Application submitted for job ${jobId}:`, application);
      
      // Simulate success
      return true;
    }
  },
  
  // Check if user has applied to a job
  checkJobApplication: async (jobId: string, jobSeekerId: string): Promise<{hasApplied: boolean, application: any}> => {
    try {
      return await realJobApi.checkJobApplication(jobId, jobSeekerId);
    } catch (error) {
      console.error('Error using real API, falling back to mock data:', error);
      // Fallback to mock data
      await delay(500);
      
      // Simulate not applied
      return { hasApplied: false, application: null };
    }
  },
  
  // Get all applications for a job seeker
  getJobSeekerApplications: async (jobSeekerId: string): Promise<any[]> => {
    try {
      return await realApplicationApi.getJobSeekerApplications(jobSeekerId);
    } catch (error) {
      console.error('Error using real API, falling back to mock data:', error);
      // Fallback to mock data
      await delay(500);
      
      // Simulate no applications
      return [];
    }
  }
};

// Default initial events (copied from EventContext)
const defaultInitialEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Career Fair 2023',
    date: new Date(Date.now() + 86400000 * 3),
    type: 'job-fair',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    description: 'Join us for a virtual tech career fair with top companies.'
  },
  {
    id: '2',
    title: 'Resume Building Workshop',
    date: new Date(Date.now() + 86400000 * 5),
    type: 'webinar',
    meetingLink: 'https://zoom.us/j/123456789',
    description: 'Learn how to create a standout resume that gets noticed.'
  },
  {
    id: '3',
    title: 'Healthcare Industry Insights',
    date: new Date(Date.now() + 86400000 * 7),
    type: 'webinar',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/123',
    description: 'Discover career opportunities in the growing healthcare sector.'
  },
  {
    id: '4',
    title: 'Engineering Recruitment Day',
    date: new Date(Date.now() + 86400000 * 10),
    type: 'job-fair',
    meetingLink: 'https://meet.google.com/xyz-abcd-efg',
    description: 'Connect with engineering firms looking for fresh talent.'
  },
  {
    id: '5',
    title: 'Interview Skills Masterclass',
    date: new Date(Date.now() + 86400000 * 12),
    type: 'webinar',
    meetingLink: 'https://zoom.us/j/987654321',
    description: 'Master the art of interviewing with our expert panel.'
  }
];

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
    // If not in localStorage, use defaultInitialEvents and save them
    localStorage.setItem('events', JSON.stringify(defaultInitialEvents));
    return defaultInitialEvents;
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
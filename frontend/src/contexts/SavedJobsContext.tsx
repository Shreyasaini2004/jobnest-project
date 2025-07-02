import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  description: string;
  skills: string[];
  featured?: boolean;
  deadline?: Date;
  reminderSet?: boolean;
}

interface SavedJobsContextType {
  savedJobs: Job[];
  saveJob: (job: Job) => void;
  removeJob: (id: string) => void;
  toggleReminder: (id: string, deadline?: Date) => void;
  isJobSaved: (id: string) => boolean;
}

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

export const SavedJobsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  // Load saved jobs from localStorage on component mount and when user changes
  useEffect(() => {
    if (user) {
      const storedJobs = localStorage.getItem(`savedJobs_${user.email}`);
      if (storedJobs) {
        const jobs = JSON.parse(storedJobs, (key, value) => {
          if (key === 'deadline' && value) return new Date(value);
          return value;
        });
        setSavedJobs(jobs);
      }
    } else {
      setSavedJobs([]);
    }
  }, [user]);

  // Save to localStorage whenever savedJobs changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`savedJobs_${user.email}`, JSON.stringify(savedJobs));
    }
  }, [savedJobs, user]);

  const saveJob = (job: Job) => {
    setSavedJobs(prevJobs => {
      // Check if job is already saved
      if (prevJobs.some(savedJob => savedJob.id === job.id)) {
        return prevJobs;
      }
      return [...prevJobs, job];
    });
  };

  const removeJob = (id: string) => {
    setSavedJobs(prevJobs => prevJobs.filter(job => job.id !== id));
  };

  const toggleReminder = (id: string, deadline?: Date) => {
    setSavedJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id === id) {
          return {
            ...job,
            reminderSet: !job.reminderSet,
            deadline: deadline || job.deadline
          };
        }
        return job;
      })
    );
  };

  const isJobSaved = (id: string): boolean => {
    return savedJobs.some(job => job.id === id);
  };

  return (
    <SavedJobsContext.Provider value={{ savedJobs, saveJob, removeJob, toggleReminder, isJobSaved }}>
      {children}
    </SavedJobsContext.Provider>
  );
};

export const useSavedJobs = (): SavedJobsContextType => {
  const context = useContext(SavedJobsContext);
  if (context === undefined) {
    throw new Error('useSavedJobs must be used within a SavedJobsProvider');
  }
  return context;
};
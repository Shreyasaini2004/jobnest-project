import { useState } from 'react';

interface ATSAnalysis {
  id: string;
  resumeFileName: string;
  jobDescription: string;
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: string[];
  date: Date;
}

export function useATSAnalysis() {
  const [analyses, setAnalyses] = useState<ATSAnalysis[]>([]);

  const saveAnalysis = (data: Omit<ATSAnalysis, 'id' | 'date'>) => {
    const newAnalysis: ATSAnalysis = {
      ...data,
      id: crypto.randomUUID(),
      date: new Date()
    };
    
    setAnalyses(prev => [...prev, newAnalysis]);
    
    // Save to localStorage for persistence
    const savedAnalyses = JSON.parse(localStorage.getItem('atsAnalyses') || '[]');
    savedAnalyses.push(newAnalysis);
    localStorage.setItem('atsAnalyses', JSON.stringify(savedAnalyses));
    
    return newAnalysis;
  };

  // Load analyses from localStorage on hook initialization
  const loadAnalyses = () => {
    try {
      const savedAnalyses = localStorage.getItem('atsAnalyses');
      if (savedAnalyses) {
        const parsed = JSON.parse(savedAnalyses);
        setAnalyses(parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load analyses from localStorage', error);
    }
    return [];
  };

  // Delete an analysis by ID
  const deleteAnalysis = (id: string) => {
    setAnalyses(prev => {
      const updated = prev.filter(analysis => analysis.id !== id);
      localStorage.setItem('atsAnalyses', JSON.stringify(updated));
      return updated;
    });
  };

  // Initialize with saved analyses
  useState(() => {
    loadAnalyses();
  });

  return {
    analyses,
    saveAnalysis,
    deleteAnalysis,
    loadAnalyses,
  };
}

import { createContext, useContext, useState, ReactNode } from 'react';

export interface SavedATSAnalysis {
  id: string;
  timestamp: Date;
  resumeFileName: string;
  jobDescription: string;
  score: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: string[];
}

interface ATSAnalysisContextType {
  savedAnalyses: SavedATSAnalysis[];
  saveAnalysis: (analysis: Omit<SavedATSAnalysis, 'id' | 'timestamp'>) => void;
  deleteAnalysis: (id: string) => void;
  getAnalysisById: (id: string) => SavedATSAnalysis | undefined;
}

const ATSAnalysisContext = createContext<ATSAnalysisContextType | undefined>(undefined);

export const useATSAnalysis = () => {
  const context = useContext(ATSAnalysisContext);
  if (context === undefined) {
    throw new Error('useATSAnalysis must be used within an ATSAnalysisProvider');
  }
  return context;
};

interface ATSAnalysisProviderProps {
  children: ReactNode;
}

export const ATSAnalysisProvider = ({ children }: ATSAnalysisProviderProps) => {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedATSAnalysis[]>([]);

  const saveAnalysis = (analysis: Omit<SavedATSAnalysis, 'id' | 'timestamp'>) => {
    const newAnalysis: SavedATSAnalysis = {
      ...analysis,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setSavedAnalyses(prev => [newAnalysis, ...prev]);
    
    // In a real app, save to localStorage or backend
    const existingAnalyses = JSON.parse(localStorage.getItem('ats-analyses') || '[]');
    const updatedAnalyses = [newAnalysis, ...existingAnalyses];
    localStorage.setItem('ats-analyses', JSON.stringify(updatedAnalyses));
  };

  const deleteAnalysis = (id: string) => {
    setSavedAnalyses(prev => prev.filter(analysis => analysis.id !== id));
    
    // In a real app, remove from localStorage or backend
    const existingAnalyses = JSON.parse(localStorage.getItem('ats-analyses') || '[]');
    const updatedAnalyses = existingAnalyses.filter((analysis: SavedATSAnalysis) => analysis.id !== id);
    localStorage.setItem('ats-analyses', JSON.stringify(updatedAnalyses));
  };

  const getAnalysisById = (id: string) => {
    return savedAnalyses.find(analysis => analysis.id === id);
  };

  // Load saved analyses from localStorage on mount
  useState(() => {
    const saved = localStorage.getItem('ats-analyses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedAnalyses(parsed.map((analysis: any) => ({
          ...analysis,
          timestamp: new Date(analysis.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load saved analyses:', error);
      }
    }
  });

  return (
    <ATSAnalysisContext.Provider value={{
      savedAnalyses,
      saveAnalysis,
      deleteAnalysis,
      getAnalysisById,
    }}>
      {children}
    </ATSAnalysisContext.Provider>
  );
}; 
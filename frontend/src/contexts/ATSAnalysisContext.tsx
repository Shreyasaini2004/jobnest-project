import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from '@/lib/axios';
import { useUser } from './UserContext';
import { useToast } from '@/hooks/use-toast';

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
  saveAnalysis: (analysis: Omit<SavedATSAnalysis, 'id' | 'timestamp'>) => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
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
  const { user } = useUser();
  const { toast } = useToast();

  // Fetch saved analyses from backend if logged in
  useEffect(() => {
    const fetchSaved = async () => {
      if (user && user._id) {
        try {
          const res = await axios.get('/api/ats/saved');
          setSavedAnalyses(res.data.analyses.map((a: any) => ({ ...a, id: a._id, timestamp: new Date(a.timestamp) })));
        } catch (err) {
          toast({ title: 'Failed to load saved analyses', variant: 'destructive' });
        }
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('ats-analyses');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setSavedAnalyses(parsed.map((analysis: any) => ({ ...analysis, timestamp: new Date(analysis.timestamp) })));
          } catch (error) {
            setSavedAnalyses([]);
          }
        } else {
          setSavedAnalyses([]);
        }
      }
    };
    fetchSaved();
  }, [user]);

  const saveAnalysis = async (analysis: Omit<SavedATSAnalysis, 'id' | 'timestamp'>) => {
    if (user && user._id) {
      try {
        const res = await axios.post('/api/ats/save', analysis);
        setSavedAnalyses(prev => [{ ...res.data.saved, id: res.data.saved._id, timestamp: new Date(res.data.saved.timestamp) }, ...prev]);
        toast({ title: 'Analysis saved to your account' });
      } catch (err) {
        toast({ title: 'Failed to save analysis', variant: 'destructive' });
      }
    } else {
      // Fallback to localStorage
      const newAnalysis: SavedATSAnalysis = {
        ...analysis,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      setSavedAnalyses(prev => [newAnalysis, ...prev]);
      const existingAnalyses = JSON.parse(localStorage.getItem('ats-analyses') || '[]');
      const updatedAnalyses = [newAnalysis, ...existingAnalyses];
      localStorage.setItem('ats-analyses', JSON.stringify(updatedAnalyses));
      toast({ title: 'Analysis saved locally (login to sync)' });
    }
  };

  const deleteAnalysis = async (id: string) => {
    if (user && user._id) {
      try {
        await axios.delete(`/api/ats/saved/${id}`);
        setSavedAnalyses(prev => prev.filter(a => a.id !== id));
        toast({ title: 'Analysis deleted' });
      } catch (err) {
        toast({ title: 'Failed to delete analysis', variant: 'destructive' });
      }
    } else {
      setSavedAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      const existingAnalyses = JSON.parse(localStorage.getItem('ats-analyses') || '[]');
      const updatedAnalyses = existingAnalyses.filter((analysis: SavedATSAnalysis) => analysis.id !== id);
      localStorage.setItem('ats-analyses', JSON.stringify(updatedAnalyses));
      toast({ title: 'Analysis deleted' });
    }
  };

  const getAnalysisById = (id: string) => {
    return savedAnalyses.find(analysis => analysis.id === id);
  };

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
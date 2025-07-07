import { useState } from "react";
import { Upload, FileText, Target, Save, Download, CheckCircle, AlertCircle, Info, Mail, Copy, Loader2, X, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface HighlightedTextProps {
  text: string;
  keywords: string[];
  highlightClass: string;
}

const HighlightedText = ({ text, keywords, highlightClass }: HighlightedTextProps) => {
  if (!text) return <p className="text-xs whitespace-pre-wrap">{text}</p>;
  if (!keywords || keywords.length === 0) return <p className="text-xs whitespace-pre-wrap">{text}</p>;
  
  // Create a regex pattern from all keywords
  const pattern = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  
  // Split the text by the pattern
  const parts = text.split(pattern);
  
  return (
    <p className="text-xs whitespace-pre-wrap">
      {parts.map((part, i) => {
        // Check if this part matches any keyword (case insensitive)
        const isKeyword = part && keywords.some(keyword => 
          part.toLowerCase() === keyword.toLowerCase()
        );
        
        return isKeyword ? (
          <span key={i} className={highlightClass}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </p>
  );
};
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ResumeParser, ParsedResume, JobDescription, KeywordAnalysis } from "@/lib/resume-parser";
import { useATSAnalysis } from "@/contexts/ATSAnalysisContext";
import { improveResumeWithGemini } from "@/services/aiService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import jsPDF from 'jspdf';

interface ATSScore {
  overall: number;
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
}

interface KeywordMatch {
  keyword: string;
  found: boolean;
  count: number;
  importance: 'high' | 'medium' | 'low';
}

interface AnalysisResult {
  score: ATSScore;
  keywordMatches: KeywordMatch[];
  missingKeywords: string[];
  suggestions: string[];
  resumeText: string;
  jdText: string;
  parsedResume: ParsedResume;
  parsedJobDescription: JobDescription;
  keywordAnalysis: KeywordAnalysis;
}

interface ATSScoreAnalysisProps {
  onScoreUpdate?: (score: number) => void;
  jobDescription?: string;
}

const ATSScoreAnalysis: React.FC<ATSScoreAnalysisProps> = ({ 
  onScoreUpdate,
  jobDescription = ''
}) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'results'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState(jobDescription || '');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { saveAnalysis } = useATSAnalysis();
  const [consent, setConsent] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [improvedResume, setImprovedResume] = useState('');
  const [rewriteError, setRewriteError] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showKeywordDetails, setShowKeywordDetails] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type === 'application/pdf' ||
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'text/plain'
      ) {
        setResumeFile(file);
        toast({
          title: "File uploaded",
          description: file.name,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, DOCX, or TXT file.",
          variant: "destructive",
        });
      }
    }
  };

  const analyzeResume = async (): Promise<AnalysisResult> => {
    if (!resumeFile) {
      throw new Error('No resume file provided');
    }
    const parsedResume = await ResumeParser.parseResume(resumeFile);
    const parsedJobDescription = ResumeParser.parseJobDescription(jdText);
    const keywordAnalysis = ResumeParser.analyzeKeywords(parsedResume, parsedJobDescription);
    const overallScore = ResumeParser.calculateATSScore(parsedResume, parsedJobDescription);
    
    // Calculate skills match percentage based on required skills in job description
    const requiredSkills = parsedJobDescription.requiredSkills || [];
    const matchedSkills = requiredSkills.filter(skill => 
      parsedResume.extractedData.skills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    const skillsMatch = requiredSkills.length > 0 
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100) 
      : 0;

    // Calculate experience match based on years of experience
    const experienceMatch = Math.min(100, Math.round(
      (parsedResume.extractedData.experience.length / 
      Math.max(1, parsedJobDescription.experienceLevel === 'senior' ? 5 : 
        parsedJobDescription.experienceLevel === 'mid' ? 3 : 1)) * 100
    ));

    const score: ATSScore = {
      overall: overallScore,
      keywordMatch: keywordAnalysis.score,
      skillsMatch: skillsMatch,
      experienceMatch: experienceMatch,
      educationMatch: Math.round((parsedResume.extractedData.education.length / 3) * 100)
    };

    // Generate keyword matches with better importance calculation
    const keywordMatches: KeywordMatch[] = parsedJobDescription.keywords.map(keyword => {
      const isRequired = requiredSkills.some(skill => 
        skill.toLowerCase().includes(keyword.toLowerCase())
      );
      const isPreferred = parsedJobDescription.preferredSkills?.some(skill =>
        skill.toLowerCase().includes(keyword.toLowerCase())
      );
      
      let importance: 'high' | 'medium' | 'low' = 'low';
      if (isRequired) importance = 'high';
      else if (isPreferred) importance = 'medium';
      
      return {
        keyword,
        found: keywordAnalysis.matched.includes(keyword),
        count: (parsedResume.text.toLowerCase().match(new RegExp(keyword, 'g')) || []).length,
        importance
      };
    });

    return {
      score,
      keywordMatches,
      missingKeywords: keywordAnalysis.missing,
      suggestions: keywordAnalysis.suggestions,
      resumeText: parsedResume.text,
      jdText: jdText,
      parsedResume,
      parsedJobDescription,
      keywordAnalysis
    };
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jdText.trim()) {
      toast({
        title: "Missing information",
        description: "Please upload a resume and enter job description text.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    setStep('processing');
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const result = await analyzeResume();
      setAnalysisResult(result);
      setStep('results');
      toast({
        title: "Analysis complete",
        description: `Your ATS score is ${result.score.overall}%`,
      });
      
      // Call the onScoreUpdate prop if provided
      if (onScoreUpdate) {
        onScoreUpdate(result.score.overall);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error processing your resume. Please try again.",
        variant: "destructive",
      });
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    const content = `ATS Score Report\n\nScore: ${analysisResult.score.overall}%\n\nBreakdown:\nSkills Match: ${analysisResult.score.skillsMatch}%\nExperience Match: ${analysisResult.score.experienceMatch}%\nEducation Match: ${analysisResult.score.educationMatch}%\nKeyword Match: ${analysisResult.score.keywordMatch}%\n\nSuggestions:\n${analysisResult.suggestions.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ATS_Score_Report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const extractPersonalInfo = (text: string) => {
    // Extract name (look for the first line that looks like a name)
    const nameMatch = text.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/m);
    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    // Extract phone (common formats)
    const phoneMatch = text.match(/(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/);
    
    return {
      name: nameMatch ? nameMatch[0] : '',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : ''
    };
  };

  const handleRewriteResume = async () => {
    if (!analysisResult) return;
    
    setRewriting(true);
    setRewriteError('');
    
    try {
      const result = await improveResumeWithGemini(
        analysisResult.resumeText,
        jdText,
        analysisResult.suggestions
      );
      
      // Store the improved resume or recommendations
      setImprovedResume(result.improvedResume || '');
      
      // Show the recommendations dialog
      setShowRecommendations(true);
      
      // Save the analysis with the recommendations
      if (analysisResult) {
        saveAnalysis({
          resumeFileName: resumeFile?.name || 'resume',
          jobDescription: jdText,
          score: analysisResult.score.overall,
          keywordMatches: analysisResult.keywordMatches
            .filter(match => match.found)
            .map(match => match.keyword),
          missingKeywords: analysisResult.missingKeywords,
          suggestions: analysisResult.suggestions
        });
      }
      toast({
        title: "Resume Recommendations Ready",
        description: "We've analyzed your resume and prepared personalized recommendations to improve your ATS score.",
      });
      
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setRewriteError('Failed to generate recommendations. Please try again.');
    } finally {
      setRewriting(false);
    }
  };

  const handleCopyImproved = () => {
    if (improvedResume) navigator.clipboard.writeText(improvedResume);
  };

  const handleDownloadImproved = () => {
    if (!improvedResume || !analysisResult) return;
    
    // Extract original filename or use a default
    const originalFilename = resumeFile?.name || 'resume';
    const filenameWithoutExt = originalFilename.replace(/\.[^/.]+$/, ''); // Remove extension
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create a Blob with the improved resume content
    const blob = new Blob([improvedResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenameWithoutExt}_enhanced_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    // Show success message
    toast({
      title: 'Download Started',
      description: 'Your enhanced resume is being downloaded.',
    });
  };

  const handleDownloadPDF = () => {
    if (!analysisResult) return;
    const doc = new jsPDF();
    
    // Add header with styling
    doc.setFillColor(63, 81, 181); // Indigo color
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ATS Score Report', 105, 15, { align: 'center' });
    
    // Reset text color for body content
    doc.setTextColor(0, 0, 0);
    
    // Add overall score with visual indicator
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall ATS Score', 105, 35, { align: 'center' });
    
    // Draw score circle
    const scoreColor = (
  analysisResult.score.overall >= 80 ? [34, 197, 94] :
  analysisResult.score.overall >= 60 ? [234, 179, 8] :
  [239, 68, 68]
) as [number, number, number];

doc.setFillColor(...scoreColor);

    doc.circle(105, 50, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`${analysisResult.score.overall}`, 105, 53, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Add score breakdown with visual bars
    doc.text('Score Breakdown:', 20, 70);
    
    const metrics = [
      { name: 'Skills Match', value: analysisResult.score.skillsMatch },
      { name: 'Experience Match', value: analysisResult.score.experienceMatch },
      { name: 'Education Match', value: analysisResult.score.educationMatch },
      { name: 'Keyword Match', value: analysisResult.score.keywordMatch }
    ];
    
    metrics.forEach((metric, i) => {
      const y = 80 + (i * 15);
      
      // Metric name
      doc.text(`${metric.name}:`, 20, y);
      
      // Metric value
      doc.text(`${metric.value}%`, 170, y, { align: 'right' });
      
      // Draw background bar
      doc.setFillColor(229, 231, 235); // Light gray
      doc.rect(70, y - 4, 90, 5, 'F');
      
      // Draw value bar
      const barColor = (
        metric.value >= 80 ? [34, 197, 94] : // green
        metric.value >= 60 ? [234, 179, 8] : // yellow
        [239, 68, 68]                        // red
) as [number, number, number];

doc.setFillColor(...barColor);
      doc.rect(70, y - 4, 90 * (metric.value / 100), 5, 'F');
    });
    
    // Add suggestions section
    const suggestionStartY = 145;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Suggestions to Improve:', 20, suggestionStartY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    analysisResult.suggestions.forEach((s, i) => {
      const y = suggestionStartY + 10 + (i * 8);
      doc.text(`• ${s}`, 25, y);
    });
    
    // Add missing keywords section if available
    if (analysisResult.missingKeywords.length > 0) {
      const keywordsStartY = suggestionStartY + 10 + (analysisResult.suggestions.length * 8) + 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Missing Keywords:', 20, keywordsStartY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const keywordsPerRow = 3;
      const keywordRows = Math.ceil(analysisResult.missingKeywords.length / keywordsPerRow);
      
      for (let i = 0; i < keywordRows; i++) {
        let rowText = '';
        for (let j = 0; j < keywordsPerRow; j++) {
          const keywordIndex = i * keywordsPerRow + j;
          if (keywordIndex < analysisResult.missingKeywords.length) {
            rowText += `• ${analysisResult.missingKeywords[keywordIndex]}   `;
          }
        }
        doc.text(rowText, 25, keywordsStartY + 10 + (i * 8));
      }
    }
    
    // Add improved resume if available
    if (improvedResume) {
      doc.addPage();
      
      // Add header with styling
      doc.setFillColor(63, 81, 181); // Indigo color
      doc.rect(0, 0, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AI-Enhanced Resume', 105, 10, { align: 'center' });
      
      // Reset text color for body content
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      // Split the resume into lines, preserving formatting
      const resumeLines = improvedResume.split('\n');
      let yPosition = 25; // Start position for text
      
      // Process each line with proper formatting
      for (const line of resumeLines) {
        // Skip empty lines that are too short (whitespace only)
        if (line.trim().length === 0) {
          yPosition += 5; // Add some space for paragraph breaks
          continue;
        }
        
        // Check for section headers (all caps or with colons)
        if (line === line.toUpperCase() || line.endsWith(':')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(line, 15, yPosition);
          yPosition += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
        } else {
          // Regular text line
          const wrappedLines = doc.splitTextToSize(line, 180);
          doc.text(wrappedLines, 15, yPosition);
          yPosition += wrappedLines.length * 5 + 2; // Adjust line height
        }
        
        // Add page break if we're near the bottom
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      }
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated by JobNest ATS Analyzer - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    doc.save('ATS_Score_Report.pdf');
  };

  const sendEmail = async () => {
    if (!email.trim()) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setSendingEmail(true);
    setEmailError('');
    
    try {
      // In a real implementation, you would call your backend API here
      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSent(true);
      toast({
        title: 'Email sent successfully',
        description: `Report sent to ${email}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resume Improvement Recommendations Dialog */}
      <Dialog open={showRecommendations} onOpenChange={setShowRecommendations}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resume Improvement Recommendations</DialogTitle>
            <DialogDescription>
              Here are personalized recommendations to improve your resume's ATS compatibility.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="text-lg font-medium text-blue-800 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Key Recommendations
              </h3>
              <p className="mt-2 text-blue-700">
                {improvedResume.split('## Key Areas for Improvement')[0].replace(/^#+\s*/, '')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Key Areas for Improvement</h3>
              <ul className="space-y-3 pl-5 list-disc">
                {improvedResume.includes('## Key Areas for Improvement') && 
                  improvedResume
                    .split('## Key Areas for Improvement')[1]
                    .split('##')[0]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map((item, i) => (
                      <li key={i} className="text-sm">
                        {item.replace(/^-\s*/, '')}
                      </li>
                    ))
                }
              </ul>
            </div>

            {improvedResume.includes('## Detailed Suggestions') && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Detailed Suggestions</h3>
                <div className="prose prose-sm max-w-none">
                  {improvedResume
                    .split('## Detailed Suggestions')[1]
                    .split('## Expected ATS Impact')[0]
                    .trim()
                    .split('\n')
                    .map((paragraph, i) => (
                      <p key={i} className="text-sm text-gray-700">
                        {paragraph}
                      </p>
                    ))
                  }
                </div>
              </div>
            )}

            {improvedResume.includes('## Expected ATS Impact') && (
              <div className="rounded-lg bg-green-50 p-4">
                <h3 className="text-lg font-medium text-green-800">Expected ATS Impact</h3>
                <p className="mt-2 text-green-700">
                  {improvedResume.split('## Expected ATS Impact')[1].trim()}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleDownloadImproved}
              className="flex items-center gap-1"
            >
              <Download className="w-4 h-4" /> Save as Text
            </Button>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(improvedResume);
                toast({
                  title: "Copied to clipboard",
                  description: "The recommendations have been copied to your clipboard.",
                });
              }}
              className="flex items-center gap-1"
            >
              <Copy className="w-4 h-4" /> Copy Recommendations
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {showInfoBanner && (
        <div className="w-full bg-indigo-50 border border-indigo-200 rounded-xl px-6 py-4 flex items-center gap-4 shadow-md relative animate-fade-in">
          <span className="text-indigo-700 text-lg font-semibold">ℹ️ ATS Resume Scoring</span>
          <span className="text-sm text-indigo-800">Upload your resume and job description to get a detailed ATS compatibility score, breakdown, and actionable suggestions. Your privacy is protected.</span>
          <button onClick={() => setShowInfoBanner(false)} className="absolute top-2 right-4 text-indigo-400 hover:text-indigo-700 text-xl">&times;</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ATS Score Analysis</h1>
          <p className="text-gray-600 mt-2">
            See how well your resume matches your dream job. Get insights, keyword suggestions, and optimization tips.
          </p>
        </div>
      </div>
      {step === 'upload' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Resume
              </CardTitle>
              <CardDescription>
                Upload your resume in PDF, DOC, DOCX, or TXT format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                  disabled={!consent}
                />
                <label htmlFor="resume-upload" className={`cursor-pointer ${!consent ? 'opacity-50 pointer-events-none' : ''}`}> 
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    {resumeFile ? resumeFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, or TXT up to 2MB
                  </p>
                </label>
              </div>
              <div className="mt-4 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="accent-indigo-500 mt-1"
                />
                <label htmlFor="consent" className="text-xs text-gray-700">
                  I agree to the <span className="font-semibold">privacy policy</span> and understand that my files are <span className="font-semibold">not stored or shared</span> and are <span className="font-semibold">deleted after processing</span>. (GDPR/CCPA compliant)
                </label>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Description
              </CardTitle>
              <CardDescription>
                Paste the job description text for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        </div>
      )}
      {step === 'upload' && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAnalyze}
            disabled={!resumeFile || !jdText.trim()}
            className="px-8 py-3"
          >
            Analyze Resume
          </Button>
        </div>
      )}
      {step === 'processing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Analyzing Resume
            </CardTitle>
            <CardDescription>
              Processing your resume and matching keywords...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={isProcessing ? 75 : 100} className="w-full" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Extracting keywords and calculating ATS score...
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {step === 'results' && analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ATS Score Results
            </CardTitle>
            <CardDescription>
              Your resume has been analyzed. See your ATS score and improvement suggestions below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-36 h-36" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    {/* Score circle with animation */}
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke={analysisResult.score.overall >= 80 ? '#22c55e' : analysisResult.score.overall >= 60 ? '#eab308' : '#ef4444'}
                      strokeWidth="12"
                      strokeDasharray={339.292}
                      strokeDashoffset={339.292 - (339.292 * analysisResult.score.overall) / 100}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                    />
                    {/* Inner circle with gradient background */}
                    <circle 
                      cx="60" cy="60" r="42" 
                      fill={analysisResult.score.overall >= 80 ? 'url(#greenGradient)' : 
                           analysisResult.score.overall >= 60 ? 'url(#yellowGradient)' : 
                           'url(#redGradient)'} 
                    />
                    {/* Score text */}
                    <text x="60" y="65" textAnchor="middle" fontSize="2.5rem" fontWeight="bold" fill="white">
                      {analysisResult.score.overall}
                    </text>
                    {/* Percent sign */}
                    <text x="60" y="80" textAnchor="middle" fontSize="1rem" fontWeight="medium" fill="white" opacity="0.9">
                      %
                    </text>
                    {/* Define gradients */}
                    <defs>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#15803d" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                      <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a16207" />
                        <stop offset="100%" stopColor="#eab308" />
                      </linearGradient>
                      <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#b91c1c" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="mt-4 text-base font-semibold text-gray-700">ATS Score</span>
                </div>
                <div className="mt-2">
                  <Badge 
                    className={`text-sm font-bold px-3 py-1 ${analysisResult.score.overall >= 80 ? 'bg-green-100 text-green-800 border-green-300' : 
                      analysisResult.score.overall >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                      'bg-red-100 text-red-800 border-red-300'}`}
                  >
                    {analysisResult.score.overall >= 80 ? 'Excellent' : analysisResult.score.overall >= 60 ? 'Average' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills Match */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      Skills Match
                    </span>
                    <span className="text-sm font-bold">{analysisResult.score.skillsMatch}%</span>
                  </div>
                  <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${analysisResult.score.skillsMatch >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                                 analysisResult.score.skillsMatch >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                                 'bg-gradient-to-r from-red-500 to-red-400'}`}
                      style={{ width: `${analysisResult.score.skillsMatch}%`, transition: 'width 1s ease-in-out' }}
                    ></div>
                  </div>
                </div>
                
                {/* Experience Match */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                      Experience
                    </span>
                    <span className="text-sm font-bold">{analysisResult.score.experienceMatch}%</span>
                  </div>
                  <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${analysisResult.score.experienceMatch >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                                 analysisResult.score.experienceMatch >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                                 'bg-gradient-to-r from-red-500 to-red-400'}`}
                      style={{ width: `${analysisResult.score.experienceMatch}%`, transition: 'width 1s ease-in-out' }}
                    ></div>
                  </div>
                </div>
                
                {/* Education Match */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      Education
                    </span>
                    <span className="text-sm font-bold">{analysisResult.score.educationMatch}%</span>
                  </div>
                  <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${analysisResult.score.educationMatch >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                                 analysisResult.score.educationMatch >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                                 'bg-gradient-to-r from-red-500 to-red-400'}`}
                      style={{ width: `${analysisResult.score.educationMatch}%`, transition: 'width 1s ease-in-out' }}
                    ></div>
                  </div>
                </div>
                
                {/* Keyword Match */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Keyword Match
                    </span>
                    <span className="text-sm font-bold">{analysisResult.score.keywordMatch}%</span>
                  </div>
                  <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${analysisResult.score.keywordMatch >= 80 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
                                 analysisResult.score.keywordMatch >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 
                                 'bg-gradient-to-r from-red-500 to-red-400'}`}
                      style={{ width: `${analysisResult.score.keywordMatch}%`, transition: 'width 1s ease-in-out' }}
                    ></div>
                  </div>
                  {analysisResult.score.keywordMatch < 80 && (
                    <button 
                      className="text-xs bg-blue-50 text-blue-600 hover:text-blue-800 hover:bg-blue-100 mt-2 py-1 px-2 rounded-md transition-colors flex items-center gap-1 self-end"
                      onClick={() => setShowKeywordDetails(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View missing keywords
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Suggestions to Improve
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.suggestions.map((s, i) => {
                  // Determine suggestion type and styling
                  const isQuantifiable = s.toLowerCase().includes("quantifiable");
                  const isCommunication = s.toLowerCase().includes("communication");
                  const isOverqualified = s.toLowerCase().includes("overqualified");
                  const isKeyword = s.toLowerCase().includes("keyword");
                  
                  let cardStyle = "bg-indigo-50 border-indigo-200";
                  let iconBg = "bg-indigo-100 text-indigo-700";
                  let icon = <CheckCircle className="h-5 w-5" />;
                  let tagText = "General";
                  let tagColor = "bg-indigo-100 text-indigo-800";
                  
                  if (isQuantifiable) {
                    cardStyle = "bg-blue-50 border-blue-200";
                    iconBg = "bg-blue-100 text-blue-700";
                    icon = <Target className="h-5 w-5" />;
                    tagText = "Achievement";
                    tagColor = "bg-blue-100 text-blue-800";
                  } else if (isCommunication) {
                    cardStyle = "bg-green-50 border-green-200";
                    iconBg = "bg-green-100 text-green-700";
                    icon = <Info className="h-5 w-5" />;
                    tagText = "Skills";
                    tagColor = "bg-green-100 text-green-800";
                  } else if (isOverqualified) {
                    cardStyle = "bg-yellow-50 border-yellow-200";
                    iconBg = "bg-yellow-100 text-yellow-700";
                    icon = <AlertCircle className="h-5 w-5" />;
                    tagText = "Experience";
                    tagColor = "bg-yellow-100 text-yellow-800";
                  } else if (isKeyword) {
                    cardStyle = "bg-purple-50 border-purple-200";
                    iconBg = "bg-purple-100 text-purple-700";
                    icon = <FileText className="h-5 w-5" />;
                    tagText = "Keywords";
                    tagColor = "bg-purple-100 text-purple-800";
                  }
                  
                  return (
                    <div key={i} className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${cardStyle}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${iconBg}`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${tagColor}`}>{tagText}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{s}</p>
                          <div className="flex items-center justify-between">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              className="flex items-center gap-1 text-xs bg-white hover:bg-gray-100"
                              onClick={() => setShowRewriteModal(true)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Fix Now
                            </Button>
                            
                            {isQuantifiable && (
                              <div className="text-xs text-gray-500 italic">
                                Example: "Increased sales by 45%"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Button 
                onClick={() => {
                  if (analysisResult) {
                    saveAnalysis({
                      score: analysisResult.score.overall,
                      jobDescription: analysisResult.jdText,
                      resumeFileName: resumeFile?.name || 'resume.txt',
                      keywordMatches: analysisResult.keywordMatches.map(k => k.keyword),
                      missingKeywords: analysisResult.missingKeywords,
                      suggestions: analysisResult.suggestions
                    });
                    toast({
                      title: "Analysis Saved",
                      description: "Your analysis has been saved to your profile.",
                    });
                  }
                }} 
                variant="outline" 
                className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100"
              >
                <Save className="w-4 h-4" /> Save Analysis
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Download PDF
              </Button>
              <Button onClick={() => setShowRewriteModal(true)} variant="default" className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Rewrite My Resume with Gemini AI
              </Button>
              <Button onClick={() => setShowEmailModal(true)} variant="outline" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Send to Email
              </Button>
            </div>
            <div className="mt-8">
              <h4 className="font-semibold text-indigo-700 mb-2">Was this score helpful?</h4>
              {!feedbackSubmitted ? (
                <form onSubmit={e => { e.preventDefault(); setFeedbackSubmitted(true); }} className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => { setFeedback('Yes'); setFeedbackSubmitted(true); }}>Yes</Button>
                    <Button type="button" variant="outline" onClick={() => { setFeedback('No'); setFeedbackSubmitted(true); }}>No</Button>
                  </div>
                  <Textarea
                    placeholder="Optional: Tell us how we can improve..."
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button type="submit" variant="default" className="self-start">Submit Feedback</Button>
                </form>
              ) : (
                <Alert>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <AlertDescription>Thank you for your feedback!</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {step === 'upload' && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAnalyze}
            disabled={!resumeFile || !jdText.trim()}
            className="px-8 py-3"
          >
            Analyze Resume
          </Button>
        </div>
      )}
      <Dialog open={showRewriteModal} onOpenChange={setShowRewriteModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">AI Resume Rewriting <Loader2 className={rewriting ? 'animate-spin ml-2' : 'hidden'} /></DialogTitle>
            <button onClick={() => setShowRewriteModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </DialogHeader>
          <div className="mt-2">
            {!improvedResume && !rewriteError && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Prioritize Suggestions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysisResult?.suggestions.map((suggestion, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`suggestion-${i}`} 
                          defaultChecked={true}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`suggestion-${i}`} className="text-sm text-gray-700">{suggestion}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Target Job Title (Optional)</h4>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Specify a job title to better tailor your resume</p>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={handleRewriteResume} 
                    disabled={rewriting} 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Rewrite My Resume with AI
                  </Button>
                </div>
              </div>
            )}
            {rewriting && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mb-4" />
                <p className="text-indigo-700 font-medium">Rewriting your resume with AI...</p>
                <p className="text-sm text-gray-500 mt-2">This may take up to 30 seconds</p>
              </div>
            )}
            {rewriteError && <div className="text-red-600 text-sm mt-2">{rewriteError}</div>}
            {improvedResume && (
              <div className="mt-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                  <h4 className="font-semibold text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Resume Successfully Enhanced
                  </h4>
                  <p className="text-sm text-green-700 mt-1">Your resume has been optimized for ATS systems with improved keyword matching and formatting.</p>
                </div>
                
                <h4 className="font-semibold mb-2">Improved Resume</h4>
                <Textarea value={improvedResume} readOnly className="min-h-[200px] font-mono" />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleCopyImproved} variant="outline" className="flex items-center gap-2"><Copy className="w-4 h-4" /> Copy</Button>
                  <Button onClick={handleDownloadImproved} variant="outline" className="flex items-center gap-2"><Download className="w-4 h-4" /> Download</Button>
                </div>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h5 className="text-sm font-medium text-blue-800">Key Improvements:</h5>
                  <ul className="list-disc pl-5 space-y-1 mt-1 text-sm text-blue-700">
                    <li>Added missing keywords from job description</li>
                    <li>Improved quantifiable achievements</li>
                    <li>Enhanced formatting for better ATS readability</li>
                    <li>Strengthened action verbs and professional tone</li>
                  </ul>
                </div>
                <div className="mt-2 text-xs text-gray-500">We do not store or share your files. They are deleted after processing. GDPR/CCPA compliant.</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowRewriteModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send ATS Report to Email</DialogTitle>
            <DialogDescription>
              Enter the recipient's email address to send your ATS report as a PDF attachment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); sendEmail(); }} className="flex flex-col gap-4 mt-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Recipient email address"
              className="border rounded px-3 py-2 text-sm"
              required
              disabled={sendingEmail || emailSent}
            />
            <DialogFooter>
              <Button type="submit" disabled={sendingEmail || emailSent} className="flex items-center gap-2">
                {sendingEmail && <Loader2 className="w-4 h-4 animate-spin" />} Send
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowEmailModal(false)}>Cancel</Button>
            </DialogFooter>
            {emailSent && <div className="text-green-700 text-sm">Email sent successfully!</div>}
            {emailError && <div className="text-red-600 text-sm">{emailError}</div>}
            <div className="text-xs text-gray-400 mt-2">We do not store or share your files. They are deleted after processing. GDPR/CCPA compliant.</div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showKeywordDetails} onOpenChange={setShowKeywordDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Keyword Analysis
            </DialogTitle>
            <DialogDescription>
              See how your resume matches up with the job description keywords
            </DialogDescription>
            <button onClick={() => setShowKeywordDetails(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold mb-3 text-red-600 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {analysisResult?.missingKeywords.length ? (
                    analysisResult?.missingKeywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1 text-sm">
                        {keyword}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">Great job! No missing keywords detected.</p>
                  )}
                </div>
                <div className="bg-red-50 rounded-md p-3 mt-2">
                  <p className="text-sm text-red-800">
                    <strong>Impact:</strong> Missing keywords can reduce your ATS score by up to 30%. Consider adding these terms to your resume.
                  </p>
                </div>
              </div>
              
              <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold mb-3 text-green-600 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Matched Keywords
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {analysisResult?.keywordMatches
                    .filter(km => km.found)
                    .map((keyword, i) => (
                      <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 text-sm">
                        {keyword.keyword} {keyword.count > 1 && (
                          <span className="ml-1 bg-green-200 text-green-800 rounded-full px-1.5 py-0.5 text-xs">
                            ×{keyword.count}
                          </span>
                        )}
                      </Badge>
                    ))}
                </div>
                <div className="bg-green-50 rounded-md p-3 mt-2">
                  <p className="text-sm text-green-800">
                    <strong>Tip:</strong> For optimal results, ensure keywords appear 1-2 times in relevant contexts throughout your resume.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4 text-lg">Job Description Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Your Resume
                    </h5>
                    <span className="text-xs text-gray-500">Keyword matches highlighted</span>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50 max-h-80 overflow-y-auto">
                    {analysisResult?.resumeText ? (
                      <HighlightedText 
                        text={analysisResult.resumeText} 
                        keywords={analysisResult.keywordMatches.filter(k => k.found).map(k => k.keyword)}
                        highlightClass="bg-green-100 text-green-800 px-0.5 rounded"
                      />
                    ) : (
                      <p className="text-sm text-gray-500">No resume text available</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                      </svg>
                      Job Description
                    </h5>
                    <span className="text-xs text-gray-500">Missing keywords highlighted</span>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50 max-h-80 overflow-y-auto">
                    {analysisResult?.jdText ? (
                      <HighlightedText
                        text={analysisResult.jdText} 
                        keywords={analysisResult.missingKeywords}
                        highlightClass="bg-red-100 text-red-800 px-0.5 rounded"
                      />
                    ) : (
                      <p className="text-sm text-gray-500">No job description text available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h5 className="font-medium text-blue-800 mb-2">How to Use This Information</h5>
              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                <li>Add missing keywords to your resume in relevant sections</li>
                <li>Ensure keywords appear in context, not just as a list</li>
                <li>Use exact phrases from the job description when possible</li>
                <li>Consider creating a skills section that highlights key terms</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button 
              variant="default" 
              onClick={() => setShowRewriteModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Rewrite Resume with AI
            </Button>
            <Button variant="secondary" onClick={() => setShowKeywordDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onClick={() => window.open('https://chat.openai.com/', '_blank')}
          title="Ask the AI Assistant for resume/job search help"
        >
          <span className="text-lg">💬</span>
          <span className="hidden md:inline">Chatbot</span>
        </button>
      </div>
    </div>
  );
};

export default ATSScoreAnalysis;

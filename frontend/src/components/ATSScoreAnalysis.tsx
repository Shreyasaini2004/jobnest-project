import { useState } from "react";
import { Upload, FileText, Target, Save, Download, CheckCircle, AlertCircle, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ResumeParser, ParsedResume, JobDescription, KeywordAnalysis } from "@/lib/resume-parser";
import { useATSAnalysis } from "@/contexts/ATSAnalysisContext";
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Copy, Loader2, X } from 'lucide-react';
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

const ATSScoreAnalysis = () => {
  const [step, setStep] = useState<'upload' | 'processing' | 'results'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'text/plain') {
        setResumeFile(file);
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded.`,
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

    // Parse resume using the ResumeParser service
    const parsedResume = await ResumeParser.parseResume(resumeFile);
    
    // Parse job description
    const parsedJobDescription = ResumeParser.parseJobDescription(jdText);
    
    // Analyze keywords
    const keywordAnalysis = ResumeParser.analyzeKeywords(parsedResume, parsedJobDescription);
    
    // Calculate comprehensive ATS score
    const overallScore = ResumeParser.calculateATSScore(parsedResume, parsedJobDescription);
    
    // Create detailed score breakdown
    const score: ATSScore = {
      overall: overallScore,
      keywordMatch: keywordAnalysis.score,
      skillsMatch: Math.round((parsedResume.extractedData.skills.length / Math.max(parsedJobDescription.keywords.length, 1)) * 100),
      experienceMatch: Math.round((parsedResume.extractedData.experience.length / 5) * 100),
      educationMatch: Math.round((parsedResume.extractedData.education.length / 3) * 100)
    };

    // Create keyword matches for display
    const keywordMatches: KeywordMatch[] = parsedJobDescription.keywords.map(keyword => ({
      keyword,
      found: keywordAnalysis.matched.includes(keyword),
      count: (parsedResume.text.toLowerCase().match(new RegExp(keyword, 'g')) || []).length,
      importance: Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
    }));

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
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await analyzeResume();
      setAnalysisResult(result);
      setStep('results');
      
      toast({
        title: "Analysis complete",
        description: `Your ATS score is ${result.score.overall}%`,
      });
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

  const handleSaveToDashboard = () => {
    if (!analysisResult || !resumeFile) return;

    saveAnalysis({
      resumeFileName: resumeFile.name,
      jobDescription: jdText,
      score: analysisResult.score.overall,
      keywordMatches: analysisResult.keywordAnalysis.matched,
      missingKeywords: analysisResult.keywordAnalysis.missing,
      suggestions: analysisResult.keywordAnalysis.suggestions,
    });

    toast({
      title: "Saved to dashboard",
      description: "Your analysis has been saved to your dashboard.",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const renderScoreBreakdown = () => {
    if (!analysisResult) return null;

    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Overall ATS Score</h3>
              <p className="text-sm text-gray-600 mt-1">
                Based on skills match, experience, education, format, and role fit
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(analysisResult.score.overall)}`}>
                {analysisResult.score.overall}%
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {analysisResult.score.overall >= 80 ? 'Excellent' : 
                 analysisResult.score.overall >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Skills Match */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Skills Match</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Required Skills:</span>
                <span className="text-sm font-medium">
                  {analysisResult.keywordAnalysis.requiredSkillsMatched}/{analysisResult.keywordAnalysis.totalRequiredSkills}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Preferred Skills:</span>
                <span className="text-sm font-medium">
                  {analysisResult.keywordAnalysis.preferredSkillsMatched}/{analysisResult.keywordAnalysis.totalPreferredSkills}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (analysisResult.keywordAnalysis.requiredSkillsMatched / Math.max(analysisResult.keywordAnalysis.totalRequiredSkills, 1)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Role Fit Analysis */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Role Fit Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Resume Persona:</span>
                <span className="text-sm font-medium capitalize text-blue-600">
                  {analysisResult.keywordAnalysis.rolePersona}
                </span>
              </div>
              {analysisResult.keywordAnalysis.softSkillsMatched.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Soft Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysisResult.keywordAnalysis.softSkillsMatched.slice(0, 3).map((skill, index) => (
                      <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {analysisResult.keywordAnalysis.softSkillsMatched.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{analysisResult.keywordAnalysis.softSkillsMatched.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contextual Skills Analysis */}
        {analysisResult.keywordAnalysis.contextualSkills.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Skills Context Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['skills_section', 'experience_section', 'projects_section', 'summary_section'].map(section => {
                const skillsInSection = analysisResult.keywordAnalysis.contextualSkills.filter(s => s.context === section);
                if (skillsInSection.length === 0) return null;
                
                return (
                  <div key={section} className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 capitalize">
                      {section.replace('_', ' ')} ({skillsInSection.length})
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {skillsInSection.slice(0, 4).map((skillInfo, index) => (
                        <span 
                          key={index} 
                          className={`text-xs px-2 py-1 rounded ${
                            skillInfo.weight >= 3 ? 'bg-purple-100 text-purple-800' :
                            skillInfo.weight >= 2 ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                          title={`Weight: ${skillInfo.weight}`}
                        >
                          {skillInfo.skill}
                        </span>
                      ))}
                      {skillsInSection.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{skillsInSection.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Feedback */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Detailed Feedback & Suggestions</h4>
          <div className="space-y-3">
            {analysisResult.keywordAnalysis.feedback.map((feedback, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  feedback.includes('Critical') ? 'bg-red-500' :
                  feedback.includes('Missing') ? 'bg-orange-500' :
                  feedback.includes('bonus') ? 'bg-green-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        {analysisResult.keywordAnalysis.suggestions.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-gray-900 mb-3">Improvement Suggestions</h4>
            <ul className="space-y-2">
              {analysisResult.keywordAnalysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Download score report as text (simple version, can be improved to PDF)
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

  const handleRewriteResume = async () => {
    if (!analysisResult) return;
    setRewriting(true);
    setRewriteError('');
    setImprovedResume('');
    try {
      const res = await axios.post('/api/ats/improve', {
        resumeText: analysisResult.resumeText,
        suggestions: analysisResult.suggestions
      });
      setImprovedResume(res.data.improved);
    } catch (err) {
      setRewriteError('AI resume rewriting failed. Please try again.');
    } finally {
      setRewriting(false);
    }
  };

  const handleCopyImproved = () => {
    if (improvedResume) navigator.clipboard.writeText(improvedResume);
  };

  const handleDownloadImproved = () => {
    if (!improvedResume) return;
    const blob = new Blob([improvedResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Improved_Resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF export handler
  const handleDownloadPDF = () => {
    if (!analysisResult) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('ATS Score Report', 14, 18);
    doc.setFontSize(12);
    doc.text(`Score: ${analysisResult.score.overall}%`, 14, 30);
    doc.text('Breakdown:', 14, 40);
    doc.text(`Skills Match: ${analysisResult.score.skillsMatch}%`, 20, 48);
    doc.text(`Experience Match: ${analysisResult.score.experienceMatch}%`, 20, 56);
    doc.text(`Education Match: ${analysisResult.score.educationMatch}%`, 20, 64);
    doc.text(`Keyword Match: ${analysisResult.score.keywordMatch}%`, 20, 72);
    doc.text('Suggestions:', 14, 84);
    analysisResult.suggestions.forEach((s, i) => {
      doc.text(`- ${s}`, 20, 92 + i * 8);
    });
    if (improvedResume) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Improved Resume (AI)', 14, 18);
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(improvedResume, 180);
      doc.text(lines, 14, 30);
    }
    doc.save('ATS_Score_Report.pdf');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    setEmailError('');
    setEmailSent(false);
    try {
      await axios.post('/api/ats/email', {
        to: email,
        analysis: {
          score: analysisResult?.score.overall,
          skillsMatch: analysisResult?.score.skillsMatch,
          experienceMatch: analysisResult?.score.experienceMatch,
          educationMatch: analysisResult?.score.educationMatch,
          keywordMatch: analysisResult?.score.keywordMatch,
          suggestions: analysisResult?.suggestions
        },
        improvedResume
      });
      setEmailSent(true);
    } catch (err: any) {
      console.error('Email sending error:', err);
      // Display more specific error messages based on server response
      if (err.response) {
        // Server responded with an error
        if (err.response.status === 503) {
          setEmailError('Email service is not configured. Please contact support.');
        } else if (err.response.data && err.response.data.message) {
          setEmailError(err.response.data.message);
        } else {
          setEmailError(`Server error (${err.response.status}): Please try again later.`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setEmailError('No response from server. Please check your connection and try again.');
      } else {
        // Error in setting up the request
        setEmailError('Failed to send email. Please try again.');
      }
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Onboarding/info banner */}
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
            Upload your resume and job description to get an ATS compatibility score
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
              {/* Privacy disclaimer and consent */}
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
            {/* ATS Score Meter */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-32 h-32" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke={analysisResult.score.overall >= 80 ? '#22c55e' : analysisResult.score.overall >= 60 ? '#eab308' : '#ef4444'}
                      strokeWidth="12"
                      strokeDasharray={339.292}
                      strokeDashoffset={339.292 - (339.292 * analysisResult.score.overall) / 100}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s' }}
                    />
                    <text x="60" y="68" textAnchor="middle" fontSize="2.5rem" fontWeight="bold" fill="#111827">
                      {analysisResult.score.overall}
                    </text>
                  </svg>
                  <span className="mt-2 text-sm font-semibold text-gray-700">ATS Score</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">{analysisResult.score.overall >= 80 ? 'Excellent' : analysisResult.score.overall >= 60 ? 'Average' : 'Needs Improvement'}</div>
              </div>
              {/* Score Breakdown */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-indigo-700">{analysisResult.score.skillsMatch}%</span>
                  <span className="text-xs text-gray-500">Skills Match</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-indigo-700">{analysisResult.score.experienceMatch}%</span>
                  <span className="text-xs text-gray-500">Experience</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-indigo-700">{analysisResult.score.educationMatch}%</span>
                  <span className="text-xs text-gray-500">Education</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-indigo-700">{analysisResult.score.keywordMatch}%</span>
                  <span className="text-xs text-gray-500">Keyword Match</span>
                </div>
              </div>
            </div>
            {/* Suggestions */}
            <div className="mt-6">
              <h4 className="font-semibold text-indigo-700 mb-2">Suggestions to Improve</h4>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                {analysisResult.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            {/* Download/CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Button onClick={handleDownloadReport} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Download Score Report
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Download PDF
              </Button>
              <Button onClick={() => setShowRewriteModal(true)} variant="default" className="flex items-center gap-2">
                <Save className="w-4 h-4" /> Rewrite My Resume with AI
              </Button>
              <Button onClick={() => setShowEmailModal(true)} variant="outline" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Send to Email
              </Button>
            </div>
            {/* Feedback Prompt */}
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

      {/* AI Resume Rewriting Modal */}
      <Dialog open={showRewriteModal} onOpenChange={setShowRewriteModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">AI Resume Rewriting <Loader2 className={rewriting ? 'animate-spin ml-2' : 'hidden'} /></DialogTitle>
            <button onClick={() => setShowRewriteModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </DialogHeader>
          <div className="mt-2">
            {!improvedResume && !rewriteError && (
              <Button onClick={handleRewriteResume} disabled={rewriting} className="mb-4">Rewrite Now</Button>
            )}
            {rewriting && <div className="flex items-center gap-2 text-indigo-700"><Loader2 className="animate-spin" /> Rewriting your resume with AI...</div>}
            {rewriteError && <div className="text-red-600 text-sm mt-2">{rewriteError}</div>}
            {improvedResume && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Improved Resume</h4>
                <Textarea value={improvedResume} readOnly className="min-h-[200px] font-mono" />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleCopyImproved} variant="outline" className="flex items-center gap-2"><Copy className="w-4 h-4" /> Copy</Button>
                  <Button onClick={handleDownloadImproved} variant="outline" className="flex items-center gap-2"><Download className="w-4 h-4" /> Download</Button>
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

      {/* Email Export Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send ATS Report to Email</DialogTitle>
            <DialogDescription>
              Enter the recipient's email address to send your ATS report as a PDF attachment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendEmail} className="flex flex-col gap-4 mt-2">
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

      {/* Floating Chatbot Widget */}
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
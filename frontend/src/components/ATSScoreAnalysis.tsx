import { useState } from "react";
import { Upload, FileText, Target, Save, Download, CheckCircle, AlertCircle, Info } from "lucide-react";
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

  return (
    <div className="space-y-6">
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
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    {resumeFile ? resumeFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, or TXT up to 10MB
                  </p>
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
        <div className="space-y-6">
          {renderScoreBreakdown()}

          {/* Job Requirements Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Job Requirements Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Experience Level</h4>
                  <Badge variant="outline" className="text-sm">
                    {analysisResult.parsedJobDescription.experienceLevel.charAt(0).toUpperCase() + analysisResult.parsedJobDescription.experienceLevel.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Education Level</h4>
                  <Badge variant="outline" className="text-sm">
                    {analysisResult.parsedJobDescription.educationLevel.charAt(0).toUpperCase() + analysisResult.parsedJobDescription.educationLevel.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Sections Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Sections Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Extracted Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.parsedResume.extractedData.skills.slice(0, 8).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {analysisResult.parsedResume.extractedData.skills.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{analysisResult.parsedResume.extractedData.skills.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="text-sm space-y-1">
                    {analysisResult.parsedResume.extractedData.name && (
                      <p><strong>Name:</strong> {analysisResult.parsedResume.extractedData.name}</p>
                    )}
                    {analysisResult.parsedResume.extractedData.email && (
                      <p><strong>Email:</strong> {analysisResult.parsedResume.extractedData.email}</p>
                    )}
                    {analysisResult.parsedResume.extractedData.phone && (
                      <p><strong>Phone:</strong> {analysisResult.parsedResume.extractedData.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing Keywords */}
          {analysisResult.missingKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Missing Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-red-600 border-red-600">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleSaveToDashboard} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setStep('upload')} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
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
    </div>
  );
};

export default ATSScoreAnalysis; 
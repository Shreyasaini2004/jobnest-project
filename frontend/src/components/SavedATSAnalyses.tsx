import { useState } from "react";
import { Target, Calendar, FileText, Trash2, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useATSAnalysis, SavedATSAnalysis } from "@/contexts/ATSAnalysisContext";
import { useToast } from "@/hooks/use-toast";

const SavedATSAnalyses = () => {
  const { savedAnalyses, deleteAnalysis } = useATSAnalysis();
  const { toast } = useToast();
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedATSAnalysis | null>(null);

  const handleDelete = (id: string) => {
    deleteAnalysis(id);
    toast({
      title: "Analysis deleted",
      description: "The analysis has been removed from your dashboard.",
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (savedAnalyses.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Analyses</h3>
        <p className="text-gray-600 mb-4">
          You haven't saved any ATS analyses yet. Run an analysis to see your results here.
        </p>
        <Button onClick={() => window.location.href = '/dashboard?section=ats-score'}>
          Run New Analysis
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saved ATS Analyses</h1>
          <p className="text-gray-600 mt-2">
            View and manage your previously saved resume analyses
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {savedAnalyses.length} {savedAnalyses.length === 1 ? 'analysis' : 'analyses'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savedAnalyses.map((analysis) => (
          <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{analysis.resumeFileName}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(analysis.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(analysis.timestamp)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}%
                </div>
                <Badge className={`mt-2 ${getScoreBadgeColor(analysis.score)}`}>
                  {analysis.score >= 80 ? 'Excellent' : 
                   analysis.score >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Matched Keywords:</span>
                  <span className="font-semibold text-green-600">
                    {analysis.keywordMatches.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Missing Keywords:</span>
                  <span className="font-semibold text-red-600">
                    {analysis.missingKeywords.length}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Job Description:</strong>
                </p>
                <p className="text-sm text-gray-700">
                  {truncateText(analysis.jobDescription, 100)}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        ATS Analysis Details
                      </DialogTitle>
                      <DialogDescription>
                        Detailed breakdown of your resume analysis
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedAnalysis && (
                      <div className="space-y-6">
                        {/* Score Overview */}
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className={`text-4xl font-bold ${getScoreColor(selectedAnalysis.score)}`}>
                            {selectedAnalysis.score}%
                          </div>
                          <Badge className={`mt-2 ${getScoreBadgeColor(selectedAnalysis.score)}`}>
                            {selectedAnalysis.score >= 80 ? 'Excellent' : 
                             selectedAnalysis.score >= 60 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                        </div>

                        {/* File Info */}
                        <div>
                          <h4 className="font-semibold mb-2">Resume File</h4>
                          <p className="text-sm text-gray-600">{selectedAnalysis.resumeFileName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Analyzed on {formatDate(selectedAnalysis.timestamp)}
                          </p>
                        </div>

                        {/* Job Description */}
                        <div>
                          <h4 className="font-semibold mb-2">Job Description</h4>
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            {selectedAnalysis.jobDescription}
                          </div>
                        </div>

                        {/* Keyword Analysis */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              Matched Keywords ({selectedAnalysis.keywordMatches.length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedAnalysis.keywordMatches.map((keyword, index) => (
                                <Badge key={index} variant="outline" className="text-green-600 border-green-600 text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              Missing Keywords ({selectedAnalysis.missingKeywords.length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedAnalysis.missingKeywords.map((keyword, index) => (
                                <Badge key={index} variant="outline" className="text-red-600 border-red-600 text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Suggestions */}
                        <div>
                          <h4 className="font-semibold mb-2">Improvement Suggestions</h4>
                          <ul className="space-y-2">
                            {selectedAnalysis.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SavedATSAnalyses; 
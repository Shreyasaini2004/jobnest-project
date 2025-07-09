import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useZodForm, createSubmitHandler } from '@/lib/hooks/useZodForm';
import { useFormError } from '@/lib/hooks/useFormError';
import { FormField } from './FormField';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText } from 'lucide-react';
import { jobApi } from '@/lib/realApi';
import { useUser } from '@/contexts/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import ATSScoreAnalysis from './ATSScoreAnalysis';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';

// Define the form schema using Zod
const applicationSchema = z.object({
  coverLetter: z
    .string()
    .min(50, { message: 'Cover letter must be at least 50 characters' })
    .max(2000, { message: 'Cover letter must not exceed 2000 characters' }),
  resumeUrl: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .optional()
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .optional()
    .or(z.literal('')),
  experience: z.string().min(1, { message: 'Experience is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  education: z.string().min(1, { message: 'Education is required' }),
  resumeScore: z.number().optional().nullable(),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, { message: 'You must agree to the terms and conditions' }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

type JobApplicationFormProps = {
  jobId: string;
  jobTitle: string;
  companyName: string;
  postedBy: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  jobId,
  jobTitle,
  companyName,
  postedBy,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const [showATSAnalysis, setShowATSAnalysis] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  
  // Function for applying to jobs using real API
  const applyToJob = async (data: { jobId: string; application: any }) => {
    if (!user || user.userType !== 'job-seeker') {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in as a job seeker to apply for jobs.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Add the job seeker ID to the application data
      const applicationData = {
        ...data.application,
        jobSeekerId: user._id,
        postedBy: data.postedBy
      };
      
      console.log("📨 Final submit payload:", {
        jobId: data.jobId,
        ...applicationData
      });
      
      // Call the API
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: data.jobId,
          ...applicationData
        }),
      });

      if (!res.ok) throw new Error('Failed to submit application');

      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!',
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your application.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleATSScoreUpdate = (score: number) => {
    setAtsScore(score);
    setShowATSAnalysis(false);
  };
  
  // Use our custom hook for form validation with Zod
  const form = useZodForm(applicationSchema, {
    defaultValues: {
      coverLetter: '',
      resumeUrl: '',
      portfolioUrl: '',
      experience: '',
      location: '',
      education: '',
      resumeScore: null,
      agreeToTerms: false,
    },
  });
  
  // Use our custom hook for form error handling
  const { hasErrors } = useFormError(form.formState.errors);
  
  // Create a submit handler with type safety
  const onSubmit = createSubmitHandler<typeof applicationSchema>((data) => {
    applyToJob({
      jobId,
      application: {
        coverLetter: data.coverLetter,
        resumeUrl: data.resumeUrl || undefined,
        portfolioUrl: data.portfolioUrl || undefined,
        experience: data.experience,
        location: data.location,
        education: data.education,
        resumeScore: data.resumeScore,
      },
    });
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Apply for {jobTitle}
          </h2>
          <p className="text-gray-600">
            at {companyName}
          </p>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                name="coverLetter"
                label="Cover Letter"
                type="textarea"
                placeholder="Introduce yourself and explain why you're a good fit for this position..."
                rows={6}
                required
              />
            
              <FormField
                name="resumeUrl"
                label="Resume URL"
                type="url"
                placeholder="https://example.com/my-resume.pdf"
                description="Link to your resume (Google Drive, Dropbox, etc.)"
              />
            
              <FormField
                name="portfolioUrl"
                label="Portfolio URL"
                type="url"
                placeholder="https://myportfolio.com"
                description="Link to your portfolio or personal website"
              />
            
              <FormField
                name="experience"
                label="Experience"
                type="text"
                placeholder="e.g. 3 years in frontend development"
                required
              />
            
              <FormField
                name="location"
                label="Location"
                type="text"
                placeholder="e.g. San Francisco, CA"
                required
              />
            
              <FormField
                name="education"
                label="Education"
                type="text"
                placeholder="e.g. B.Sc. in Computer Science, Stanford University"
                required
              />
            
              {/* ATS Score Display */}
              <div className="flex items-center justify-between border p-3 rounded-md">
                <div>
                  <h3 className="font-medium">ATS Resume Score</h3>
                  <p className="text-sm text-gray-500">Analyze how well your resume matches this job</p>
                </div>
                <div className="flex items-center gap-2">
                  {atsScore !== null && (
                    <Badge className={`${atsScore >= 80 ? 'bg-green-500' : atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {atsScore}%
                    </Badge>
                  )}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowATSAnalysis(true)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {atsScore === null ? 'Analyze Resume' : 'Re-analyze'}
                  </Button>
                </div>
              </div>

              <FormField
                name="agreeToTerms"
                type="checkbox"
                checkboxLabel="I agree to the terms and conditions"
                required
              />
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || hasErrors}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>

        {/* ATS Analysis Dialog */}
        <Dialog open={showATSAnalysis} onOpenChange={setShowATSAnalysis}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Resume ATS Analysis for {jobTitle}</DialogTitle>
            </DialogHeader>
            <ATSScoreAnalysis 
              onScoreUpdate={handleATSScoreUpdate}
              jobDescription={`Job Title: ${jobTitle}\nCompany: ${companyName}\n\nJob Description: This is a position for ${jobTitle} at ${companyName}. Please analyze the resume against this job.`}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default JobApplicationForm;

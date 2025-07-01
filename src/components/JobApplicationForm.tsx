import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useZodForm, createSubmitHandler } from '@/lib/hooks/useZodForm';
import { useFormError } from '@/lib/hooks/useFormError';
import { FormField } from './FormField';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, { message: 'You must agree to the terms' }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

type JobApplicationFormProps = {
  jobId: string;
  jobTitle: string;
  companyName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

/**
 * A form component for job applications
 * Uses Zod for validation and React Hook Form for form state management
 */
const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  jobId,
  jobTitle,
  companyName,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock function for applying to jobs
  const applyToJob = async (data: { jobId: string; application: any }) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!',
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: 'Application Failed',
        description: 'There was an error submitting your application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Use our custom hook for form validation with Zod
  const form = useZodForm(applicationSchema, {
    defaultValues: {
      coverLetter: '',
      resumeUrl: '',
      portfolioUrl: '',
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
      },
    });
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Apply for {jobTitle}</CardTitle>
        <CardDescription>Submit your application to {companyName}</CardDescription>
      </CardHeader>
      
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
              name="agreeToTerms"
              type="checkbox"
              checkboxLabel="I agree to the terms and conditions"
              required
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || hasErrors}>
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
    </Card>
  );
};

export default JobApplicationForm;
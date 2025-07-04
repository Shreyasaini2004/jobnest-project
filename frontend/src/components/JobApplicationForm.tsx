
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useZodForm, createSubmitHandler } from '@/lib/hooks/useZodForm';
import { useFormError } from '@/lib/hooks/useFormError';
import { FormField } from './FormField';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

// Define the form schema using Zod
const applicationSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must not exceed 100 characters' }),
  phoneNumber: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .regex(/^[\+]?[1-9][\d]{0,15}$/, { message: 'Please enter a valid phone number' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' }),
  coverLetter: z
    .string()
    .min(50, { message: 'Cover letter must be at least 50 characters' })
    .max(2000, { message: 'Cover letter must not exceed 2000 characters' }),
  resumeUrl: z
    .string()
    .min(1, { message: 'Resume URL is required' })
    .url({ message: 'Please enter a valid URL' }),
  githubLinkedinUrl: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .optional()
    .or(z.literal('')),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, { message: 'You must agree to the terms and conditions' }),
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
  const [showTerms, setShowTerms] = useState(false);
  
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
      name: '',
      phoneNumber: '',
      email: '',
      coverLetter: '',
      resumeUrl: '',
      githubLinkedinUrl: '',
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
        name: data.name,
        phoneNumber: data.phoneNumber,
        email: data.email,
        coverLetter: data.coverLetter,
        resumeUrl: data.resumeUrl,
        githubLinkedinUrl: data.githubLinkedinUrl || undefined,
      },
    });
  });

  return (
    <div className="w-full space-y-6">
      <div className="text-center pb-4">
        <p className="text-foreground font-bold">Submit your application to {companyName}</p>
      </div>
      <div className="text-center pb-4">
        <p className="text-foreground">{jobTitle}</p>
      </div>
      
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="name"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            required
          />
          
          <FormField
            name="phoneNumber"
            label="Phone Number"
            type="tel"
            placeholder="+1234567890"
            required
          />
          
          <FormField
            name="email"
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            required
          />
          
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
            required
          />
          
          <FormField
            name="githubLinkedinUrl"
            label="GitHub or LinkedIn URL"
            type="url"
            placeholder="https://github.com/username or https://linkedin.com/in/username"
            description="Link to your GitHub profile or LinkedIn profile"
          />
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FormField
                name="agreeToTerms"
                type="checkbox"
                checkboxLabel=""
                required
              />
              <span className="text-sm">
                I agree to the{' '}
                <Collapsible open={showTerms} onOpenChange={setShowTerms}>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                    >
                      terms and conditions
                      {showTerms ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-gray-50 text-sm">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Terms and Conditions</h4>
                      <p>
                        By submitting this application, you agree to the following terms:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>All information provided is accurate and truthful</li>
                        <li>You consent to background checks if required</li>
                        <li>You understand this is not a guarantee of employment</li>
                        <li>Your personal information will be used solely for recruitment purposes</li>
                        <li>We may contact you regarding this or similar positions</li>
                        <li>You have the right to withdraw your application at any time</li>
                      </ul>
                      <p className="text-xs text-gray-600">
                        For questions about data handling, please contact our HR department.
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </span>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
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
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default JobApplicationForm;

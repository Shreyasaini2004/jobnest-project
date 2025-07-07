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
  name: z.string().min(2).max(100),
  phoneNumber: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .regex(/^[\+]?[1-9][\d]{0,15}$/, { message: 'Please enter a valid phone number' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  coverLetter: z.string().min(50).max(2000),
  resumeUrl: z.string().url({ message: 'Please enter a valid resume URL' }),
  githubLinkedinUrl: z.string().url().optional().or(z.literal('')),
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
  const [showTerms, setShowTerms] = useState(false);

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

  const { hasErrors } = useFormError(form.formState.errors);

  const applyToJob = async (data: { jobId: string; postedBy: string; application: ApplicationFormValues }) => {
    setIsLoading(true);
    try {
      console.log("📨 Final submit payload:", {
        jobId,
        postedBy,
        ...data.application,
      });
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: data.jobId,
          postedBy: data.postedBy,
          ...data.application,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit application');

      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!',
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your application.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = createSubmitHandler<typeof applicationSchema>((data) => {
    applyToJob({ jobId, postedBy, application: data });
  });

  return (
    <div className="w-full space-y-6">
      <div className="text-center pb-4">
        <p className="text-foreground font-bold">Submit your application to {companyName}</p>
        <p className="text-foreground">{jobTitle}</p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField name="name" label="Full Name" type="text" required />
          <FormField name="phoneNumber" label="Phone Number" type="tel" placeholder="+1234567890" required />
          <FormField name="email" label="Email" type="email" required />
          <FormField name="coverLetter" label="Cover Letter" type="textarea" rows={6} required />
          <FormField
            name="resumeUrl"
            label="Resume URL"
            type="url"
            placeholder="https://example.com/resume.pdf"
            description="Link to your resume (Google Drive, Dropbox, etc.)"
            required
          />
          <FormField
            name="githubLinkedinUrl"
            label="GitHub or LinkedIn URL"
            type="url"
            placeholder="https://github.com/username or https://linkedin.com/in/username"
          />

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FormField name="agreeToTerms" type="checkbox" checkboxLabel="" required />
              <span className="text-sm">
                I agree to the{' '}
                <Collapsible open={showTerms} onOpenChange={setShowTerms}>
                  <CollapsibleTrigger asChild>
                    <button type="button" className="text-blue-600 underline inline-flex items-center">
                      terms and conditions
                      {showTerms ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-gray-50 text-sm">
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>All information provided is accurate and truthful</li>
                      <li>You consent to background checks if required</li>
                      <li>You understand this is not a guarantee of employment</li>
                      <li>Your personal information will be used solely for recruitment purposes</li>
                      <li>You can withdraw your application at any time</li>
                    </ul>
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

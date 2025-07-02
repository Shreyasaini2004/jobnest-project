import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Search, CheckCircle, XCircle, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  userType: z.enum(['job-seeker', 'employer']),
  companyName: z.string().optional(),
  companyEmail: z.string().email('Please enter a valid company email address').optional(),
  jobTitle: z.string().optional(),
  companyWebsite: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  // For employers, require company verification fields
  if (data.userType === 'employer') {
    return data.companyName && data.companyName.length >= 2 && 
           data.companyEmail && data.jobTitle && data.jobTitle.length >= 2;
  }
  return true;
}, {
  message: "Company verification is required for employer accounts",
  path: ["companyName"],
}).refine((data) => {
  // Recommend company verification for employers
  if (data.userType === 'employer' && data.companyName) {
    // This is just a recommendation, not a hard requirement
    return true;
  }
  return true;
}, {
  message: "We recommend verifying your company for better credibility",
  path: ["companyName"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface JobSeekerSignupProps {
  userType: 'job-seeker' | 'employer';
}

export function JobSeekerSignup({ userType }: JobSeekerSignupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifyingCompany, setIsVerifyingCompany] = useState(false);
  const [companyVerificationStatus, setCompanyVerificationStatus] = useState<'unverified' | 'verifying' | 'verified' | 'failed'>('unverified');
  const [verifiedCompanyData, setVerifiedCompanyData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { toast } = useToast();
  const { setUser } = useUser();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userType: userType,
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      
      // Create user data object
      const userData = {
        id: Date.now().toString(),
        name: data.firstName + ' ' + data.lastName,
        email: data.email,
        password: data.password, // In a real app, you should hash the password
        userType: data.userType,
        createdAt: new Date().toISOString(),
        ...(data.userType === 'employer' && {
          companyName: data.companyName,
          companyEmail: data.companyEmail,
          jobTitle: data.jobTitle,
          companyWebsite: data.companyWebsite || '',
          companyVerified: companyVerificationStatus === 'verified',
          emailVerified: companyVerificationStatus === 'verified',
          verifiedCompanyData: verifiedCompanyData,
        }),
      };
      
      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Save user data to context
      setUser(userData);
      
      // Show success message
      toast({
        title: "Success!",
        description: data.userType === 'employer' 
          ? `Welcome to JobNest, ${data.firstName} ${data.lastName}! Your employer account for ${data.companyName} has been created.`
          : `Welcome to JobNest, ${data.firstName} ${data.lastName}! Your job seeker account has been created.`,
      });
      
      // Navigate to appropriate dashboard after successful registration
      navigate(data.userType === 'employer' ? '/employer-dashboard' : '/job-seeker-dashboard');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isEmployer = userType === 'employer';
  
  // Company verification functions
  const searchCompany = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsVerifyingCompany(true);
    try {
      // Simple company search based on name - returns basic info
      const mockResults = [
        {
          place_id: 'company_1',
          name: query,
          formatted_address: 'Bangalore, Karnataka, India',
          website: `https://www.${query.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: '+91-80-12345678',
          rating: 4.2,
          user_ratings_total: 150,
          types: ['corporation'],
          business_status: 'OPERATIONAL',
          opening_hours: true,
          photos: [],
          geometry: { location: { lat: 0, lng: 0 } },
          jurisdiction: 'India',
          company_number: null,
          incorporation_date: null,
          source: 'Company Database',
          cin: null,
          class: null,
          category: null,
          subCategory: null,
          authorizedCapital: null,
          paidUpCapital: null,
          directors: null,
          emailDomain: `${query.toLowerCase().replace(/\s+/g, '')}.com`
        },
        {
          place_id: 'company_2',
          name: `${query} Private Limited`,
          formatted_address: 'Mumbai, Maharashtra, India',
          website: `https://www.${query.toLowerCase().replace(/\s+/g, '')}pvtltd.com`,
          phone: '+91-22-98765432',
          rating: 4.5,
          user_ratings_total: 89,
          types: ['corporation'],
          business_status: 'OPERATIONAL',
          opening_hours: true,
          photos: [],
          geometry: { location: { lat: 0, lng: 0 } },
          jurisdiction: 'India',
          company_number: null,
          incorporation_date: null,
          source: 'Company Database',
          cin: null,
          class: null,
          category: null,
          subCategory: null,
          authorizedCapital: null,
          paidUpCapital: null,
          directors: null,
          emailDomain: `${query.toLowerCase().replace(/\s+/g, '')}pvtltd.com`
        }
      ];

      setSearchResults(mockResults);
      setShowSearchResults(true);

    } catch (error) {
      console.error('Company search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
      
      toast({
        title: "Search Failed",
        description: "Unable to search for companies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingCompany(false);
    }
  };

  // Company email domain verification
  const verifyCompanyEmail = async (companyEmail: string, companyName: string) => {
    setIsVerifyingCompany(true);
    setCompanyVerificationStatus('verifying');
    
    try {
      // Extract domain from email
      const emailDomain = companyEmail.split('@')[1];
      
      // Check if domain matches company name (basic verification)
      const companyNameWords = companyName.toLowerCase().split(/\s+/);
      const domainWords = emailDomain.replace('.com', '').replace('.in', '').split(/[.-]/);
      
      // Simple domain matching logic
      const hasMatchingWords = companyNameWords.some(word => 
        domainWords.some(domainWord => domainWord.includes(word) || word.includes(domainWord))
      );
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (hasMatchingWords || emailDomain.includes(companyName.toLowerCase().replace(/\s+/g, ''))) {
        setVerifiedCompanyData({
          name: companyName,
          emailDomain: emailDomain,
          verifiedEmail: companyEmail,
          verificationMethod: 'Email Domain Match'
        });
        setCompanyVerificationStatus('verified');
        
        toast({
          title: "Company Verified!",
          description: `Email domain ${emailDomain} verified for ${companyName}.`,
        });
      } else {
        setCompanyVerificationStatus('failed');
        toast({
          title: "Verification Failed",
          description: "Email domain doesn't match company name. Please use your company email address.",
          variant: "destructive",
        });
      }
      
      setShowSearchResults(false);
    } catch (error) {
      console.error('Email verification error:', error);
      setCompanyVerificationStatus('failed');
      toast({
        title: "Verification Failed",
        description: "Unable to verify email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingCompany(false);
    }
  };

  const clearVerification = () => {
    setCompanyVerificationStatus('unverified');
    setVerifiedCompanyData(null);
    setSearchResults([]);
    setShowSearchResults(false);
  };

  return (
    <div className="px-8 pt-8">
      <CardHeader className="px-0 pt-0 pb-6">
        <CardTitle className="text-2xl font-bold text-foreground">
          {isEmployer ? 'Employer' : 'Job Seeker'} Sign Up
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-foreground/80">
              First Name
            </Label>
            <div className="relative">
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                className="h-12 px-4 text-base border-border/50 focus-visible:ring-2 focus-visible:ring-job-primary/50"
                disabled={isLoading}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-foreground/80">
              Last Name
            </Label>
            <div className="relative">
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                className="h-12 px-4 text-base border-border/50 focus-visible:ring-2 focus-visible:ring-job-primary/50"
                disabled={isLoading}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 px-4 text-base border-border/50 focus-visible:ring-2 focus-visible:ring-job-primary/50"
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {isEmployer && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-foreground/80">
                  Company Name *
                </Label>
                <div className="relative">
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Acme Corporation"
                    className="h-12 px-4 text-base border-border/50 focus-visible:ring-2 focus-visible:ring-job-primary/50"
                    disabled={isLoading}
                    {...register('companyName')}
                    onChange={(e) => {
                      register('companyName').onChange(e);
                      if (companyVerificationStatus === 'verified') {
                        clearVerification();
                      }
                    }}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                  
                  <p className="mt-1 text-xs text-muted-foreground">
                    💡 Enter your company name as it appears on official documents.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail" className="text-sm font-medium text-foreground/80">
                  Company Email *
                </Label>
                <div className="relative">
                  <div className="relative">
                    <Input
                      id="companyEmail"
                      type="email"
                      placeholder="you@company.com"
                      className="h-12 px-4 pr-20 text-base border-border/50 focus-visible:ring-2 focus-visible:ring-job-primary/50"
                      disabled={isLoading}
                      {...register('companyEmail')}
                      onChange={(e) => {
                        register('companyEmail').onChange(e);
                        if (companyVerificationStatus === 'verified') {
                          clearVerification();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 text-xs"
                      onClick={() => {
                        const companyEmail = (document.getElementById('companyEmail') as HTMLInputElement)?.value;
                        const companyName = (document.getElementById('companyName') as HTMLInputElement)?.value;
                        if (companyEmail && companyName) {
                          verifyCompanyEmail(companyEmail, companyName);
                        } else {
                          toast({
                            title: "Missing Information",
                            description: "Please enter both company name and company email to verify.",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={isVerifyingCompany}
                    >
                      {isVerifyingCompany ? (
                        <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        "Verify"
                      )}
                    </Button>
                  </div>
                  
                  {/* Email Verification Status */}
                  {companyVerificationStatus === 'verified' && verifiedCompanyData && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Email Verified</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="ml-auto h-6 px-2 text-xs text-green-600 hover:text-green-800"
                          onClick={clearVerification}
                        >
                          Change
                        </Button>
                      </div>
                      <div className="mt-1 text-xs text-green-700">
                        <p><strong>{verifiedCompanyData.name}</strong></p>
                        <p>Domain: {verifiedCompanyData.emailDomain}</p>
                        <p>Email: {verifiedCompanyData.verifiedEmail}</p>
                      </div>
                    </div>
                  )}
                  
                  {companyVerificationStatus === 'verifying' && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-blue-800">Verifying email domain...</span>
                      </div>
                    </div>
                  )}
                  
                  {companyVerificationStatus === 'failed' && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800">Email verification failed</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="ml-auto h-6 px-2 text-xs text-red-600 hover:text-red-800"
                          onClick={clearVerification}
                        >
                          Retry
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-red-700">
                        Please use your company email address (e.g., john@companyname.com)
                      </p>
                    </div>
                  )}
                  
                  {errors.companyEmail && (
                    <p className="mt-1 text-sm text-destructive">{errors.companyEmail.message}</p>
                  )}
                  
                  <p className="mt-1 text-xs text-muted-foreground">
                    💡 Use your company email address to verify your affiliation with the company.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-sm font-medium text-foreground/80">
                  Job Title *
                </Label>
                <div className="relative">
                  <Input
                    id="jobTitle"
                    type="text"
                    placeholder="HR Manager"
                    className="h-12 px-4 text-base border-border/50 focus-visible:ring-2 focus-visible:ring-job-primary/50"
                    disabled={isLoading}
                    {...register('jobTitle')}
                  />
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-destructive">{errors.jobTitle.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyWebsite" className="text-sm font-medium text-foreground/80">
                  Company Website
                </Label>
                <div className="relative">
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://www.company.com"
                    className="h-12 px-4 text-base border-border/50 focus-visible:ring-2 focus-visible:ring-job-primary/50"
                    disabled={isLoading}
                    {...register('companyWebsite')}
                  />
                  {errors.companyWebsite && (
                    <p className="mt-1 text-sm text-destructive">{errors.companyWebsite.message}</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Password
              </Label>
            </div>
            <div className="relative">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 px-4 pr-10 text-base border-border/50 focus-visible:ring-2 focus-visible:ring-job-primary/50"
                  disabled={isLoading}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">
              Confirm Password
            </Label>
            <div className="relative">
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 px-4 pr-10 text-base border-border/50 focus-visible:ring-2 focus-visible:ring-job-primary/50"
                  disabled={isLoading}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-job-primary to-job-accent hover:from-job-primary/90 hover:to-job-accent/90 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              `Sign Up as ${isEmployer ? 'Employer' : 'Job Seeker'}`
            )}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-job-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </div>
  );
}

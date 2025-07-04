import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const INTERESTS = [
  'Frontend', 'Backend', 'Data Science', 'DevOps', 'UI/UX', 'Product', 'QA', 'Mobile', 'AI/ML', 'Cloud', 'Cybersecurity', 'Other'
];
const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Remote', 'On-site'];
const INDUSTRIES = ['FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'SaaS', 'Consulting', 'Other'];
const EDUCATION = ['High School', "Bachelor's", "Master's", 'PhD', 'Other'];
const EXPERIENCE = ['<1', '1-2', '2-3', '3-5', '5+ years'];

export interface UserInterestsData {
  interests: string[];
  skills: string[];
  jobTypes: string[];
  industries: string[];
  languages: string[];
  certifications: string[];
  experience: string;
  education: string;
  bio: string;
  portfolio: string;
}

const defaultData: UserInterestsData = {
  interests: [],
  skills: [],
  jobTypes: [],
  industries: [],
  languages: [],
  certifications: [],
  experience: '',
  education: '',
  bio: '',
  portfolio: '',
};

export default function UserInterestsOnboarding({ onComplete, onSkip }: { onComplete: (data: UserInterestsData) => void, onSkip: () => void }) {
  const [data, setData] = useState<UserInterestsData>(defaultData);
  const [customInterest, setCustomInterest] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const [customCert, setCustomCert] = useState('');
  const [step, setStep] = useState(0);

  // Helper to add or remove chips
  const toggleChip = (field: keyof UserInterestsData, value: string) => {
    setData((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  // Helper to add custom chip
  const addCustom = (field: keyof UserInterestsData, value: string, clear: () => void) => {
    if (value && !data[field].includes(value)) {
      setData((prev) => ({ ...prev, [field]: [...(prev[field] as string[]), value] }));
      clear();
    }
  };

  // Steps: Interests, Skills, Job Types, Industries, Languages, Certifications, Experience, Education, Bio, Portfolio
  const steps = [
    {
      label: 'What are your areas of interest?',
      field: 'interests',
      options: INTERESTS,
      custom: customInterest,
      setCustom: setCustomInterest,
    },
    {
      label: 'What are your top skills?',
      field: 'skills',
      options: [],
      custom: customSkill,
      setCustom: setCustomSkill,
      tagInput: true,
    },
    {
      label: 'Preferred job types?',
      field: 'jobTypes',
      options: JOB_TYPES,
    },
    {
      label: 'Industries you are interested in?',
      field: 'industries',
      options: INDUSTRIES,
      custom: customIndustry,
      setCustom: setCustomIndustry,
    },
    {
      label: 'Languages you know?',
      field: 'languages',
      options: [],
      custom: customLanguage,
      setCustom: setCustomLanguage,
      tagInput: true,
    },
    {
      label: 'Certifications (if any)?',
      field: 'certifications',
      options: [],
      custom: customCert,
      setCustom: setCustomCert,
      tagInput: true,
    },
    {
      label: 'Years of experience?',
      field: 'experience',
      options: EXPERIENCE,
      single: true,
    },
    {
      label: 'Education level?',
      field: 'education',
      options: EDUCATION,
      single: true,
    },
    {
      label: 'Write a short professional bio (optional)',
      field: 'bio',
      textarea: true,
    },
    {
      label: 'Portfolio/LinkedIn URL (optional)',
      field: 'portfolio',
      input: true,
    },
  ];

  const current = steps[step];

  // Animation variants
  const variants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -40 },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-background via-white to-job-secondary/30">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <div className="text-xs uppercase tracking-widest text-job-primary font-bold mb-2">Step 2 of 2</div>
            <h2 className="text-2xl font-bold mb-1">Let's get to know you!</h2>
            <p className="text-muted-foreground text-sm">This helps us personalize your experience and match you with the best jobs. (Optional)</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.4, type: 'spring' }}
            >
              <div className="mb-4 text-lg font-semibold text-center">{current.label}</div>
              {/* Chips/cards for options (multi-select only) */}
              {current.options && current.options.length > 0 && !current.single && (
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {current.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`px-4 py-2 rounded-full border transition-all shadow-sm text-sm font-medium ${data[current.field]?.includes(opt) ? 'bg-job-primary text-white scale-105' : 'bg-white hover:bg-job-primary/10'}`}
                      onClick={() => toggleChip(current.field as keyof UserInterestsData, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                  {/* Add your own */}
                  {current.setCustom && (
                    <div className="flex items-center gap-1">
                      <Input
                        value={current.custom}
                        onChange={e => current.setCustom(e.target.value)}
                        placeholder="Add your own..."
                        className="h-8 w-32 text-sm"
                        onKeyDown={e => {
                          if (e.key === 'Enter') addCustom(current.field as keyof UserInterestsData, current.custom, () => current.setCustom(''));
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        onClick={() => addCustom(current.field as keyof UserInterestsData, current.custom, () => current.setCustom(''))}
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {/* Tag input for skills/languages/certs */}
              {current.tagInput && (
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {(data[current.field] as string[]).map((tag) => (
                    <Badge key={tag} className="bg-job-primary text-white text-sm px-3 py-1 rounded-full cursor-pointer" onClick={() => toggleChip(current.field as keyof UserInterestsData, tag)}>{tag} <span className="ml-1">×</span></Badge>
                  ))}
                  <Input
                    value={current.custom}
                    onChange={e => current.setCustom(e.target.value)}
                    placeholder="Add..."
                    className="h-8 w-32 text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Enter') addCustom(current.field as keyof UserInterestsData, current.custom, () => current.setCustom(''));
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    onClick={() => addCustom(current.field as keyof UserInterestsData, current.custom, () => current.setCustom(''))}
                  >
                    +
                  </Button>
                </div>
              )}
              {/* Single select (experience, education) */}
              {current.single && (
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {current.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`px-4 py-2 rounded-full border transition-all shadow-sm text-sm font-medium ${data[current.field] === opt ? 'bg-job-primary text-white scale-105' : 'bg-white hover:bg-job-primary/10'}`}
                      onClick={() => setData((prev) => ({ ...prev, [current.field]: opt }))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {/* Textarea for bio */}
              {current.textarea && (
                <textarea
                  className="w-full rounded-xl border p-3 text-sm mb-4 resize-none focus:ring-2 focus:ring-job-primary"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  value={data.bio}
                  onChange={e => setData(prev => ({ ...prev, bio: e.target.value }))}
                />
              )}
              {/* Input for portfolio */}
              {current.input && (
                <Input
                  className="w-full mb-4"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={data.portfolio}
                  onChange={e => setData(prev => ({ ...prev, portfolio: e.target.value }))}
                />
              )}
              {/* Step navigation */}
              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={onSkip}>Skip for now</Button>
                <div className="flex gap-2">
                  {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
                  {step < steps.length - 1 ? (
                    <Button onClick={() => setStep(step + 1)}>Next</Button>
                  ) : (
                    <Button onClick={() => onComplete(data)}>Save & Continue</Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
} 
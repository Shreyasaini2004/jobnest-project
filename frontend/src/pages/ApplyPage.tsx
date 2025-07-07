import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import JobApplicationForm from "@/components/JobApplicationForm";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ApplyPage: React.FC = () => {
  const { jobId } = useParams();
  const location = useLocation();

  const [jobData, setJobData] = useState<{
    jobTitle: string;
    companyName: string;
    postedBy?: string;          // may be undefined at first
  } | null>(location.state || null);
  

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch when there is no postedBy yet
    const fetchJob = async () => {
      if (!jobId || jobData?.postedBy) return;   // already have it
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`);
        if (!res.ok) throw new Error('Job not found');
        const job = await res.json();
  
        setJobData({
          jobTitle: job.jobTitle,
          companyName: job.postedBy?.companyName || 'Unknown',
          postedBy:
            typeof job.postedBy === 'string'
              ? job.postedBy
              : job.postedBy?._id,
        });
      } catch {
        setError('Invalid job data. Please go back and try again.');
      }
    };
  
    fetchJob();
  }, [jobId, jobData]);

  if (!jobId) return <div>Invalid job ID.</div>;
  if (loading) return <div>Loading job details...</div>;
  if (error) return <div>{error}</div>;
  if (!jobData) return null; // Still fetching

  const { jobTitle, companyName, postedBy } = jobData;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <JobApplicationForm
        jobId={jobId}
        jobTitle={jobTitle}
        companyName={companyName}
        postedBy={postedBy}
        onSuccess={() => {
          // Redirect or show success message
        }}
        onCancel={() => {
          // Handle cancel
        }}
      />
    </div>
  );
};

export default ApplyPage;

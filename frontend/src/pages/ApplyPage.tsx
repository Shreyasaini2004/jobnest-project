import React from "react";
import { useParams, useLocation } from "react-router-dom";
import JobApplicationForm from "@/components/JobApplicationForm";

const ApplyPage: React.FC = () => {
  const { jobId } = useParams();
  console.log("ApplyPage loaded for jobId:", jobId);
  const location = useLocation();

  const { jobTitle, companyName, postedBy } = location.state || {};

  if (!jobId || !jobTitle || !companyName || !postedBy) {
    return <div>Invalid job data. Please go back and try again.</div>;
  }

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

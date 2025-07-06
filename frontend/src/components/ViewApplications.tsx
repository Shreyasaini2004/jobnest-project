import React, { useEffect, useState } from 'react';

interface Application {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  resumeUrl: string;
  status: string;
  job: {
    jobTitle: string;
  };
}

const recruiterId = '68658966fb651892759c91b1'; // ✅ Replace with dynamic ID in production

const ViewApplication: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('all');

  // ✅ Fetch applications on mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/applications?postedBy=${recruiterId}`);
        const data = await res.json();
        setApplications(data);
      } catch (error) {
        console.error('Failed to fetch applications', error);
      }
    };

    fetchApplications();
  }, []);

  // ✅ Filter applications by job title
  const filtered = selectedTitle === 'all'
    ? applications
    : applications.filter(app =>
        app.job?.jobTitle?.toLowerCase() === selectedTitle.toLowerCase()
      );

  // ✅ Get unique job titles for dropdown
  const jobTitles = Array.from(
    new Set(applications.map(app => app.job?.jobTitle).filter(Boolean))
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Applications Received</h2>

      {/* 🔽 Job Title Filter Dropdown */}
      <div className="mb-6">
        <label htmlFor="job-title" className="mr-2 font-medium">Filter by Job Title:</label>
        <select
          id="job-title"
          className="border px-4 py-2 rounded"
          value={selectedTitle}
          onChange={(e) => setSelectedTitle(e.target.value)}
        >
          <option value="all">All Job Titles</option>
          {jobTitles.map(title => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
      </div>

      {/* 📄 Application Cards */}
      {filtered.map(app => (
        <div key={app._id} className="border p-4 rounded-lg shadow mb-6 bg-white">
          <h3 className="text-xl font-semibold">{app.name}</h3>
          <p className="text-sm text-gray-700">Email: {app.email}</p>
          <p className="text-sm text-gray-700">Phone: {app.phoneNumber}</p>
          <p className="text-sm text-gray-700">Job Title: {app.job?.jobTitle || 'N/A'}</p>
          <p className="text-sm text-gray-700">Status: <strong>{app.status}</strong></p>

          {/* 🧠 Mock Education */}
          <div className="mt-4">
            <p className="font-medium">Education:</p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>B.Tech in Computer Science, XYZ University</li>
              <li>12th Grade – CBSE Board</li>
            </ul>
          </div>

          {/* 💼 Mock Experience */}
          <div className="mt-2">
            <p className="font-medium">Experience:</p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>UI/UX Intern at ABC Designs (3 months)</li>
              <li>Freelance Frontend Dev using React.js</li>
            </ul>
          </div>

          {/* 📄 Resume Link */}
          <div className="mt-4">
            <a
              href={app.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              View Resume
            </a>
          </div>
        </div>
      ))}

      {/* 🛑 No applications */}
      {filtered.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No applications found for the selected job title.</p>
      )}
    </div>
  );
};

export default ViewApplication;

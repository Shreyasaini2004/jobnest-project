import React from 'react';

const NoJobsFound: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No jobs found</h3>
      <p className="text-muted-foreground">
        Try adjusting your search criteria or filters to find more opportunities.
      </p>
    </div>
  );
};

export default NoJobsFound;
import React from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useVirtualizedList } from '@/lib/hooks/useVirtualizedList';
import { Job } from '@/contexts/SavedJobsContext';
import JobListingCard from './JobListingCard';
import { Job as SavedJob } from '@/contexts/SavedJobsContext';
import SavedJobCard from './SavedJobCard';

type VirtualizedJobListProps = {
  jobs: Job[] | SavedJob[];
  type: 'job-listing' | 'saved-job';
  className?: string;
  removeJob?: (jobId: string) => void;
  toggleReminder?: (jobId: string, deadline?: Date) => void;
};

/**
 * A virtualized list component for rendering large lists of jobs efficiently
 * Uses react-window for virtualization to improve performance
 */
const VirtualizedJobList: React.FC<VirtualizedJobListProps> = ({
  jobs,
  type,
  className = '',
  removeJob,
  toggleReminder,
}) => {
  // Use our custom hook for virtualized lists
  const { listProps, createRowRenderer } = useVirtualizedList(jobs, {
    defaultItemHeight: type === 'job-listing' ? 320 : 220, // Different heights for different card types
    overscanCount: 2, // Number of items to render outside of the visible area
    measureItemsAfterMount: true, // Automatically measure item heights after mount
  });

  // Create a row renderer based on the type of job card
  const rowRenderer = createRowRenderer((job, index, style) => {
    if (type === 'job-listing') {
      return <JobListingCard job={job as Job} />;
    } else if (type === 'saved-job' && removeJob && toggleReminder) {
      // Create adapter function to match SavedJobCard's expected signature
      const adaptedToggleReminder = (id: string, deadline?: Date) => {
        toggleReminder(id, deadline);
      };
      
      return (
        <SavedJobCard
          job={job as SavedJob}
          removeJob={removeJob}
          toggleReminder={adaptedToggleReminder}
        />
      );
    }
    return null;
  });

  // If there are no jobs, don't render the list
  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`} style={{ height: '70vh' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            {...listProps}
          >
            {rowRenderer}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedJobList;
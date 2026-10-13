import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="recipes-grid-skeleton" aria-busy="true" aria-label="Loading recipes">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={`skeleton-${idx}`} className="recipe-card-skeleton">
          <div className="skeleton-image-box" />
          <div className="skeleton-content-box">
            <div className="skeleton-line skeleton-meta" />
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-subtitle" />
            <div className="skeleton-line skeleton-tags" />
          </div>
        </div>
      ))}
    </div>
  );
};

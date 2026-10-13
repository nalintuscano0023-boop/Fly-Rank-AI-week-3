import React from 'react';
import { SearchX, HeartCrack, AlertCircle, RotateCcw, Compass, Database } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-search-results' | 'no-favorites' | 'error';
  query?: string;
  errorMessage?: string;
  onReset?: () => void;
  onSwitchToFallback?: () => void;
  onExploreDiscover?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  query,
  errorMessage,
  onReset,
  onSwitchToFallback,
  onExploreDiscover,
}) => {
  if (type === 'no-favorites') {
    return (
      <div className="empty-state-card" role="status">
        <div className="empty-state-icon-wrapper heart-wrapper">
          <HeartCrack size={44} aria-hidden="true" />
        </div>
        <h3 className="empty-state-title">No favorite recipes yet</h3>
        <p className="empty-state-desc">
          Tap the heart icon on any recipe card to save your favorite dishes here for fast access anytime.
        </p>
        {onExploreDiscover && (
          <button type="button" className="btn-primary" onClick={onExploreDiscover}>
            <Compass size={18} aria-hidden="true" />
            <span>Discover Recipes</span>
          </button>
        )}
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="empty-state-card error-card" role="alert">
        <div className="empty-state-icon-wrapper error-wrapper">
          <AlertCircle size={44} aria-hidden="true" />
        </div>
        <h3 className="empty-state-title">Unable to reach recipe service</h3>
        <p className="empty-state-desc">
          {errorMessage || 'A network error occurred while contacting the live recipe API. You can switch to our high-quality offline sample dataset.'}
        </p>
        <div className="empty-state-actions">
          {onReset && (
            <button type="button" className="btn-secondary" onClick={onReset}>
              <RotateCcw size={16} aria-hidden="true" />
              <span>Retry Connection</span>
            </button>
          )}
          {onSwitchToFallback && (
            <button type="button" className="btn-primary" onClick={onSwitchToFallback}>
              <Database size={16} aria-hidden="true" />
              <span>Use Offline Sample Data</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="empty-state-card" role="status">
      <div className="empty-state-icon-wrapper search-wrapper">
        <SearchX size={44} aria-hidden="true" />
      </div>
      <h3 className="empty-state-title">No matching recipes found</h3>
      <p className="empty-state-desc">
        {query ? (
          <>
            We couldn't find any recipes matching <strong>&ldquo;{query}&rdquo;</strong>. Try searching for broader terms like <em>Chicken</em>, <em>Pasta</em>, or <em>Curry</em>.
          </>
        ) : (
          'No recipes match the currently selected category or cooking time filters.'
        )}
      </p>
      {onReset && (
        <button type="button" className="btn-primary" onClick={onReset}>
          <RotateCcw size={16} aria-hidden="true" />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );
};

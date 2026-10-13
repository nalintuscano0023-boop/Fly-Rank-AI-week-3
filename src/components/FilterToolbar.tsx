import React from 'react';
import { ArrowUpDown, Clock, RotateCcw } from 'lucide-react';
import type { SortOption } from '../types/recipe';

interface FilterToolbarProps {
  totalCount: number;
  maxCookingTime: number | null;
  onMaxTimeChange: (time: number | null) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  totalCount,
  maxCookingTime,
  onMaxTimeChange,
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="filter-toolbar">
      <div className="toolbar-left">
        <span className="results-counter" aria-live="polite">
          <strong>{totalCount}</strong> {totalCount === 1 ? 'recipe' : 'recipes'} found
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            className="reset-filters-btn"
            onClick={onResetFilters}
            aria-label="Reset all search filters"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      <div className="toolbar-right">
        {/* Quick Time Filter */}
        <div className="time-filter-group" role="group" aria-label="Filter by cooking time">
          <Clock size={15} className="toolbar-icon" aria-hidden="true" />
          <span className="filter-label">Max time:</span>
          <div className="time-chips">
            <button
              type="button"
              className={`time-chip ${maxCookingTime === null ? 'active' : ''}`}
              onClick={() => onMaxTimeChange(null)}
              aria-pressed={maxCookingTime === null}
            >
              Any
            </button>
            <button
              type="button"
              className={`time-chip ${maxCookingTime === 20 ? 'active' : ''}`}
              onClick={() => onMaxTimeChange(20)}
              aria-pressed={maxCookingTime === 20}
            >
              ≤ 20m
            </button>
            <button
              type="button"
              className={`time-chip ${maxCookingTime === 35 ? 'active' : ''}`}
              onClick={() => onMaxTimeChange(35)}
              aria-pressed={maxCookingTime === 35}
            >
              ≤ 35m
            </button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="sort-group">
          <label htmlFor="sort-by-select" className="sort-label">
            <ArrowUpDown size={14} aria-hidden="true" />
            <span>Sort:</span>
          </label>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="sort-select"
          >
            <option value="default">Recommended</option>
            <option value="name-asc">Name (A – Z)</option>
            <option value="time-asc">Cooking Time (Fastest)</option>
            <option value="time-desc">Cooking Time (Longest)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

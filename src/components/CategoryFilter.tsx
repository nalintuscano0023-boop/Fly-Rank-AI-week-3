import React from 'react';
import type { CategoryItem } from '../types/recipe';

interface CategoryFilterProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  disabled?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  disabled = false,
}) => {
  return (
    <nav className="category-filter-nav" aria-label="Recipe categories">
      <div className="category-pills-list" role="tablist">
        {categories.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
            (selectedCategory === 'All' && cat.name === 'All');

          return (
            <button
              key={cat.id}
              role="tab"
              type="button"
              id={`category-tab-${cat.name.toLowerCase()}`}
              aria-selected={isSelected}
              className={`category-pill ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.name)}
              disabled={disabled}
            >
              {cat.thumbnail && (
                <img
                  src={cat.thumbnail}
                  alt=""
                  aria-hidden="true"
                  className="category-pill-thumb"
                  loading="lazy"
                />
              )}
              <span className="category-pill-text">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

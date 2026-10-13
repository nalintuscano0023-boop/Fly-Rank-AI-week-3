import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Heart,
  Users,
  X,
  ExternalLink,
  Video,
  CheckCircle2,
  UtensilsCrossed,
  ChefHat,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { RecipeDetail } from '../types/recipe';

interface RecipeDetailModalProps {
  recipe: RecipeDetail | null;
  loading: boolean;
  isOpen: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  loading,
  isOpen,
  isFavorite,
  onToggleFavorite,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [checkedByRecipe, setCheckedByRecipe] = useState<Record<string, Record<number, boolean>>>({});
  const checkedIngredients = (recipe?.id ? checkedByRecipe[recipe.id] : undefined) || {};

  // Handle ESC key, focus trap, and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore focus on close
    const previousActiveElement = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Simple focus trapping inside modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on close button
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleIngredientChecked = (index: number) => {
    if (!recipe?.id) return;
    setCheckedByRecipe((prev) => ({
      ...prev,
      [recipe.id]: {
        ...prev[recipe.id],
        [index]: !prev[recipe.id]?.[index],
      },
    }));
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-recipe-title"
      >
        {/* Floating Close Button */}
        <button
          ref={closeBtnRef}
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close recipe details"
        >
          <X size={20} aria-hidden="true" />
        </button>

        {loading ? (
          <div className="modal-loading-state">
            <Loader2 size={36} className="spinner-icon" aria-hidden="true" />
            <p>Fetching culinary instructions & ingredients...</p>
          </div>
        ) : !recipe ? (
          <div className="modal-error-state">
            <UtensilsCrossed size={40} aria-hidden="true" />
            <h3>Recipe information unavailable</h3>
            <p>We could not retrieve details for this recipe. Please try another recipe.</p>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <div className="modal-content-scroller">
            {/* Modal Header & Hero */}
            <div className="modal-hero">
              <div className="modal-image-wrapper">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="modal-hero-image"
                />
                <div className="modal-image-gradient" />
              </div>

              <div className="modal-header-info">
                <div className="modal-badges-row">
                  <span className="modal-badge badge-category">{recipe.category}</span>
                  {recipe.area && (
                    <span className="modal-badge badge-area">{recipe.area}</span>
                  )}
                  {recipe.dataSource === 'sample' && (
                    <span className="modal-badge badge-sample">
                      <Sparkles size={12} aria-hidden="true" /> Sample Recipe
                    </span>
                  )}
                </div>

                <div className="modal-title-row">
                  <h2 id="modal-recipe-title" className="modal-title">
                    {recipe.name}
                  </h2>
                  <button
                    type="button"
                    className={`modal-favorite-toggle ${isFavorite ? 'favorited' : ''}`}
                    onClick={() => onToggleFavorite(recipe.id)}
                    aria-label={
                      isFavorite
                        ? `Remove ${recipe.name} from favorites`
                        : `Add ${recipe.name} to favorites`
                    }
                    aria-pressed={isFavorite}
                  >
                    <Heart
                      size={20}
                      fill={isFavorite ? '#ef4444' : 'none'}
                      color={isFavorite ? '#ef4444' : 'currentColor'}
                    />
                    <span>{isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}</span>
                  </button>
                </div>

                {/* Quick stats grid */}
                <div className="modal-stats-grid">
                  <div className="stat-card">
                    <Clock size={18} className="stat-icon" aria-hidden="true" />
                    <div>
                      <span className="stat-label">Cook Time</span>
                      <strong className="stat-val">{recipe.cookingTimeMinutes} mins</strong>
                    </div>
                  </div>
                  <div className="stat-card">
                    <ChefHat size={18} className="stat-icon" aria-hidden="true" />
                    <div>
                      <span className="stat-label">Prep Time</span>
                      <strong className="stat-val">{recipe.prepTimeMinutes} mins</strong>
                    </div>
                  </div>
                  <div className="stat-card">
                    <Users size={18} className="stat-icon" aria-hidden="true" />
                    <div>
                      <span className="stat-label">Servings</span>
                      <strong className="stat-val">{recipe.servings} people</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body: Two Column Layout */}
            <div className="modal-body-grid">
              {/* Left Column: Ingredients Checklist */}
              <div className="modal-ingredients-column">
                <div className="section-header-row">
                  <h3 className="section-title">Ingredients</h3>
                  <span className="ingredients-count-badge">
                    {recipe.ingredients.length} items
                  </span>
                </div>
                <p className="section-hint">Check off ingredients as you prepare them:</p>

                <ul className="ingredients-list" aria-label="Ingredients checklist">
                  {recipe.ingredients.map((item, idx) => {
                    const isChecked = Boolean(checkedIngredients[idx]);
                    return (
                      <li
                        key={`ingredient-${idx}`}
                        className={`ingredient-item ${isChecked ? 'checked' : ''}`}
                        onClick={() => toggleIngredientChecked(idx)}
                      >
                        <button
                          type="button"
                          className="ingredient-checkbox"
                          aria-label={`Mark ${item.name} as ${isChecked ? 'unready' : 'ready'}`}
                          aria-pressed={isChecked}
                        >
                          <CheckCircle2
                            size={18}
                            className={`checkbox-icon ${isChecked ? 'checked' : ''}`}
                          />
                        </button>
                        <span className="ingredient-measure">{item.measure}</span>
                        <span className="ingredient-name">{item.name}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* External links (YouTube / Source) */}
                <div className="modal-links-section">
                  {recipe.youtubeUrl && (
                    <a
                      href={recipe.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-recipe-btn btn-youtube"
                      aria-label="Watch video tutorial on YouTube (opens in new tab)"
                    >
                      <Video size={16} aria-hidden="true" />
                      <span>Watch Tutorial</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                  {recipe.sourceUrl && (
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-recipe-btn btn-source"
                      aria-label="View original recipe source (opens in new tab)"
                    >
                      <span>Original Source</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Cooking Instructions */}
              <div className="modal-instructions-column">
                <h3 className="section-title">Cooking Instructions</h3>
                <ol className="instructions-step-list">
                  {recipe.instructions.map((step, idx) => (
                    <li key={`step-${idx}`} className="instruction-step-item">
                      <div className="step-number-bubble" aria-hidden="true">
                        {idx + 1}
                      </div>
                      <div className="step-content">
                        <strong className="step-label">Step {idx + 1}</strong>
                        <p className="step-text">{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

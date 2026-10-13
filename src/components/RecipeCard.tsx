import React, { useState } from 'react';
import { Clock, Heart, Users, Sparkles } from 'lucide-react';
import type { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onSelectRecipe: (recipeId: string) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onSelectRecipe,
}) => {
  const [imgSrc, setImgSrc] = useState(recipe.image || FALLBACK_IMAGE);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleFavorite(recipe.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectRecipe(recipe.id);
    }
  };

  return (
    <article
      className="recipe-card"
      onClick={() => onSelectRecipe(recipe.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View recipe details for ${recipe.name}`}
      id={`recipe-card-${recipe.id}`}
    >
      {/* Thumbnail Container */}
      <div className="card-media-wrapper">
        <div className={`image-shimmer-placeholder ${imageLoaded ? 'hidden' : ''}`} />
        <img
          src={imgSrc}
          alt={recipe.name}
          className={`card-image ${imageLoaded ? 'loaded' : ''}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />

        {/* Category Badge overlay */}
        <div className="card-badge-category">
          <span>{recipe.category}</span>
        </div>

        {/* Favorite Action Button */}
        <button
          type="button"
          className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={
            isFavorite
              ? `Remove ${recipe.name} from favorites`
              : `Add ${recipe.name} to favorites`
          }
          aria-pressed={isFavorite}
        >
          <Heart
            size={18}
            className={`heart-icon ${isFavorite ? 'filled' : ''}`}
            fill={isFavorite ? '#ef4444' : 'none'}
            color={isFavorite ? '#ef4444' : 'currentColor'}
          />
        </button>
      </div>

      {/* Card Body */}
      <div className="card-content">
        <div className="card-meta-row">
          <span className="card-time-badge">
            <Clock size={13} aria-hidden="true" />
            <span>{recipe.cookingTimeMinutes}m cook</span>
          </span>
          <span className="card-servings-badge">
            <Users size={13} aria-hidden="true" />
            <span>{recipe.servings} serv</span>
          </span>
        </div>

        <h3 className="card-title" title={recipe.name}>
          {recipe.name}
        </h3>

        {/* Tags or Cuisine Area */}
        <div className="card-tags-row">
          {recipe.area && <span className="card-tag tag-area">{recipe.area}</span>}
          {recipe.tags &&
            recipe.tags
              .filter((t) => t !== recipe.area)
              .slice(0, 2)
              .map((tag, idx) => (
                <span key={`${recipe.id}-tag-${idx}`} className="card-tag">
                  {tag}
                </span>
              ))}
          {recipe.dataSource === 'sample' && (
            <span className="card-tag tag-sample" title="Curated offline sample recipe">
              <Sparkles size={10} aria-hidden="true" /> Sample
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

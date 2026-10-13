import React from 'react';
import { Sparkles, Flame, Clock, Heart } from 'lucide-react';

interface HeroBannerProps {
  onQuickSearch: (query: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onQuickSearch }) => {
  const quickTags = ['Chicken', 'Pasta', 'Curry', 'Salmon', 'Steak', 'Dessert'];

  return (
    <section className="hero-banner-section" aria-label="Introduction">
      <div className="hero-content">
        <div className="hero-pill-badge">
          <Sparkles size={14} className="sparkle-icon" aria-hidden="true" />
          <span>Handcrafted Culinary Recipes</span>
        </div>

        <h1 className="hero-heading">
          Discover, Cook & Savor <span className="text-gradient">Every Dish</span>
        </h1>

        <p className="hero-subheading">
          Explore hundreds of world-class recipes with step-by-step instructions, precision ingredients, and live culinary discovery.
        </p>

        {/* Quick Suggestion Pills */}
        <div className="hero-quick-tags" aria-label="Popular searches">
          <span className="quick-tags-label">Popular now:</span>
          <div className="tags-buttons-wrapper">
            {quickTags.map((tag) => (
              <button
                key={`tag-${tag}`}
                type="button"
                className="hero-tag-btn"
                onClick={() => onQuickSearch(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="hero-features-bar">
          <div className="feature-item">
            <Flame size={16} className="feature-icon" aria-hidden="true" />
            <span>Interactive Cooking Mode</span>
          </div>
          <div className="feature-item">
            <Clock size={16} className="feature-icon" aria-hidden="true" />
            <span>Instant Prep & Cook Times</span>
          </div>
          <div className="feature-item">
            <Heart size={16} className="feature-icon" aria-hidden="true" />
            <span>Persistent Favorites Offline</span>
          </div>
        </div>
      </div>
    </section>
  );
};

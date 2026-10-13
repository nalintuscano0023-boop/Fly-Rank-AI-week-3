import React from 'react';
import { ChefHat, Heart, Compass, Wifi, Database } from 'lucide-react';
import type { ViewTab } from '../types/recipe';

interface NavbarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  favoritesCount: number;
  isFallback: boolean;
  onToggleDataSource?: () => void;
  useFallbackOnly: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
  isFallback,
  onToggleDataSource,
  useFallbackOnly,
}) => {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand */}
        <div className="brand" onClick={() => onTabChange('discover')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onTabChange('discover'); }}>
          <div className="brand-icon-wrapper">
            <ChefHat className="brand-icon" aria-hidden="true" size={26} />
          </div>
          <div className="brand-text">
            <span className="brand-name">TasteCraft</span>
            <span className="brand-tagline">Recipe Finder</span>
          </div>
        </div>

        {/* Data Source Indicator & Toggle */}
        <div className="header-center">
          <button
            type="button"
            className={`data-source-pill ${useFallbackOnly || isFallback ? 'pill-fallback' : 'pill-live'}`}
            onClick={onToggleDataSource}
            title={
              useFallbackOnly
                ? 'Currently forced to Offline Sample Dataset. Click to switch to Live TheMealDB API.'
                : isFallback
                ? 'API unreachable: Auto-fallback to offline dataset. Click to retry live API.'
                : 'Connected to Live TheMealDB API. Click to preview Offline Sample Dataset.'
            }
            aria-label={`Data source: ${useFallbackOnly || isFallback ? 'Offline Sample Dataset' : 'Live TheMealDB API'}. Click to toggle.`}
          >
            {useFallbackOnly || isFallback ? (
              <>
                <Database size={14} className="pulse-icon" aria-hidden="true" />
                <span>Sample Data {useFallbackOnly ? '(Manual)' : '(Offline Fallback)'}</span>
              </>
            ) : (
              <>
                <Wifi size={14} className="pulse-icon live-pulse" aria-hidden="true" />
                <span>Live TheMealDB API</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav" aria-label="Main Navigation">
          <button
            type="button"
            id="tab-discover"
            className={`nav-tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => onTabChange('discover')}
            aria-current={activeTab === 'discover' ? 'page' : undefined}
          >
            <Compass size={18} aria-hidden="true" />
            <span>Discover</span>
          </button>

          <button
            type="button"
            id="tab-favorites"
            className={`nav-tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => onTabChange('favorites')}
            aria-current={activeTab === 'favorites' ? 'page' : undefined}
            aria-label={`Favorites, ${favoritesCount} saved recipes`}
          >
            <Heart size={18} className={favoritesCount > 0 ? 'heart-has-items' : ''} aria-hidden="true" />
            <span>Favorites</span>
            <span className="badge-count" aria-hidden="true">
              {favoritesCount}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};

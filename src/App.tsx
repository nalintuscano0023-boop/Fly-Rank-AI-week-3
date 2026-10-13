import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CategoryItem, Recipe, RecipeDetail, SortOption, ViewTab } from './types/recipe';
import { SAMPLE_CATEGORIES, SAMPLE_RECIPES } from './data/sampleRecipes';
import {
  getCategories,
  getRecipeDetailById,
  getRecipesByCategory,
  getRecipesByIds,
  parseMealToRecipe,
  searchRecipes,
} from './services/recipeApi';
import { useDebounce } from './hooks/useDebounce';
import { useFavorites } from './hooks/useFavorites';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { FilterToolbar } from './components/FilterToolbar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { EmptyState } from './components/EmptyState';
import { NotificationToast } from './components/NotificationToast';

export function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<ViewTab>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 350);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxCookingTime, setMaxCookingTime] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Data & API state
  const [categories, setCategories] = useState<CategoryItem[]>(SAMPLE_CATEGORIES);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiFallback, setIsApiFallback] = useState(false);
  const [useFallbackOnly, setUseFallbackOnly] = useState(false);

  // Detail Modal state
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [detailRecipe, setDetailRecipe] = useState<RecipeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Feedback toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Favorites hook
  const { favorites, favoritesCount, isFavorite, toggleFavorite } = useFavorites();

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Fetch categories once on mount
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    getCategories(controller.signal)
      .then((res) => {
        if (!isMounted) return;
        setCategories(res.data);
        if (res.isFallback) setIsApiFallback(true);
      })
      .catch((err) => {
        if (!isMounted || err?.name === 'AbortError') return;
        setCategories(SAMPLE_CATEGORIES);
        setIsApiFallback(true);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const activeCategories = useFallbackOnly ? SAMPLE_CATEGORIES : categories;

  // Main data fetching effect with AbortController for race condition safety
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadRecipes() {
      setLoading(true);
      setApiError(null);

      // Branch 1: Favorites tab view
      if (activeTab === 'favorites') {
        try {
          if (favorites.length === 0) {
            if (isMounted) {
              setRecipes([]);
              setLoading(false);
            }
            return;
          }

          if (useFallbackOnly) {
            const sampleFavs = SAMPLE_RECIPES.filter((r) => favorites.includes(r.id)).map((r) =>
              parseMealToRecipe(r, true)
            );
            if (isMounted) {
              setRecipes(sampleFavs);
              setLoading(false);
            }
            return;
          }

          const favRecipes = await getRecipesByIds(favorites, controller.signal);
          if (isMounted) {
            setRecipes(favRecipes);
            setLoading(false);
          }
        } catch (err: any) {
          if (isMounted && err?.name !== 'AbortError') {
            setApiError('Unable to load saved favorites.');
            setLoading(false);
          }
        }
        return;
      }

      // Branch 2: Discover tab with forced fallback mode
      if (useFallbackOnly) {
        let results = SAMPLE_RECIPES.map((r) => parseMealToRecipe(r, true));
        if (selectedCategory !== 'All') {
          results = results.filter(
            (r) => r.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        if (debouncedQuery.trim()) {
          const q = debouncedQuery.toLowerCase();
          results = results.filter(
            (r) =>
              r.name.toLowerCase().includes(q) ||
              r.category.toLowerCase().includes(q) ||
              r.tags.some((t) => t.toLowerCase().includes(q))
          );
        }

        if (isMounted) {
          setRecipes(results);
          setIsApiFallback(true);
          setLoading(false);
        }
        return;
      }

      // Branch 3: Discover tab with live API
      try {
        let response;
        if (debouncedQuery.trim()) {
          response = await searchRecipes(debouncedQuery, controller.signal);
        } else if (selectedCategory !== 'All') {
          response = await getRecipesByCategory(selectedCategory, controller.signal);
        } else {
          // Default: popular dishes
          response = await searchRecipes('', controller.signal);
        }

        if (!isMounted) return;

        setRecipes(response.data);
        setIsApiFallback(response.isFallback);
        if (response.error) {
          setApiError(response.error);
        }
        setLoading(false);
      } catch (err: any) {
        if (!isMounted || err?.name === 'AbortError') return;
        setApiError('Network connection failed. Switched to offline sample recipes.');
        setIsApiFallback(true);
        // Offline fallback
        const fallbackList = SAMPLE_RECIPES.map((r) => parseMealToRecipe(r, true));
        setRecipes(fallbackList);
        setLoading(false);
      }
    }

    loadRecipes();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [activeTab, debouncedQuery, selectedCategory, favorites, useFallbackOnly]);

  // Load recipe detail modal
  const handleSelectRecipe = useCallback(
    async (recipeId: string) => {
      setSelectedRecipeId(recipeId);
      setDetailLoading(true);

      try {
        const res = await getRecipeDetailById(recipeId);
        setDetailRecipe(res.data);
      } catch (err) {
        console.error('Failed to load recipe detail:', err);
        // Fallback to sample recipe if available
        const fallback = SAMPLE_RECIPES.find((r) => r.id === recipeId) || SAMPLE_RECIPES[0];
        setDetailRecipe(fallback);
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setSelectedRecipeId(null);
    setDetailRecipe(null);
  }, []);

  const handleToggleFavorite = useCallback(
    (recipeId: string) => {
      const nowFav = toggleFavorite(recipeId);
      const recipeItem =
        recipes.find((r) => r.id === recipeId) ||
        SAMPLE_RECIPES.find((r) => r.id === recipeId);
      const name = recipeItem?.name || 'Recipe';

      if (nowFav) {
        showToast(`Saved "${name}" to Favorites`);
      } else {
        showToast(`Removed "${name}" from Favorites`);
      }
    },
    [recipes, toggleFavorite, showToast]
  );

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMaxCookingTime(null);
    setSortBy('default');
  }, []);

  const handleQuickSearch = useCallback((query: string) => {
    setActiveTab('discover');
    setSearchQuery(query);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  }, []);

  // Filter and sort the loaded recipes
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // Cooking time filter
    if (maxCookingTime !== null) {
      result = result.filter((r) => r.cookingTimeMinutes <= maxCookingTime);
    }

    // Sort options
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'time-asc') {
      result.sort((a, b) => a.cookingTimeMinutes - b.cookingTimeMinutes);
    } else if (sortBy === 'time-desc') {
      result.sort((a, b) => b.cookingTimeMinutes - a.cookingTimeMinutes);
    }

    return result;
  }, [recipes, maxCookingTime, sortBy]);

  const hasActiveFilters = Boolean(
    searchQuery || (selectedCategory !== 'All' && activeTab !== 'favorites') || maxCookingTime !== null || sortBy !== 'default'
  );

  return (
    <div className="app-root">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'favorites') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        favoritesCount={favoritesCount}
        isFallback={isApiFallback}
        useFallbackOnly={useFallbackOnly}
        onToggleDataSource={() => {
          setUseFallbackOnly((prev) => {
            const next = !prev;
            showToast(
              next
                ? 'Switched to offline curated dataset'
                : 'Switched to live TheMealDB API'
            );
            return next;
          });
        }}
      />

      <main className="main-content" id="main-content">
        {/* Hero Banner - only in discover tab */}
        {activeTab === 'discover' && (
          <HeroBanner onQuickSearch={handleQuickSearch} />
        )}

        <div className="content-container">
          {/* Favorites Header or Discover Controls */}
          {activeTab === 'favorites' ? (
            <div className="favorites-page-header">
              <h1 className="section-main-heading">Your Saved Favorites</h1>
              <p className="section-main-subheading">
                All your bookmarked recipes are saved locally in your browser for instant culinary inspiration.
              </p>
            </div>
          ) : (
            <div className="discovery-controls-card">
              {/* Search Bar */}
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                disabled={loading}
              />

              {/* Category Filter Pills */}
              <CategoryFilter
                categories={activeCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  // Clear query when switching specific categories to avoid confusion
                  if (searchQuery) setSearchQuery('');
                }}
                disabled={loading}
              />
            </div>
          )}

          {/* Filter Toolbar (Count, Max time, Sort, Reset) */}
          <FilterToolbar
            totalCount={filteredRecipes.length}
            maxCookingTime={maxCookingTime}
            onMaxTimeChange={setMaxCookingTime}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Results Grid / Loading / Empty States */}
          {loading ? (
            <LoadingSkeleton count={8} />
          ) : apiError && recipes.length === 0 ? (
            <EmptyState
              type="error"
              errorMessage={apiError}
              onReset={handleResetFilters}
              onSwitchToFallback={() => setUseFallbackOnly(true)}
            />
          ) : filteredRecipes.length === 0 ? (
            activeTab === 'favorites' ? (
              <EmptyState
                type="no-favorites"
                onExploreDiscover={() => setActiveTab('discover')}
              />
            ) : (
              <EmptyState
                type="no-search-results"
                query={debouncedQuery}
                onReset={handleResetFilters}
              />
            )
          ) : (
            <div className="recipes-grid" role="region" aria-label="Recipe Results">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={isFavorite(recipe.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelectRecipe={handleSelectRecipe}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-text">
            <strong>TasteCraft Recipe Finder</strong> &bull; FlyRank Frontend AI Engineering Internship Week 3
          </p>
          <p className="footer-subtext">
            Powered by TheMealDB API &amp; Curated Offline Dataset &bull; Built with React, TypeScript &amp; Vite
          </p>
        </div>
      </footer>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={detailRecipe}
        loading={detailLoading}
        isOpen={Boolean(selectedRecipeId)}
        isFavorite={selectedRecipeId ? isFavorite(selectedRecipeId) : false}
        onToggleFavorite={handleToggleFavorite}
        onClose={handleCloseModal}
      />

      {/* Floating Notification Toast */}
      <NotificationToast
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />
    </div>
  );
}

export default App;

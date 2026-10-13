import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'flyrank_recipe_favorites_v1';
const INITIAL_FAVORITES = ['sample-1', 'sample-3'];

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        return JSON.parse(stored) as string[];
      }
      // Initial onboarding seed so favorites view is immediately interactive
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FAVORITES));
      return INITIAL_FAVORITES;
    } catch (e) {
      console.warn('localStorage error reading favorites:', e);
      return INITIAL_FAVORITES;
    }
  });

  // Sync to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('localStorage error saving favorites:', e);
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (recipeId: string): boolean => {
      return favorites.includes(recipeId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback((recipeId: string): boolean => {
    let nowFavorite = false;
    setFavorites((prev) => {
      if (prev.includes(recipeId)) {
        nowFavorite = false;
        return prev.filter((id) => id !== recipeId);
      } else {
        nowFavorite = true;
        return [...prev, recipeId];
      }
    });
    return nowFavorite;
  }, []);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    favoritesCount: favorites.length,
    isFavorite,
    toggleFavorite,
    clearAllFavorites,
  };
}

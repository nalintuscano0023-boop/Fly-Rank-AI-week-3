import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useFavorites } from '../hooks/useFavorites';

const STORAGE_KEY = 'flyrank_recipe_favorites_v1';

describe('useFavorites hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with seed favorites when localStorage is empty', () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites.length).toBeGreaterThan(0);
    expect(result.current.isFavorite('sample-1')).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('loads existing favorites from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['fav-101', 'fav-102']));
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual(['fav-101', 'fav-102']);
    expect(result.current.favoritesCount).toBe(2);
    expect(result.current.isFavorite('fav-101')).toBe(true);
    expect(result.current.isFavorite('unknown')).toBe(false);
  });

  it('toggles favorites on and off and persists to localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['fav-1']));
    const { result } = renderHook(() => useFavorites());

    // Add new favorite
    act(() => {
      const isNowFav = result.current.toggleFavorite('fav-2');
      expect(isNowFav).toBe(true);
    });

    expect(result.current.favorites).toContain('fav-2');
    expect(result.current.favoritesCount).toBe(2);

    // Remove existing favorite
    act(() => {
      const isNowFav = result.current.toggleFavorite('fav-1');
      expect(isNowFav).toBe(false);
    });

    expect(result.current.favorites).not.toContain('fav-1');
    expect(result.current.favoritesCount).toBe(1);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(saved).toEqual(['fav-2']);
  });
});

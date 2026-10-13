import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RecipeCard } from '../components/RecipeCard';
import type { Recipe } from '../types/recipe';

describe('RecipeCard Component', () => {
  const mockRecipe: Recipe = {
    id: 'rec-1',
    name: 'Creamy Lemon Pasta',
    category: 'Pasta',
    area: 'Italian',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d62817d2',
    cookingTimeMinutes: 20,
    prepTimeMinutes: 10,
    servings: 2,
    tags: ['Quick', 'Vegetarian'],
    dataSource: 'sample',
  };

  it('renders recipe card with food title, category, and cook time', () => {
    render(
      <RecipeCard
        recipe={mockRecipe}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onSelectRecipe={vi.fn()}
      />
    );

    expect(screen.getByText('Creamy Lemon Pasta')).toBeInTheDocument();
    expect(screen.getByText('Pasta')).toBeInTheDocument();
    expect(screen.getByText('20m cook')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view recipe details/i })).toBeInTheDocument();
  });

  it('triggers onToggleFavorite without opening modal when favorite button is clicked', () => {
    const handleToggleFavorite = vi.fn();
    const handleSelectRecipe = vi.fn();

    render(
      <RecipeCard
        recipe={mockRecipe}
        isFavorite={false}
        onToggleFavorite={handleToggleFavorite}
        onSelectRecipe={handleSelectRecipe}
      />
    );

    const favButton = screen.getByRole('button', {
      name: /add creamy lemon pasta to favorites/i,
    });
    fireEvent.click(favButton);

    expect(handleToggleFavorite).toHaveBeenCalledWith('rec-1');
    expect(handleSelectRecipe).not.toHaveBeenCalled();
  });

  it('triggers onSelectRecipe when the card article is clicked or Enter is pressed', () => {
    const handleSelectRecipe = vi.fn();

    render(
      <RecipeCard
        recipe={mockRecipe}
        isFavorite={true}
        onToggleFavorite={vi.fn()}
        onSelectRecipe={handleSelectRecipe}
      />
    );

    const card = screen.getByRole('button', { name: /view recipe details/i });
    fireEvent.click(card);

    expect(handleSelectRecipe).toHaveBeenCalledWith('rec-1');

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleSelectRecipe).toHaveBeenCalledTimes(2);
  });
});

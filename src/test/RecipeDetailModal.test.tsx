import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RecipeDetailModal } from '../components/RecipeDetailModal';
import type { RecipeDetail } from '../types/recipe';

describe('RecipeDetailModal Component', () => {
  const mockDetail: RecipeDetail = {
    id: 'detail-1',
    name: 'Truffle Mushroom Risotto',
    category: 'Vegetarian',
    area: 'Italian',
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9',
    cookingTimeMinutes: 30,
    prepTimeMinutes: 10,
    servings: 4,
    tags: ['Vegetarian', 'Gourmet'],
    dataSource: 'sample',
    ingredients: [
      { name: 'Arborio rice', measure: '1.5 cups' },
      { name: 'Wild mushrooms', measure: '400g sliced' },
    ],
    instructions: [
      'Sauté mushrooms until golden brown.',
      'Toast arborio rice and gradually stir in warm broth.',
    ],
    rawInstructions: 'Cook risotto.',
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <RecipeDetailModal
        recipe={mockDetail}
        loading={false}
        isOpen={false}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders dialog with recipe title, ingredients checklist, and instructions when open', () => {
    render(
      <RecipeDetailModal
        recipe={mockDetail}
        loading={false}
        isOpen={true}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Truffle Mushroom Risotto')).toBeInTheDocument();
    expect(screen.getByText('Arborio rice')).toBeInTheDocument();
    expect(screen.getByText('1.5 cups')).toBeInTheDocument();
    expect(screen.getByText(/Sauté mushrooms until golden brown/i)).toBeInTheDocument();
    expect(screen.getByText(/Toast arborio rice/i)).toBeInTheDocument();
  });

  it('allows checking off ingredients interactively', () => {
    render(
      <RecipeDetailModal
        recipe={mockDetail}
        loading={false}
        isOpen={true}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const ingredientItem = screen.getByText('Arborio rice').closest('li');
    expect(ingredientItem).not.toHaveClass('checked');

    fireEvent.click(ingredientItem!);
    expect(ingredientItem).toHaveClass('checked');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <RecipeDetailModal
        recipe={mockDetail}
        loading={false}
        isOpen={true}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /close recipe details/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});

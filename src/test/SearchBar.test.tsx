import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from '../components/SearchBar';

describe('SearchBar Component', () => {
  it('renders input with placeholder and accessibility label', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);

    const input = screen.getByRole('textbox', { name: /search recipes by name/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder');
  });

  it('calls onChange when user types query', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox', { name: /search recipes by name/i });
    fireEvent.change(input, { target: { value: 'salmon' } });

    expect(handleChange).toHaveBeenCalledWith('salmon');
  });

  it('renders clear button when value is present and clears query on click', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="curry" onChange={handleChange} />);

    const clearBtn = screen.getByRole('button', { name: /clear search query/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith('');
  });
});

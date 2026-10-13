import { describe, expect, it } from 'vitest';
import { parseMealToDetail, parseMealToRecipe } from '../services/recipeApi';

describe('Recipe Parser Service', () => {
  const mockMealDbRaw = {
    idMeal: '52772',
    strMeal: 'Teriyaki Chicken Casserole',
    strCategory: 'Chicken',
    strArea: 'Japanese',
    strMealThumb: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
    strTags: 'Meat,Casserole',
    strInstructions:
      'Preheat oven to 350° F.\r\nCombine sauce ingredients and bring to a boil.\r\nPour sauce over chicken and bake for 30 minutes.',
    strIngredient1: 'soy sauce',
    strMeasure1: '3/4 cup',
    strIngredient2: 'water',
    strMeasure2: '1/2 cup',
    strIngredient3: 'brown sugar',
    strMeasure3: '1/4 cup',
    strIngredient4: '',
    strMeasure4: '',
    strIngredient5: '  ',
    strMeasure5: 'null',
    strYoutube: 'https://www.youtube.com/watch?v=4aZr5hZXP_s',
    strSource: 'https://findingtimeforcooking.com/teriyaki-chicken-casserole/',
  };

  it('correctly parses raw MealDB object into a Recipe card summary', () => {
    const recipe = parseMealToRecipe(mockMealDbRaw, false);

    expect(recipe.id).toBe('52772');
    expect(recipe.name).toBe('Teriyaki Chicken Casserole');
    expect(recipe.category).toBe('Chicken');
    expect(recipe.area).toBe('Japanese');
    expect(recipe.image).toBe(mockMealDbRaw.strMealThumb);
    expect(recipe.tags).toContain('Meat');
    expect(recipe.tags).toContain('Japanese');
    expect(recipe.cookingTimeMinutes).toBeGreaterThan(0);
    expect(recipe.dataSource).toBe('api');
  });

  it('filters empty or null ingredients and pairs them with measures correctly', () => {
    const detail = parseMealToDetail(mockMealDbRaw, false);

    expect(detail.ingredients).toHaveLength(3);
    expect(detail.ingredients[0]).toEqual({ name: 'soy sauce', measure: '3/4 cup' });
    expect(detail.ingredients[1]).toEqual({ name: 'water', measure: '1/2 cup' });
    expect(detail.ingredients[2]).toEqual({ name: 'brown sugar', measure: '1/4 cup' });
  });

  it('splits multiline instructions into clean sequential steps', () => {
    const detail = parseMealToDetail(mockMealDbRaw, false);

    expect(detail.instructions.length).toBeGreaterThanOrEqual(2);
    expect(detail.instructions[0]).toBe('Preheat oven to 350° F.');
  });

  it('handles empty or malformed input with graceful fallbacks', () => {
    const emptyRaw = {};
    const recipe = parseMealToRecipe(emptyRaw, true);

    expect(recipe.name).toBe('Untitled Recipe');
    expect(recipe.category).toBe('General');
    expect(recipe.cookingTimeMinutes).toBeGreaterThan(0);
    expect(recipe.dataSource).toBe('sample');
  });
});

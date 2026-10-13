export interface IngredientItem {
  name: string;
  measure: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  area?: string;
  image: string;
  cookingTimeMinutes: number;
  prepTimeMinutes: number;
  servings: number;
  tags: string[];
  dataSource: 'api' | 'sample';
}

export interface RecipeDetail extends Recipe {
  instructions: string[];
  rawInstructions: string;
  ingredients: IngredientItem[];
  youtubeUrl?: string;
  sourceUrl?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  thumbnail?: string;
  description?: string;
}

export type ViewTab = 'discover' | 'favorites';

export type SortOption = 'default' | 'name-asc' | 'time-asc' | 'time-desc';

import type { CategoryItem, IngredientItem, Recipe, RecipeDetail } from '../types/recipe';
import { SAMPLE_CATEGORIES, SAMPLE_RECIPES } from '../data/sampleRecipes';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const REQUEST_TIMEOUT_MS = 6000;

export interface ApiResponse<T> {
  data: T;
  isFallback: boolean;
  error?: string;
}

/**
 * Parses raw MealDB meal object into clean Recipe model
 */
export function parseMealToRecipe(raw: Record<string, any>, isFallback = false): Recipe {
  const id = String(raw.idMeal || raw.id || '');
  const name = String(raw.strMeal || raw.name || 'Untitled Recipe');
  const category = String(raw.strCategory || raw.category || 'General');
  const area = raw.strArea || raw.area || undefined;
  const image = raw.strMealThumb || raw.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
  
  // Calculate a reasonable cooking & prep time based on id or instructions
  const idSeed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const estimatedCookTime = raw.cookingTimeMinutes || Math.max(15, (idSeed % 6 + 2) * 5); // 15 to 40 min
  const estimatedPrepTime = raw.prepTimeMinutes || Math.max(10, (idSeed % 3 + 1) * 5);

  const tags: string[] = [];
  if (raw.strTags) {
    tags.push(...raw.strTags.split(',').map((t: string) => t.trim()).filter(Boolean));
  } else if (Array.isArray(raw.tags)) {
    tags.push(...raw.tags);
  }
  if (area && !tags.includes(area)) tags.push(area);

  return {
    id,
    name,
    category,
    area,
    image,
    cookingTimeMinutes: estimatedCookTime,
    prepTimeMinutes: estimatedPrepTime,
    servings: raw.servings || 4,
    tags,
    dataSource: isFallback ? 'sample' : 'api',
  };
}

/**
 * Parses raw MealDB meal object into full RecipeDetail model
 */
export function parseMealToDetail(raw: Record<string, any>, isFallback = false): RecipeDetail {
  const baseRecipe = parseMealToRecipe(raw, isFallback);

  const ingredients: IngredientItem[] = [];
  if (Array.isArray(raw.ingredients)) {
    ingredients.push(...raw.ingredients);
  } else {
    for (let i = 1; i <= 20; i++) {
      const ing = raw[`strIngredient${i}`];
      const measure = raw[`strMeasure${i}`];
      if (ing && typeof ing === 'string' && ing.trim() && ing.trim().toLowerCase() !== 'null') {
        ingredients.push({
          name: ing.trim(),
          measure: (measure && typeof measure === 'string' ? measure.trim() : '') || 'To taste',
        });
      }
    }
  }

  // Parse instructions into steps
  let instructions: string[] = [];
  const rawInstructions = raw.strInstructions || raw.rawInstructions || '';
  if (Array.isArray(raw.instructions) && raw.instructions.length > 0) {
    instructions = raw.instructions;
  } else if (rawInstructions) {
    instructions = rawInstructions
      .split(/\r?\n/)
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 10 && !line.match(/^(STEP\s*\d+:?$|INSTRUCTIONS:?$)/i));
    
    // If splitting by newline didn't create distinct steps, try splitting by period followed by capital letter
    if (instructions.length <= 1) {
      instructions = rawInstructions
        .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 15);
    }
  }

  if (instructions.length === 0) {
    instructions = ['Follow preparation instructions and cook according to desired taste and doneness.'];
  }

  return {
    ...baseRecipe,
    ingredients,
    instructions,
    rawInstructions: String(rawInstructions),
    youtubeUrl: raw.strYoutube || raw.youtubeUrl || undefined,
    sourceUrl: raw.strSource || raw.sourceUrl || undefined,
  };
}

/**
 * Fetch with automatic timeout abort
 */
async function fetchWithTimeout(url: string, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Link upstream signal if provided
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch categories with fallback
 */
export async function getCategories(signal?: AbortSignal): Promise<ApiResponse<CategoryItem[]>> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/categories.php`, signal);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    if (data.categories && Array.isArray(data.categories)) {
      const liveCategories: CategoryItem[] = [
        { id: 'cat-all', name: 'All' },
        ...data.categories.map((c: any) => ({
          id: `cat-${c.strCategory.toLowerCase()}`,
          name: c.strCategory,
          thumbnail: c.strCategoryThumb,
          description: c.strCategoryDescription,
        })),
      ];
      return { data: liveCategories, isFallback: false };
    }
    throw new Error('Malformed category response');
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    // Fallback to sample categories
    return { data: SAMPLE_CATEGORIES, isFallback: true, error: error?.message || 'Network error' };
  }
}

/**
 * Search recipes by name or fetch default list
 */
export async function searchRecipes(
  query = '',
  signal?: AbortSignal
): Promise<ApiResponse<Recipe[]>> {
  try {
    const trimmed = query.trim();
    const endpoint = `${BASE_URL}/search.php?s=${encodeURIComponent(trimmed)}`;
    const res = await fetchWithTimeout(endpoint, signal);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    
    if (data.meals && Array.isArray(data.meals)) {
      const recipes = data.meals.map((m: any) => parseMealToRecipe(m, false));
      return { data: recipes, isFallback: false };
    }
    
    // If API returned null meals, it means no recipes match query
    if (data.meals === null) {
      return { data: [], isFallback: false };
    }
    
    throw new Error('Invalid meals response');
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    // Fallback to sample recipes
    const filtered = SAMPLE_RECIPES.filter((r) =>
      !query.trim() || r.name.toLowerCase().includes(query.toLowerCase())
    ).map((r) => parseMealToRecipe(r, true));
    return { data: filtered, isFallback: true, error: error?.message || 'API request failed' };
  }
}

/**
 * Filter recipes by category
 */
export async function getRecipesByCategory(
  category: string,
  signal?: AbortSignal
): Promise<ApiResponse<Recipe[]>> {
  if (!category || category === 'All') {
    return searchRecipes('', signal);
  }

  try {
    const res = await fetchWithTimeout(
      `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`,
      signal
    );
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    if (data.meals && Array.isArray(data.meals)) {
      const recipes = data.meals.map((m: any) => ({
        ...parseMealToRecipe(m, false),
        category,
      }));
      return { data: recipes, isFallback: false };
    }
    return { data: [], isFallback: false };
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    const filtered = SAMPLE_RECIPES.filter(
      (r) => r.category.toLowerCase() === category.toLowerCase()
    ).map((r) => parseMealToRecipe(r, true));
    return { data: filtered, isFallback: true, error: error?.message || 'API request failed' };
  }
}

/**
 * Fetch detailed recipe by ID
 */
export async function getRecipeDetailById(
  id: string,
  signal?: AbortSignal
): Promise<ApiResponse<RecipeDetail | null>> {
  // First check if it's a sample recipe
  const foundSample = SAMPLE_RECIPES.find((r) => r.id === id);
  if (foundSample) {
    return { data: foundSample, isFallback: true };
  }

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`, signal);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();
    if (data.meals && data.meals.length > 0) {
      return { data: parseMealToDetail(data.meals[0], false), isFallback: false };
    }
    return { data: null, isFallback: false };
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    // In fallback mode, check if we can return a default recipe
    return {
      data: SAMPLE_RECIPES[0] || null,
      isFallback: true,
      error: error?.message || 'Could not fetch details',
    };
  }
}

/**
 * Batch get recipes by IDs (used for Favorites view)
 */
export async function getRecipesByIds(
  ids: string[],
  signal?: AbortSignal
): Promise<Recipe[]> {
  if (!ids || ids.length === 0) return [];

  // Split into sample and API IDs
  const results: Recipe[] = [];
  const missingIds: string[] = [];

  for (const id of ids) {
    const sample = SAMPLE_RECIPES.find((s) => s.id === id);
    if (sample) {
      results.push(parseMealToRecipe(sample, true));
    } else {
      missingIds.push(id);
    }
  }

  if (missingIds.length > 0) {
    const fetchPromises = missingIds.map(async (id) => {
      try {
        const detailRes = await getRecipeDetailById(id, signal);
        return detailRes.data ? parseMealToRecipe(detailRes.data, detailRes.isFallback) : null;
      } catch {
        return null;
      }
    });

    const fetched = await Promise.all(fetchPromises);
    for (const item of fetched) {
      if (item) results.push(item);
    }
  }

  return results;
}

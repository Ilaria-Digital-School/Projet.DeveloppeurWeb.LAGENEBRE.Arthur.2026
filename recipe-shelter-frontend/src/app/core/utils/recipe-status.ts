import { RecipeStatus } from '../models/recipe.model';

const recipeStatusLabels: Record<RecipeStatus, string> = {
  draft: 'Brouillon',
  pending: 'En attente',
  rejected: 'À corriger',
  published: 'Publiée',
  archived: 'Archivée'
};

export function getRecipeStatusLabel(status: RecipeStatus | string | null | undefined): string {
  if (!status)
    return 'Statut inconnu';

  return recipeStatusLabels[status as RecipeStatus] ?? 'Statut inconnu';
}

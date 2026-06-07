import { getRecipeStatusLabel } from './recipe-status';

describe('getRecipeStatusLabel', () => {
  it('should return known labels and a fallback for unknown statuses', () => {
    expect(getRecipeStatusLabel('draft')).toBe('Brouillon');
    expect(getRecipeStatusLabel('pending')).toBe('En attente');
    expect(getRecipeStatusLabel('unknown')).toBe('Statut inconnu');
  });
});

import { resolveCategoryIconKind } from './category-icon-map';

describe('resolveCategoryIconKind', () => {
  it('should resolve known icons and fall back to default', () => {
    expect(resolveCategoryIconKind(' Cake ')).toBe('cake');
    expect(resolveCategoryIconKind('unknown')).toBe('default');
  });
});

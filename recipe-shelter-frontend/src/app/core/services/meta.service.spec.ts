import { TestBed } from '@angular/core/testing';

import { MetaService } from './meta.service';

describe('MetaService', () => {
  let service: MetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetaService);
  });

  afterEach(() => {
    document.querySelectorAll('meta[name="description"]').forEach((tag) => tag.remove());
  });

  it('should set the description for a known page title', () => {
    service.setDescriptionForPage('Recherche');

    expect(getDescription()).toBe('Recherchez parmi des milliers de recettes sur Recipe Shelter par ingrédient, catégorie ou temps de préparation.');
  });

  it('should fall back to the homepage description without a page title', () => {
    service.setDescriptionForPage(undefined);

    expect(getDescription()).toBe('Découvrez des milliers de recettes de cuisine sur Recipe Shelter : recettes faciles, rapides et gourmandes à partager, noter et sauvegarder pour tous les niveaux.');
  });

  it('should fall back to the homepage description for an unknown page title', () => {
    service.setDescriptionForPage('Page inconnue');

    expect(getDescription()).toBe('Découvrez des milliers de recettes de cuisine sur Recipe Shelter : recettes faciles, rapides et gourmandes à partager, noter et sauvegarder pour tous les niveaux.');
  });

  it('should set a custom description', () => {
    service.setDescription('Description personnalisée.');

    expect(getDescription()).toBe('Description personnalisée.');
  });
});

function getDescription(): string | null {
  return document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? null;
}

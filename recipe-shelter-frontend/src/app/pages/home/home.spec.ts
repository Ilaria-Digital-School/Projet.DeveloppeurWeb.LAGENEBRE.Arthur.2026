import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PublicRecipeListItem } from '../../core/models/recipe.model';
import { FavoritesService } from '../../core/services/favorites.service';
import { RecipeReferenceDataService } from '../../core/services/recipe-reference-data.service';
import { RecipesService } from '../../core/services/recipes.service';
import { SessionService } from '../../core/services/session.service';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  const recentRecipe: PublicRecipeListItem = {
    id: 1,
    title: 'Tarte fine',
    slug: 'tarte-fine',
    description: 'Une recette simple.',
    category: 'Dessert',
    coverImageUrl: null,
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    restTimeMinutes: null,
    servings: 4,
    authorUsername: 'alice',
    publishedAt: '2026-01-12T10:00:00.000Z',
    isFavorite: false
  };
  const secondRecentRecipe: PublicRecipeListItem = {
    ...recentRecipe,
    id: 3,
    title: 'Salade croquante',
    slug: 'salade-croquante'
  };
  const referenceDataServiceMock = {
    getCategories: vi.fn().mockReturnValue(of([
      { id: 1, name: 'Entree', iconName: 'salad' },
      { id: 2, name: 'Dessert', iconName: 'cake' }
    ]))
  };
  const recipesServiceMock = {
    getRecentPublished: vi.fn().mockReturnValue(of([recentRecipe, secondRecentRecipe]))
  };
  const favoritesServiceMock = {
    createFavorite: vi.fn().mockReturnValue(of({})),
    deleteFavorite: vi.fn().mockReturnValue(of({ ok: true }))
  };
  const sessionServiceMock = {
    isAuthenticated: vi.fn().mockReturnValue(false),
    user: vi.fn().mockReturnValue(null)
  };

  beforeEach(async () => {
    referenceDataServiceMock.getCategories.mockReturnValue(of([
      { id: 1, name: 'Entree', iconName: 'salad' },
      { id: 2, name: 'Dessert', iconName: 'cake' }
    ]));
    recipesServiceMock.getRecentPublished.mockReturnValue(of([recentRecipe, secondRecentRecipe]));
    favoritesServiceMock.createFavorite.mockReturnValue(of({}));
    favoritesServiceMock.deleteFavorite.mockReturnValue(of({ ok: true }));
    sessionServiceMock.isAuthenticated.mockReturnValue(false);
    sessionServiceMock.user.mockReturnValue(null);

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: RecipeReferenceDataService, useValue: referenceDataServiceMock },
        { provide: RecipesService, useValue: recipesServiceMock },
        { provide: FavoritesService, useValue: favoritesServiceMock },
        { provide: SessionService, useValue: sessionServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display category links to search', () => {
    fixture.detectChanges();

    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('.rs-home-category-card'));

    expect(links).toHaveLength(2);
    expect(links[0].textContent?.trim()).toBe('Entree');
    expect(links[0].getAttribute('href')).toBe('/recipes/search?categoryId=1');
  });

  it('should display recent recipes', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    expect(recipesServiceMock.getRecentPublished).toHaveBeenCalledWith(12);
    expect(text).toContain('Dernieres recettes publiees');
    expect(text).toContain('Tarte fine');
  });

  it('should render recent recipes as a grid', () => {
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('.rs-home-recipes-grid');
    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.rs-home-recipes-item'));

    expect(grid).toBeTruthy();
    expect(items).toHaveLength(2);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { PublicRecipeListItem } from '../../../core/models/recipe.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { RecipesService } from '../../../core/services/recipes.service';
import { SessionService } from '../../../core/services/session.service';
import { RecipeList } from './recipe-list';

describe('RecipeList', () => {
  let component: RecipeList;
  let fixture: ComponentFixture<RecipeList>;
  const queryParamMap$ = new BehaviorSubject(convertToParamMap({}));
  const recipe: PublicRecipeListItem = {
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
  const paginatedRecipes = (items: PublicRecipeListItem[] = [], page = 1) => ({
    items,
    pagination: {
      page,
      limit: 12,
      totalItems: items.length,
      totalPages: items.length > 0 ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: page > 1
    }
  });
  const recipesServiceMock = {
    getPublished: vi.fn().mockReturnValue(of(paginatedRecipes()))
  };
  const favoritesServiceMock = {
    createFavorite: vi.fn().mockReturnValue(of({})),
    deleteFavorite: vi.fn().mockReturnValue(of({}))
  };
  const sessionServiceMock = {
    user: vi.fn().mockReturnValue({ id: 42, username: 'bob' })
  };
  const routerMock = {
    navigate: vi.fn()
  };
  const activatedRouteMock = {
    queryParamMap: queryParamMap$.asObservable()
  };

  beforeEach(async () => {
    queryParamMap$.next(convertToParamMap({}));
    recipesServiceMock.getPublished.mockReturnValue(of(paginatedRecipes()));
    favoritesServiceMock.createFavorite.mockReturnValue(of({ userId: 42, recipeId: 1, createdAt: '2026-05-06T13:18:14.000Z' }));
    favoritesServiceMock.deleteFavorite.mockReturnValue(of(true));
    sessionServiceMock.user.mockReturnValue({ id: 42, username: 'bob' });
    routerMock.navigate.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [RecipeList],
      providers: [
        { provide: RecipesService, useValue: recipesServiceMock },
        { provide: FavoritesService, useValue: favoritesServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display an empty state when there are no published recipes', () => {
    expect(fixture.nativeElement.textContent).toContain('Aucune recette publi');
  });

  it('should display a create recipe link', () => {
    const createRecipeLink: HTMLAnchorElement | null = fixture.nativeElement.querySelector('.rs-page-header .rs-btn-primary');

    expect(createRecipeLink?.textContent?.trim()).toBe('Créer une recette');
  });

  it('should add a recipe to favorites from the list', async () => {
    recipesServiceMock.getPublished.mockReturnValue(of(paginatedRecipes([recipe])));
    fixture = TestBed.createComponent(RecipeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const favoriteButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-favorite-badge');

    favoriteButton?.click();

    expect(favoritesServiceMock.createFavorite).toHaveBeenCalledWith(1);
  });

  it('should redirect unauthenticated users to sign in from the list', async () => {
    recipesServiceMock.getPublished.mockReturnValue(of(paginatedRecipes([recipe])));
    sessionServiceMock.user.mockReturnValue(null);
    fixture = TestBed.createComponent(RecipeList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const favoriteButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-favorite-badge');

    favoriteButton?.click();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sign-in'], { queryParams: { redirectTo: '/recipes' } });
  });

  it('should load the page from query params', async () => {
    queryParamMap$.next(convertToParamMap({ page: '2' }));
    await fixture.whenStable();

    expect(recipesServiceMock.getPublished).toHaveBeenLastCalledWith({ page: 2, limit: 12 });
  });
});

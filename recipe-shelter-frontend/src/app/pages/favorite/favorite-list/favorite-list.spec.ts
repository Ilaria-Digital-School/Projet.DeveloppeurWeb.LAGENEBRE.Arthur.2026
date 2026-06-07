import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { PublicRecipeListItem } from '../../../core/models/recipe.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { SessionService } from '../../../core/services/session.service';
import { FavoriteList } from './favorite-list';

describe('FavoriteList', () => {
  let component: FavoriteList;
  let fixture: ComponentFixture<FavoriteList>;
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
    isFavorite: true
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
  const favoritesServiceMock = {
    getFavorites: vi.fn().mockReturnValue(of(paginatedRecipes())),
    deleteFavorite: vi.fn().mockReturnValue(of(true))
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
    favoritesServiceMock.getFavorites.mockReturnValue(of(paginatedRecipes()));
    favoritesServiceMock.deleteFavorite.mockReturnValue(of(true));
    sessionServiceMock.user.mockReturnValue({ id: 42, username: 'bob' });
    routerMock.navigate.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [FavoriteList],
      providers: [
        { provide: FavoritesService, useValue: favoritesServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoriteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display an empty state when there are no favorite recipes', () => {
    expect(fixture.nativeElement.textContent).toContain('Aucune recette favorite');
  });

  it('should load favorite recipes', async () => {
    favoritesServiceMock.getFavorites.mockReturnValue(of(paginatedRecipes([recipe])));
    fixture = TestBed.createComponent(FavoriteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Tarte fine');
  });

  it('should remove a recipe from favorites', async () => {
    favoritesServiceMock.getFavorites.mockReturnValue(of(paginatedRecipes([recipe])));
    fixture = TestBed.createComponent(FavoriteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const favoriteButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-favorite-badge');

    favoriteButton?.click();

    expect(favoritesServiceMock.deleteFavorite).toHaveBeenCalledWith(1);
  });
});

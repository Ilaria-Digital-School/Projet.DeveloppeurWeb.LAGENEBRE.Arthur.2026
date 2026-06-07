import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { FavoritesService } from '../../core/services/favorites.service';
import { RecipeReferenceDataService } from '../../core/services/recipe-reference-data.service';
import { RecipesService } from '../../core/services/recipes.service';
import { SessionService } from '../../core/services/session.service';
import { Search } from './search';

describe('Search', () => {
  let component: Search;
  let fixture: ComponentFixture<Search>;
  const queryParamMap$ = new BehaviorSubject(convertToParamMap({}));
  const paginatedRecipes = (items: unknown[] = [], page = 1) => ({
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
    searchPublished: vi.fn().mockReturnValue(of(paginatedRecipes()))
  };
  const referenceDataServiceMock = {
    getCategories: vi.fn().mockReturnValue(of([
      { id: 1, name: 'Entrée', iconName: 'salad' },
      { id: 2, name: 'Dessert', iconName: 'cake' }
    ])),
    getIngredients: vi.fn().mockReturnValue(of([
      { id: 18, name: 'Tomate' },
      { id: 103, name: 'Basilic' }
    ])),
    getTags: vi.fn().mockReturnValue(of([
      { id: 1, name: 'Rapide' },
      { id: 2, name: 'Végétarien' }
    ]))
  };
  const favoritesServiceMock = {
    createFavorite: vi.fn().mockReturnValue(of({})),
    deleteFavorite: vi.fn().mockReturnValue(of({ ok: true }))
  };
  const sessionServiceMock = {
    user: vi.fn().mockReturnValue({ id: 42, username: 'bob' })
  };
  const routerMock = {
    navigate: vi.fn(),
    url: '/search'
  };
  const activatedRouteMock = {
    queryParamMap: queryParamMap$.asObservable()
  };

  beforeEach(async () => {
    queryParamMap$.next(convertToParamMap({}));
    recipesServiceMock.searchPublished.mockReturnValue(of(paginatedRecipes()));
    referenceDataServiceMock.getCategories.mockReturnValue(of([
      { id: 1, name: 'Entrée', iconName: 'salad' },
      { id: 2, name: 'Dessert', iconName: 'cake' }
    ]));
    referenceDataServiceMock.getIngredients.mockReturnValue(of([
      { id: 18, name: 'Tomate' },
      { id: 103, name: 'Basilic' }
    ]));
    referenceDataServiceMock.getTags.mockReturnValue(of([
      { id: 1, name: 'Rapide' },
      { id: 2, name: 'Végétarien' }
    ]));
    favoritesServiceMock.createFavorite.mockReturnValue(of({}));
    favoritesServiceMock.deleteFavorite.mockReturnValue(of({ ok: true }));
    sessionServiceMock.user.mockReturnValue({ id: 42, username: 'bob' });
    routerMock.navigate.mockResolvedValue(true);
    routerMock.url = '/search';

    await TestBed.configureTestingModule({
      imports: [Search],
      providers: [
        { provide: RecipesService, useValue: recipesServiceMock },
        { provide: RecipeReferenceDataService, useValue: referenceDataServiceMock },
        { provide: FavoritesService, useValue: favoritesServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should search with query params from the URL', async () => {
    queryParamMap$.next(convertToParamMap({
      q: 'tarte',
      categoryId: '2',
      tagIds: '1,2',
      ingredientIds: '18,103',
      maxTotalTimeMinutes: '60',
      page: '2'
    }));
    await fixture.whenStable();

    expect(recipesServiceMock.searchPublished).toHaveBeenLastCalledWith({
      q: 'tarte',
      categoryId: 2,
      tagIds: [1, 2],
      ingredientIds: [18, 103],
      maxTotalTimeMinutes: 60,
      page: 2,
      limit: 12
    });
  });

  it('should prefill the form with query params', async () => {
    queryParamMap$.next(convertToParamMap({
      q: 'tarte',
      categoryId: '2',
      tagIds: '1,2',
      ingredientIds: '18,103',
      maxTotalTimeMinutes: '60'
    }));
    fixture.detectChanges();
    await fixture.whenStable();

    const textInput: HTMLInputElement | null = fixture.nativeElement.querySelector('#search-q');
    const categorySelect: HTMLSelectElement | null = fixture.nativeElement.querySelector('#search-category');
    const maxTotalTimeInput: HTMLInputElement | null = fixture.nativeElement.querySelector('#search-max-total-time');
    const form = component as unknown as {
      form: { controls: { tagIds: { value: number[] }; ingredientIds: { value: number[] } } }
    };

    expect(textInput?.value).toBe('tarte');
    expect(categorySelect?.value).toContain('2');
    expect(maxTotalTimeInput?.value).toBe('60');
    expect(form.form.controls.tagIds.value).toEqual([1, 2]);
    expect(form.form.controls.ingredientIds.value).toEqual([18, 103]);
  });

  it('should update the URL on submit', async () => {
    const textInput: HTMLInputElement | null = fixture.nativeElement.querySelector('#search-q');
    const categorySelect: HTMLSelectElement | null = fixture.nativeElement.querySelector('#search-category');
    const formControls = (component as unknown as {
      form: {
        controls: {
          tagIds: { setValue(value: number[]): void };
          ingredientIds: { setValue(value: number[]): void };
          maxTotalTimeMinutes: { setValue(value: number): void };
        }
      }
    }).form.controls;

    textInput!.value = 'cake';
    textInput!.dispatchEvent(new Event('input'));
    categorySelect!.value = categorySelect!.options[2].value;
    categorySelect!.dispatchEvent(new Event('change'));
    formControls.tagIds.setValue([1, 2]);
    formControls.ingredientIds.setValue([18, 103]);
    formControls.maxTotalTimeMinutes.setValue(60);
    fixture.detectChanges();

    const form: HTMLFormElement | null = fixture.nativeElement.querySelector('form');
    form?.dispatchEvent(new Event('submit'));

    expect(routerMock.navigate).toHaveBeenCalledWith([], {
      relativeTo: activatedRouteMock,
      queryParams: { q: 'cake', categoryId: 2, tagIds: '1,2', ingredientIds: '18,103', maxTotalTimeMinutes: 60, page: 1 }
    });
  });

  it('should preserve filters when changing page', () => {
    const search = component as unknown as { onPageChange(page: number): void };

    search.onPageChange(2);

    expect(routerMock.navigate).toHaveBeenCalledWith([], {
      relativeTo: activatedRouteMock,
      queryParams: { page: 2 },
      queryParamsHandling: 'merge'
    });
  });

  it('should disable search actions while the form is empty', () => {
    fixture.detectChanges();

    const searchButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-btn-primary');
    const resetButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-btn-outline');

    expect(searchButton?.disabled).toBe(true);
    expect(resetButton?.disabled).toBe(true);
  });

  it('should enable search actions when a criterion is filled', () => {
    const textInput: HTMLInputElement | null = fixture.nativeElement.querySelector('#search-q');

    textInput!.value = 'cake';
    textInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const searchButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-btn-primary');
    const resetButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-btn-outline');

    expect(searchButton?.disabled).toBe(false);
    expect(resetButton?.disabled).toBe(false);
  });

  it('should keep results hidden until the search is submitted', () => {
    const textInput: HTMLInputElement | null = fixture.nativeElement.querySelector('#search-q');

    textInput!.value = 'cake';
    textInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('rs-recipe-list-shell')).toBeNull();

    const form: HTMLFormElement | null = fixture.nativeElement.querySelector('form');
    form?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('rs-recipe-list-shell')).not.toBeNull();
  });

  it('should keep results visible when a criterion changes after submit', () => {
    const textInput: HTMLInputElement | null = fixture.nativeElement.querySelector('#search-q');
    const form: HTMLFormElement | null = fixture.nativeElement.querySelector('form');

    textInput!.value = 'cake';
    textInput!.dispatchEvent(new Event('input'));
    form?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('rs-recipe-list-shell')).not.toBeNull();

    textInput!.value = 'tarte';
    textInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('rs-recipe-list-shell')).not.toBeNull();
  });

  it('should clear filters on reset', () => {
    const textInput: HTMLInputElement | null = fixture.nativeElement.querySelector('#search-q');
    const resetButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-btn-outline');

    textInput!.value = 'cake';
    textInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    resetButton?.click();

    expect(routerMock.navigate).toHaveBeenCalledWith([], {
      relativeTo: activatedRouteMock,
      queryParams: { q: null, categoryId: null, tagIds: null, ingredientIds: null, maxTotalTimeMinutes: null, page: null }
    });
  });
});

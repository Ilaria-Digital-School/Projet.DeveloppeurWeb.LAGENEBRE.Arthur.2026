import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, map, Observable, of, switchMap } from 'rxjs';

import { PaginatedResponse, PaginationMeta } from '../../core/models/pagination.model';
import { PublicRecipeListItem } from '../../core/models/recipe.model';
import { FavoritesService } from '../../core/services/favorites.service';
import { RecipeReferenceDataService, RecipeReferenceOption } from '../../core/services/recipe-reference-data.service';
import { RecipeSearchParams, RecipesService } from '../../core/services/recipes.service';
import { SessionService } from '../../core/services/session.service';
import { RecipeListShell } from '../../shared/layouts/recipe-list-shell/recipe-list-shell';
import { RecipeCard } from '../../shared/recipe-card/recipe-card';

interface SearchForm {
  q: FormControl<string>;
  categoryId: FormControl<number | null>;
  tagIds: FormControl<number[]>;
  ingredientIds: FormControl<number[]>;
  maxTotalTimeMinutes: FormControl<number | null>;
}

interface SearchFormValue {
  q: string;
  categoryId: number | null;
  tagIds: number[];
  ingredientIds: number[];
  maxTotalTimeMinutes: number | null;
}

@Component({
  selector: 'rs-search',
  standalone: true,
  imports: [ReactiveFormsModule, RecipeListShell, RecipeCard],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly favoritesService = inject(FavoritesService);
  private readonly referenceDataService = inject(RecipeReferenceDataService);
  private readonly recipesService = inject(RecipesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly recipesPerPage = 12;

  protected readonly form = new FormGroup<SearchForm>({
    q: new FormControl('', { nonNullable: true }),
    categoryId: new FormControl<number | null>({ value: null, disabled: true }),
    tagIds: new FormControl<number[]>({ value: [], disabled: true }, { nonNullable: true }),
    ingredientIds: new FormControl<number[]>({ value: [], disabled: true }, { nonNullable: true }),
    maxTotalTimeMinutes: new FormControl<number | null>(null)
  });
  protected readonly categories = signal<RecipeReferenceOption[]>([]);
  protected readonly categoriesLoading = signal(true);
  protected readonly categoriesError = signal('');
  protected readonly tags = signal<RecipeReferenceOption[]>([]);
  protected readonly tagsLoading = signal(true);
  protected readonly tagsError = signal('');
  protected readonly ingredients = signal<RecipeReferenceOption[]>([]);
  protected readonly ingredientsLoading = signal(true);
  protected readonly ingredientsError = signal('');
  protected readonly recipes = signal<PublicRecipeListItem[]>([]);
  protected readonly pagination = signal<PaginationMeta>(this.emptyPagination(1));
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly hasSubmittedSearch = signal(false);
  protected readonly favoriteUpdatingIds = signal<ReadonlySet<number>>(new Set());
  private readonly syncCategoryControlState = effect(() => {
    const categoryControl = this.form.controls.categoryId;

    if (this.categoriesLoading())
      categoryControl.disable({ emitEvent: false });
    else
      categoryControl.enable({ emitEvent: false });
  });
  private readonly syncTagControlState = effect(() => {
    const tagControl = this.form.controls.tagIds;

    if (this.tagsLoading())
      tagControl.disable({ emitEvent: false });
    else
      tagControl.enable({ emitEvent: false });
  });
  private readonly syncIngredientControlState = effect(() => {
    const ingredientControl = this.form.controls.ingredientIds;

    if (this.ingredientsLoading())
      ingredientControl.disable({ emitEvent: false });
    else
      ingredientControl.enable({ emitEvent: false });
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadTags();
    this.loadIngredients();
    this.watchQueryParams();
  }

  get isSearchEmpty(): boolean {
    const { q, categoryId, tagIds, ingredientIds, maxTotalTimeMinutes } = this.form.getRawValue();

    return (!q || q.trim() === '') && !categoryId && tagIds.length === 0 && ingredientIds.length === 0 && !maxTotalTimeMinutes;
  }

  isFavoriteUpdating(recipeId: number): boolean {
    return this.favoriteUpdatingIds().has(recipeId);
  }

  onSubmit(): void {
    if (this.isSearchEmpty)
      return;

    const params = this.toSearchParams(this.form.getRawValue());

    this.hasSubmittedSearch.set(true);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: params.q ?? null,
        categoryId: params.categoryId ?? null,
        tagIds: params.tagIds?.length ? params.tagIds.join(',') : null,
        ingredientIds: params.ingredientIds?.length ? params.ingredientIds.join(',') : null,
        maxTotalTimeMinutes: params.maxTotalTimeMinutes ?? null,
        page: 1,
      },
    });
  }

  onReset(): void {
    this.hasSubmittedSearch.set(false);
    this.form.reset({ q: '', categoryId: null, tagIds: [], ingredientIds: [], maxTotalTimeMinutes: null });
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: null,
        categoryId: null,
        tagIds: null,
        ingredientIds: null,
        maxTotalTimeMinutes: null,
        page: null,
      },
    });
  }

  onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }

  onFavoriteToggle(recipe: PublicRecipeListItem): void {
    const user = this.sessionService.user();

    if (!user) {
      this.router.navigate(['/sign-in'], { queryParams: { redirectTo: this.router.url } });
      return;
    }

    if (this.isFavoriteUpdating(recipe.id))
      return;

    const nextIsFavorite = !recipe.isFavorite;
    const request: Observable<unknown> = nextIsFavorite ? this.favoritesService.createFavorite(recipe.id) : this.favoritesService.deleteFavorite(recipe.id);

    this.setFavoriteUpdating(recipe.id, true);
    this.updateRecipeFavorite(recipe.id, nextIsFavorite);

    request.subscribe({
      next: () => {
        this.setFavoriteUpdating(recipe.id, false);
      },
      error: () => {
        this.updateRecipeFavorite(recipe.id, recipe.isFavorite);
        this.errorMessage.set('Impossible de mettre à jour les favoris pour le moment.');
        this.setFavoriteUpdating(recipe.id, false);
      }
    });
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoriesError.set('');

    this.referenceDataService.getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.categoriesLoading.set(false);
        },
        error: () => {
          this.categoriesError.set('Impossible de charger les catégories pour le moment.');
          this.categoriesLoading.set(false);
        }
      });
  }

  private loadTags(): void {
    this.tagsLoading.set(true);
    this.tagsError.set('');

    this.referenceDataService.getTags()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tags) => {
          this.tags.set(tags);
          this.tagsLoading.set(false);
        },
        error: () => {
          this.tagsError.set('Impossible de charger les tags pour le moment.');
          this.tagsLoading.set(false);
        }
      });
  }

  private loadIngredients(): void {
    this.ingredientsLoading.set(true);
    this.ingredientsError.set('');

    this.referenceDataService.getIngredients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ingredients) => {
          this.ingredients.set(ingredients);
          this.ingredientsLoading.set(false);
        },
        error: () => {
          this.ingredientsError.set('Impossible de charger les ingrédients pour le moment.');
          this.ingredientsLoading.set(false);
        }
      });
  }

  private watchQueryParams(): void {
    this.route.queryParamMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((params) => this.toSearchParams(params)),
        distinctUntilChanged((previous, current) => this.areSearchParamsEqual(previous, current)),
        switchMap((searchParams) => {
          this.syncForm(searchParams);
          this.isLoading.set(true);
          this.errorMessage.set('');

          if (this.areSearchParamsEmpty(searchParams)) {
            this.hasSubmittedSearch.set(false);
            this.isLoading.set(false);

            return of(this.emptyResponse(searchParams.page ?? 1));
          }

          this.hasSubmittedSearch.set(true);

          return this.recipesService.searchPublished({ ...searchParams, limit: this.recipesPerPage }).pipe(
            catchError(() => {
              this.errorMessage.set('Impossible de charger les recettes pour le moment.');
              return of(this.emptyResponse(searchParams.page ?? 1));
            }),
            finalize(() => this.isLoading.set(false))
          );
        })
      )
      .subscribe(({ items, pagination }) => {
        this.recipes.set(items);
        this.pagination.set(pagination);
      });
  }

  private areSearchParamsEmpty(params: RecipeSearchParams): boolean {
    return !params.q
      && !params.categoryId
      && !params.tagIds?.length
      && !params.ingredientIds?.length
      && !params.maxTotalTimeMinutes;
  }

  private syncForm(params: RecipeSearchParams): void {
    this.form.patchValue({
      q: params.q ?? '',
      categoryId: params.categoryId ?? null,
      tagIds: params.tagIds ?? [],
      ingredientIds: params.ingredientIds ?? [],
      maxTotalTimeMinutes: params.maxTotalTimeMinutes ?? null,
    }, { emitEvent: false });
  }

  private toSearchParams(value: SearchFormValue): RecipeSearchParams;
  private toSearchParams(value: ParamMap): RecipeSearchParams;
  private toSearchParams(value: SearchFormValue | ParamMap): RecipeSearchParams {
    const q = this.readTextParam(value, 'q');
    const categoryId = this.readNumberParam(value, 'categoryId');
    const tagIds = this.readNumberListParam(value, 'tagIds');
    const ingredientIds = this.readNumberListParam(value, 'ingredientIds');
    const maxTotalTimeMinutes = this.readNumberParam(value, 'maxTotalTimeMinutes');
    const page = this.isParamMap(value) ? this.readPageParam(value) : undefined;

    return {
      ...(q ? { q } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tagIds.length > 0 ? { tagIds } : {}),
      ...(ingredientIds.length > 0 ? { ingredientIds } : {}),
      ...(maxTotalTimeMinutes ? { maxTotalTimeMinutes } : {}),
      ...(page ? { page } : {})
    };
  }

  private readTextParam(value: SearchFormValue | ParamMap, key: 'q'): string | undefined {
    const rawValue = this.isParamMap(value) ? value.get(key) : value[key];
    const trimmedValue = typeof rawValue === 'string' ? rawValue.trim() : '';

    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }

  private readNumberParam(value: SearchFormValue | ParamMap, key: 'categoryId' | 'maxTotalTimeMinutes'): number | undefined {
    const rawValue = this.isParamMap(value) ? value.get(key) : value[key];
    const numberValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);

    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : undefined;
  }

  private readNumberListParam(value: SearchFormValue | ParamMap, key: 'tagIds' | 'ingredientIds'): number[] {
    const rawValues = this.isParamMap(value)
      ? value.getAll(key).flatMap((rawValue) => rawValue.split(','))
      : value[key];
    const values = Array.isArray(rawValues) ? rawValues : [];

    return Array.from(new Set(values
      .map((rawValue) => typeof rawValue === 'number' ? rawValue : Number(rawValue))
      .filter((numberValue) => Number.isInteger(numberValue) && numberValue > 0)));
  }

  private areSearchParamsEqual(previous: RecipeSearchParams, current: RecipeSearchParams): boolean {
    return previous.q === current.q
      && previous.categoryId === current.categoryId
      && this.areNumberListsEqual(previous.tagIds ?? [], current.tagIds ?? [])
      && this.areNumberListsEqual(previous.ingredientIds ?? [], current.ingredientIds ?? [])
      && previous.maxTotalTimeMinutes === current.maxTotalTimeMinutes
      && previous.page === current.page;
  }

  private readPageParam(value: ParamMap): number {
    const page = Number(value.get('page'));

    return Number.isInteger(page) && page > 0 ? page : 1;
  }

  private emptyResponse(page: number): PaginatedResponse<PublicRecipeListItem> {
    return {
      items: [],
      pagination: this.emptyPagination(page)
    };
  }

  private emptyPagination(page: number): PaginationMeta {
    return {
      page,
      limit: this.recipesPerPage,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: page > 1
    };
  }

  private isParamMap(value: SearchFormValue | ParamMap): value is ParamMap {
    return typeof (value as ParamMap).get === 'function';
  }

  private areNumberListsEqual(previous: number[], current: number[]): boolean {
    return previous.length === current.length && previous.every((value, index) => value === current[index]);
  }

  private updateRecipeFavorite(recipeId: number, isFavorite: boolean): void {
    this.recipes.update((recipes) => recipes.map((recipe) => recipe.id === recipeId ? { ...recipe, isFavorite } : recipe));
  }

  private setFavoriteUpdating(recipeId: number, isUpdating: boolean): void {
    this.favoriteUpdatingIds.update((ids) => {
      const nextIds = new Set(ids);

      if (isUpdating)
        nextIds.add(recipeId);
      else
        nextIds.delete(recipeId);

      return nextIds;
    });
  }
}

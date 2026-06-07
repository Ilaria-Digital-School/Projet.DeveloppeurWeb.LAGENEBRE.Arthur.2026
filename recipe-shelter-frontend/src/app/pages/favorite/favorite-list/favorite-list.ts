import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, map, Observable, of, switchMap } from 'rxjs';

import { PaginatedResponse, PaginationMeta } from '../../../core/models/pagination.model';
import { PublicRecipeListItem } from '../../../core/models/recipe.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { SessionService } from '../../../core/services/session.service';
import { RecipeListShell } from '../../../shared/layouts/recipe-list-shell/recipe-list-shell';
import { RecipeCard } from '../../../shared/recipe-card/recipe-card';

@Component({
  selector: 'rs-favorite-list',
  standalone: true,
  imports: [RecipeListShell, RecipeCard],
  templateUrl: './favorite-list.html',
  styleUrl: './favorite-list.css',
})
export class FavoriteList implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly favoritesService = inject(FavoritesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly recipesPerPage = 12;

  protected readonly recipes = signal<PublicRecipeListItem[]>([]);
  protected readonly pagination = signal<PaginationMeta>(this.emptyPagination(1));
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly favoriteUpdatingIds = signal<ReadonlySet<number>>(new Set());

  ngOnInit(): void {
    this.watchPageQueryParam();
  }

  isFavoriteUpdating(recipeId: number): boolean {
    return this.favoriteUpdatingIds().has(recipeId);
  }

  onFavoriteToggle(recipe: PublicRecipeListItem): void {
    const user = this.sessionService.user();

    if (!user) {
      this.router.navigate(['/sign-in'], { queryParams: { redirectTo: '/me/favorites' } });
      return;
    }

    if (this.isFavoriteUpdating(recipe.id))
      return;

    const previousRecipes = this.recipes();

    this.setFavoriteUpdating(recipe.id, true);
    this.recipes.update((recipes) => recipes.filter((currentRecipe) => currentRecipe.id !== recipe.id));

    this.favoritesService.deleteFavorite(recipe.id).subscribe({
      next: () => {
        this.setFavoriteUpdating(recipe.id, false);
        this.loadCurrentPage();
      },
      error: () => {
        this.recipes.set(previousRecipes);
        this.errorMessage.set('Impossible de mettre à jour les favoris pour le moment.');
        this.setFavoriteUpdating(recipe.id, false);
      }
    });
  }

  onPageChange(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }

  private watchPageQueryParam(): void {
    this.route.queryParamMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((params) => this.readPageParam(params)),
        distinctUntilChanged(),
        switchMap((page) => this.loadFavorites(page))
      )
      .subscribe(({ items, pagination }) => {
        this.recipes.set(items.map((recipe) => ({ ...recipe, isFavorite: true })));
        this.pagination.set(pagination);
      });
  }

  private loadCurrentPage(): void {
    this.loadFavorites(this.pagination().page)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ items, pagination }) => {
        this.recipes.set(items.map((recipe) => ({ ...recipe, isFavorite: true })));
        this.pagination.set(pagination);
      });
  }

  private loadFavorites(page: number): Observable<PaginatedResponse<PublicRecipeListItem>> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    return this.favoritesService.getFavorites({ page, limit: this.recipesPerPage }).pipe(
      catchError(() => {
        this.errorMessage.set('Impossible de charger vos recettes favorites pour le moment.');
        return of({ items: [], pagination: this.emptyPagination(page) });
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  private readPageParam(params: ParamMap): number {
    const page = Number(params.get('page'));

    return Number.isInteger(page) && page > 0 ? page : 1;
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

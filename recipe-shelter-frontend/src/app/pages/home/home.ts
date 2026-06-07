import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { PublicRecipeListItem } from '../../core/models/recipe.model';
import { FavoritesService } from '../../core/services/favorites.service';
import { CategoryReferenceOption, RecipeReferenceDataService } from '../../core/services/recipe-reference-data.service';
import { RecipesService } from '../../core/services/recipes.service';
import { SessionService } from '../../core/services/session.service';
import { CategoryIcon } from '../../shared/category-icon/category-icon';
import { RecipeCard } from '../../shared/recipe-card/recipe-card';

@Component({
  selector: 'rs-home',
  standalone: true,
  imports: [RouterLink, CategoryIcon, RecipeCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly favoritesService = inject(FavoritesService);
  private readonly referenceDataService = inject(RecipeReferenceDataService);
  private readonly recipesService = inject(RecipesService);
  private readonly router = inject(Router);
  private readonly recipeFeedLimit = 12;

  protected readonly sessionService = inject(SessionService);
  protected readonly recentRecipes = signal<PublicRecipeListItem[]>([]);
  protected readonly recentRecipesLoading = signal(true);
  protected readonly recentRecipesError = signal('');
  protected readonly favoriteError = signal('');
  protected readonly favoriteUpdatingIds = signal<ReadonlySet<number>>(new Set());
  protected readonly categories = signal<CategoryReferenceOption[]>([]);
  protected readonly categoriesLoading = signal(true);
  protected readonly categoriesError = signal('');

  ngOnInit(): void {
    this.loadRecentRecipes();
    this.loadCategories();
  }

  isFavoriteUpdating(recipeId: number): boolean {
    return this.favoriteUpdatingIds().has(recipeId);
  }

  onFavoriteToggle(recipe: PublicRecipeListItem): void {
    const user = this.sessionService.user();

    if (!user) {
      this.router.navigate(['/sign-in'], { queryParams: { redirectTo: this.router.url || '/' } });
      return;
    }

    if (this.isFavoriteUpdating(recipe.id))
      return;

    const nextIsFavorite = !recipe.isFavorite;
    const request: Observable<unknown> = nextIsFavorite ? this.favoritesService.createFavorite(recipe.id) : this.favoritesService.deleteFavorite(recipe.id);

    this.favoriteError.set('');
    this.setFavoriteUpdating(recipe.id, true);
    this.updateRecipeFavorite(recipe.id, nextIsFavorite);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.setFavoriteUpdating(recipe.id, false);
      },
      error: () => {
        this.updateRecipeFavorite(recipe.id, recipe.isFavorite);
        this.favoriteError.set('Impossible de mettre à jour les favoris pour le moment.');
        this.setFavoriteUpdating(recipe.id, false);
      }
    });
  }

  private loadRecentRecipes(): void {
    this.recentRecipesLoading.set(true);
    this.recentRecipesError.set('');

    this.recipesService.getRecentPublished(this.recipeFeedLimit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (recipes) => {
          this.recentRecipes.set(recipes);
          this.recentRecipesLoading.set(false);
        },
        error: () => {
          this.recentRecipesError.set('Impossible de charger les dernières recettes pour le moment.');
          this.recentRecipesLoading.set(false);
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

  private updateRecipeFavorite(recipeId: number, isFavorite: boolean): void {
    this.recentRecipes.update((recipes) => recipes.map((recipe) => recipe.id === recipeId ? { ...recipe, isFavorite } : recipe));
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

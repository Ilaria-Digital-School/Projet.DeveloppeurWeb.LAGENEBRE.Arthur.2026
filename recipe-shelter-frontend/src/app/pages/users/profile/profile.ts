import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, map, Observable, of, switchMap, tap } from 'rxjs';

import { PublicRecipeListItem } from '../../../core/models/recipe.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { SessionService } from '../../../core/services/session.service';
import { PublicUserProfile, UserService } from '../../../core/services/user.service';
import { RecipeCard } from '../../../shared/recipe-card/recipe-card';
import { Title } from '@angular/platform-browser';
import { MetaService } from '../../../core/services/meta.service';

@Component({
  selector: 'rs-user-profile',
  imports: [RouterLink, RecipeCard],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly favoritesService = inject(FavoritesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(MetaService);
  private readonly userService = inject(UserService);

  protected readonly profile = signal<PublicUserProfile | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly favoriteError = signal('');
  protected readonly favoriteUpdatingIds = signal<ReadonlySet<number>>(new Set());

  ngOnInit(): void {
    this.watchUsernameParam();
  }

  protected getInitial(username: string): string {
    return username.trim().charAt(0).toUpperCase() || '?';
  }

  protected getRecipesCountLabel(count: number): string {
    return count > 1 ? `${count} recettes publiées` : `${count} recette publiée`;
  }

  protected isFavoriteUpdating(recipeId: number): boolean {
    return this.favoriteUpdatingIds().has(recipeId);
  }

  protected onFavoriteToggle(recipe: PublicRecipeListItem): void {
    const user = this.sessionService.user();

    if (!user) {
      this.router.navigate(['/sign-in'], { queryParams: { redirectTo: this.router.url || `/users/${this.profile()?.username ?? ''}` } });
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

  private watchUsernameParam(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef), map((params) => this.readUsernameParam(params)), distinctUntilChanged(), switchMap((username) => this.loadProfile(username)))
      .subscribe((profile) => {
        if (profile)
          this.profile.set(profile);
      });
  }

  private loadProfile(username: string): Observable<PublicUserProfile | null> {
    this.isLoading.set(true);
    this.notFound.set(false);
    this.errorMessage.set('');
    this.favoriteError.set('');
    this.favoriteUpdatingIds.set(new Set());
    this.profile.set(null);

    if (!username) {
      this.notFound.set(true);
      this.isLoading.set(false);

      return of(null);
    }

    return this.userService.getPublicProfile(username).pipe(
      tap((profile) => {
        this.titleService.setTitle(`${profile.username} | Recipe Shelter`);
        this.metaService.setDescription(`Découvrez le profil de ${profile.username} et ses recettes publiées sur Recipe Shelter.`);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404)
          this.notFound.set(true);
        else
          this.errorMessage.set('Impossible de charger ce profil pour le moment.');

        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  private readUsernameParam(params: ParamMap): string {
    return params.get('username')?.trim() ?? '';
  }

  private updateRecipeFavorite(recipeId: number, isFavorite: boolean): void {
    const profile = this.profile();

    if (!profile)
      return;

    this.profile.set({
      ...profile,
      publishedRecipes: profile.publishedRecipes.map((recipe) => recipe.id === recipeId ? { ...recipe, isFavorite } : recipe)
    });
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

import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, map, Observable, of, switchMap } from 'rxjs';

import { PaginatedResponse, PaginationMeta } from '../../../core/models/pagination.model';
import { RecipeStatus, RecipeSummary } from '../../../core/models/recipe.model';
import { RecipesService } from '../../../core/services/recipes.service';
import { getRecipeStatusLabel } from '../../../core/utils/recipe-status';
import { PaginationControls } from '../../../shared/components/pagination-controls/pagination-controls';

interface RecipeDateItem {
  label: string;
  value: string;
}

@Component({
  selector: 'rs-my-recipes',
  standalone: true,
  imports: [DatePipe, RouterLink, PaginationControls],
  templateUrl: './my-recipes.html',
  styleUrl: './my-recipes.css',
})
export class MyRecipes implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recipesService = inject(RecipesService);
  private readonly recipesPerPage = 10;

  protected readonly recipes = signal<RecipeSummary[]>([]);
  protected readonly pagination = signal<PaginationMeta>(this.emptyPagination(1));
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly createRecipeRoute = ['/me/recipes/submit'];

  ngOnInit(): void {
    this.watchPageQueryParam();
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
        switchMap((page) => this.loadRecipes(page))
      )
      .subscribe(({ items, pagination }) => {
        this.recipes.set(items);
        this.pagination.set(pagination);
      });
  }

  private loadRecipes(page: number): Observable<PaginatedResponse<RecipeSummary>> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    return this.recipesService.getMine({ page, limit: this.recipesPerPage }).pipe(
      catchError(() => {
        this.errorMessage.set('Une erreur est survenue lors du chargement des recettes.');
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

  getStatusLabel(status: RecipeStatus): string {
    return getRecipeStatusLabel(status);
  }

  getStatusClass(status: RecipeStatus): string {
    const classes: Record<RecipeStatus, string> = {
      draft: 'rs-status-badge--muted',
      pending: 'rs-status-badge--warning',
      rejected: 'rs-status-badge--danger',
      published: 'rs-status-badge--success',
      archived: 'rs-status-badge--muted'
    };

    return classes[status] ?? 'rs-status-badge--muted';
  }

  getDateItems(recipe: RecipeSummary): RecipeDateItem[] {
    const items: RecipeDateItem[] = [];

    if (recipe.createdAt)
      items.push({ label: 'Création', value: recipe.createdAt });

    if (recipe.submittedAt)
      items.push({ label: 'Soumission', value: recipe.submittedAt });

    if (recipe.publishedAt)
      items.push({ label: 'Publication', value: recipe.publishedAt });

    if (recipe.updatedAt)
      items.push({ label: 'Mise à jour', value: recipe.updatedAt });

    return items;
  }

  isRecipeEditable(status: RecipeStatus): boolean {
    return status === 'draft' || status === 'rejected';
  }

  getActionLabel(status: RecipeStatus): string {
    if (status === 'rejected')
      return 'Corriger';

    if (this.isRecipeEditable(status))
      return 'Modifier';

    return 'Voir';
  }
}


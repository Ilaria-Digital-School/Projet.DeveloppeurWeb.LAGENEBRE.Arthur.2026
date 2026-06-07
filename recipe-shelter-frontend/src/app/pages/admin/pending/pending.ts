import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AdminRecipesService } from '../../../core/services/admin-recipes.service';
import { RecipePending } from '../../../core/models/recipe.model';

@Component({
  selector: 'rs-pending',
  imports: [DatePipe, RouterLink],
  templateUrl: './pending.html',
  styleUrl: './pending.css',
})
export class Pending implements OnInit {
  private readonly adminRecipesService = inject(AdminRecipesService);
  private readonly router = inject(Router);

  protected readonly recipes = signal<RecipePending[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  ngOnInit(): void {
    this.successMessage.set(this.getNavigationSuccessMessage());
    this.loadPendingRecipes();
  }

  private loadPendingRecipes(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminRecipesService.getPending().subscribe({
      next: (recipes) => {
        this.recipes.set(recipes);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Une erreur est survenue lors du chargement des recettes.');
        this.isLoading.set(false);
      }
    });
  }

  private getNavigationSuccessMessage(): string {
    const state = this.router.currentNavigation()?.extras.state
      ?? (typeof history === 'undefined' ? null : history.state);
    const message = state?.['successMessage'];

    this.clearHistorySuccessMessage();

    return typeof message === 'string' ? message : '';
  }

  private clearHistorySuccessMessage(): void {
    if (typeof history === 'undefined' || !history.state || typeof history.state !== 'object')
      return;

    const state = { ...(history.state as Record<string, unknown>) };
    delete state['successMessage'];

    history.replaceState(state, '');
  }
}

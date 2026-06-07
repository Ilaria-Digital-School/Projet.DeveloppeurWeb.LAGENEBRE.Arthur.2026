import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AdminRecipe } from '../../../core/models/recipe.model';
import { AdminRecipesService } from '../../../core/services/admin-recipes.service';
import { getRecipeStatusLabel } from '../../../core/utils/recipe-status';

@Component({
  selector: 'rs-review',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class Review implements OnInit {
  private readonly adminRecipesService = inject(AdminRecipesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly recipe = signal<AdminRecipe | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly rejectionReason = signal('');

  protected readonly isPending = computed(() => this.recipe()?.status === 'pending');
  protected readonly canArchiving = computed(() => this.recipe()?.status === 'rejected' || this.recipe()?.status === 'published');
  protected readonly isAlreadyProcessed = computed(() => !!this.recipe() && !this.isPending());
  protected readonly trimmedRejectionReason = computed(() => this.rejectionReason().trim());
  protected readonly canConfirmRejection = computed(() => this.trimmedRejectionReason().length >= 10);
  protected readonly getStatusLabel = getRecipeStatusLabel;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    this.loadRecipe(id);
  }

  protected approve(): void {
    const recipe = this.recipe();
    if (!recipe || !this.isPending() || this.isSubmitting()) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    this.adminRecipesService.approve(recipe.id).subscribe({
      next: () => {
        this.refreshRecipe(recipe.id, 'Recette approuvée.');
      },
      error: () => {
        this.errorMessage.set("Impossible d'approuver la recette pour le moment.");
        this.isSubmitting.set(false);
      },
    });
  }

  protected reject(): void {
    const recipe = this.recipe();
    const reason = this.trimmedRejectionReason();

    if (!recipe || !this.isPending() || this.isSubmitting())
      return;

    if (reason.length < 10) {
      this.errorMessage.set('Le motif du refus doit contenir au moins 10 caractères.');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    this.adminRecipesService.reject(recipe.id, reason).subscribe({
      next: () => {
        this.refreshRecipe(recipe.id, 'Recette rejetée.');
      },
      error: () => {
        this.errorMessage.set('Impossible de refuser la recette pour le moment.');
        this.isSubmitting.set(false);
      },
    });
  }

  protected updateRejectionReason(reason: string): void {
    this.rejectionReason.set(reason);
  }

  protected archive(): void {
    const recipe = this.recipe();

    if (!recipe || !this.canArchiving() || this.isSubmitting())
      return;

    if (!this.confirmAction('Archiver cette recette ?'))
      return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    this.adminRecipesService.archive(recipe.id).subscribe({
      next: () => {
        this.refreshRecipe(recipe.id, 'Recette archivée.');
      },
      error: () => {
        this.errorMessage.set(`Impossible d'archiver la recette pour le moment.`);
        this.isSubmitting.set(false);
      },
    });
  }

  protected delete(): void {
    const recipe = this.recipe();

    if (!recipe || this.isSubmitting())
      return;

    if (!this.confirmAction('Supprimer définitivement cette recette ? Cette action est irréversible.'))
      return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    this.adminRecipesService.delete(recipe.id).subscribe({
      next: () => {
        this.router.navigate(['/admin/recipes'], { state: { successMessage: 'Recette supprimée.' } });
      },
      error: () => {
        this.errorMessage.set('Impossible de supprimer la recette pour le moment.');
        this.isSubmitting.set(false);
      },
    });
  }

  private confirmAction(message: string): boolean {
    return typeof globalThis.confirm === 'function' && globalThis.confirm(message);
  }

  private refreshRecipe(id: number, successMessage: string): void {
    this.rejectionReason.set('');
    this.successMessage.set(successMessage);
    this.loadRecipe(id);
  }

  private loadRecipe(id: number): void {
    this.isLoading.set(true);
    this.notFound.set(false);
    this.errorMessage.set('');

    this.adminRecipesService.getById(id).subscribe({
      next: (recipe) => {
        this.recipe.set({
          ...recipe,
          tags: recipe.tags ?? [],
          ingredients: recipe.ingredients ?? [],
          steps: recipe.steps ?? [],
          equipments: recipe.equipments ?? []
        });
        this.isLoading.set(false);
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.isSubmitting.set(false);

        if (error.status === 404) {
          this.notFound.set(true);
          return;
        }

        this.errorMessage.set('Une erreur est survenue lors du chargement de la recette.');
      }
    });
  }
}

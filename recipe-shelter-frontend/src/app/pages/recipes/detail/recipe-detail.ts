import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { PublicRecipeDetail, RecipeDetailComment, RecipeDetailIngredient } from '../../../core/models/recipe.model';
import { CommentsService } from '../../../core/services/comments.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { RecipesService } from '../../../core/services/recipes.service';
import { SessionService } from '../../../core/services/session.service';
import { Title } from '@angular/platform-browser';
import { MetaService } from '../../../core/services/meta.service';

@Component({
  selector: 'rs-detail',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.css',
})
export class RecipeDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly commentsService = inject(CommentsService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly recipesService = inject(RecipesService);
  private readonly sessionService = inject(SessionService);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(MetaService);

  protected readonly recipe = signal<PublicRecipeDetail | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly isFavoriteUpdating = signal(false);
  protected readonly replyCommentId = signal<number | null>(null);
  protected readonly editCommentId = signal<number | null>(null);
  protected readonly isCommentSubmitting = signal(false);
  protected readonly activeCommentAction = signal<string | null>(null);
  protected readonly commentSuccessMessage = signal('');
  protected readonly commentErrorMessage = signal('');
  protected readonly ratingOptions = [1, 2, 3, 4, 5];
  protected readonly sessionUser = this.sessionService.user;
  protected readonly isAdmin = this.sessionService.isAdmin;

  protected readonly rootCommentForm = this.fb.group({
    rating: new FormControl<number | null>(null),
    comment: this.fb.control('', [Validators.required, Validators.maxLength(1000)])
  });

  protected readonly replyForm = this.fb.group({
    comment: this.fb.control('', [Validators.required, Validators.maxLength(1000)])
  });

  protected readonly editCommentForm = this.fb.group({
    rating: new FormControl<number | null>(null),
    comment: this.fb.control('', [Validators.required, Validators.maxLength(1000)])
  });

  private currentSlug = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.errorMessage.set('Recette introuvable.');
      this.isLoading.set(false);
      return;
    }

    this.currentSlug = slug;
    this.loadRecipe(slug);
  }

  getTimeParts(recipe: PublicRecipeDetail): string[] {
    const parts: string[] = [];

    if (recipe.prepTimeMinutes)
      parts.push(`Préparation ${recipe.prepTimeMinutes} min`);

    if (recipe.cookTimeMinutes)
      parts.push(`Cuisson ${recipe.cookTimeMinutes} min`);

    if (recipe.restTimeMinutes)
      parts.push(`Repos ${recipe.restTimeMinutes} min`);

    return parts;
  }

  getIngredientLabel(ingredient: RecipeDetailIngredient): string {
    return [ingredient.quantity, ingredient.unit, ingredient.name].filter(Boolean).join(' ');
  }

  getCommentsCountLabel(count: number): string {
    return count > 1 ? `${count} commentaires` : `${count} commentaire`;
  }

  getRatingsCountLabel(count: number): string {
    return count > 1 ? `${count} notes` : `${count} note`;
  }

  getAverageRatingLabel(rating: number | null): string {
    return rating == null ? 'Pas encore de note' : `${rating.toFixed(1)} / 5`;
  }

  canReplyTo(comment: RecipeDetailComment): boolean {
    return !!this.sessionUser() && !comment.parentCommentId && !this.isCommentUnavailable(comment);
  }

  canDeleteOwn(comment: RecipeDetailComment): boolean {
    const user = this.sessionUser();

    return !!user && user.id === comment.author.id && !comment.isDeleted;
  }

  canEditOwn(comment: RecipeDetailComment): boolean {
    const user = this.sessionUser();

    return !!user && user.id === comment.author.id && !this.isCommentUnavailable(comment);
  }

  canModerate(comment: RecipeDetailComment): boolean {
    return this.isAdmin() && !this.isCommentUnavailable(comment);
  }

  isCommentUnavailable(comment: RecipeDetailComment): boolean {
    return comment.isDeleted || comment.isModerated;
  }

  setReplyTarget(commentId: number | null): void {
    this.replyCommentId.set(commentId);
    this.editCommentId.set(null);
    this.replyForm.reset();
    this.commentSuccessMessage.set('');
    this.commentErrorMessage.set('');
  }

  setEditTarget(comment: RecipeDetailComment | null): void {
    this.editCommentId.set(comment?.id ?? null);
    this.replyCommentId.set(null);
    this.commentSuccessMessage.set('');
    this.commentErrorMessage.set('');

    if (!comment) {
      this.editCommentForm.reset({ rating: null, comment: '' });
      return;
    }

    this.editCommentForm.reset({
      rating: comment.parentCommentId ? null : comment.rating,
      comment: comment.comment
    });
  }

  submitRootComment(recipe: PublicRecipeDetail): void {
    if (!this.sessionUser()) {
      this.router.navigate(['/sign-in'], { queryParams: { redirectTo: `/recipes/${recipe.slug}` } });
      return;
    }

    if (this.rootCommentForm.invalid || this.isCommentSubmitting()) {
      this.rootCommentForm.markAllAsTouched();
      return;
    }

    const { comment, rating } = this.rootCommentForm.getRawValue();

    this.createComment(recipe.id, { parentCommentId: null, rating: rating || null, comment: comment.trim() }, () => {
      this.rootCommentForm.reset({ rating: null, comment: '' });
      this.commentSuccessMessage.set('Votre commentaire a bien été publié.');
    });
  }

  submitReply(recipe: PublicRecipeDetail, parentComment: RecipeDetailComment): void {
    if (!this.canReplyTo(parentComment))
      return;

    if (this.replyForm.invalid || this.isCommentSubmitting()) {
      this.replyForm.markAllAsTouched();
      return;
    }

    const { comment } = this.replyForm.getRawValue();

    this.createComment(recipe.id, { parentCommentId: parentComment.id, rating: null, comment: comment.trim() }, () => {
      this.replyForm.reset();
      this.replyCommentId.set(null);
      this.commentSuccessMessage.set('Votre réponse a bien été publiée.');
    });
  }

  submitEdit(comment: RecipeDetailComment): void {
    if (!this.canEditOwn(comment))
      return;

    if (this.editCommentForm.invalid || this.isCommentSubmitting()) {
      this.editCommentForm.markAllAsTouched();
      return;
    }

    const { comment: content, rating } = this.editCommentForm.getRawValue();
    const trimmedContent = content.trim();

    this.commentSuccessMessage.set('');
    this.commentErrorMessage.set('');

    if (!trimmedContent) {
      this.commentErrorMessage.set('Le commentaire ne peut pas être vide.');
      return;
    }

    this.isCommentSubmitting.set(true);

    this.commentsService.update(comment.id, { rating: comment.parentCommentId ? null : rating || null, comment: trimmedContent }).subscribe({
      next: () => {
        this.editCommentForm.reset({ rating: null, comment: '' });
        this.editCommentId.set(null);
        this.commentSuccessMessage.set('Votre commentaire a bien été modifié.');
        this.refreshRecipe();
        this.isCommentSubmitting.set(false);
      },
      error: () => {
        this.commentErrorMessage.set('Impossible de modifier ce commentaire pour le moment.');
        this.isCommentSubmitting.set(false);
      }
    });
  }

  deleteOwnComment(comment: RecipeDetailComment): void {
    if (!this.canDeleteOwn(comment) || !this.confirmAction('Supprimer ce commentaire ?'))
      return;

    this.runCommentAction(`delete-${comment.id}`, this.commentsService.delete(comment.id), 'Votre commentaire a été supprimé.');
  }

  moderateComment(comment: RecipeDetailComment): void {
    if (!this.canModerate(comment) || !this.confirmAction('Modérer ce commentaire et le masquer publiquement ?'))
      return;

    this.runCommentAction(`moderate-${comment.id}`, this.commentsService.hide(comment.id), 'Le commentaire a été modéré.');
  }

  deleteCommentAsAdmin(comment: RecipeDetailComment): void {
    if (!this.isAdmin() || !this.confirmAction('Supprimer définitivement ce commentaire ?'))
      return;

    this.runCommentAction(`admin-delete-${comment.id}`, this.commentsService.deleteAsAdmin(comment.id), 'Le commentaire a été supprimé définitivement.');
  }

  onFavoriteClick(recipe: PublicRecipeDetail): void {
    const user = this.sessionService.user();

    if (!user) {
      this.router.navigate(['/sign-in'], { queryParams: { redirectTo: `/recipes/${recipe.slug}` } });
      return;
    }

    if (this.isFavoriteUpdating())
      return;

    const nextIsFavorite = !recipe.isFavorite;
    const request: Observable<unknown> = nextIsFavorite ? this.favoritesService.createFavorite(recipe.id) : this.favoritesService.deleteFavorite(recipe.id);

    this.isFavoriteUpdating.set(true);
    this.recipe.set({ ...recipe, isFavorite: nextIsFavorite });

    request.subscribe({
      next: () => {
        this.isFavoriteUpdating.set(false);
      },
      error: () => {
        this.recipe.set(recipe);
        this.errorMessage.set('Impossible de mettre à jour les favoris pour le moment.');
        this.isFavoriteUpdating.set(false);
      }
    });
  }

  private createComment(recipeId: number, payload: { parentCommentId: number | null; rating: number | null; comment: string }, onSuccess: () => void): void {
    this.commentSuccessMessage.set('');
    this.commentErrorMessage.set('');

    if (!payload.comment) {
      this.commentErrorMessage.set('Le commentaire ne peut pas être vide.');
      return;
    }

    this.isCommentSubmitting.set(true);

    this.commentsService.create(recipeId, payload).subscribe({
      next: () => {
        onSuccess();
        this.refreshRecipe();
        this.isCommentSubmitting.set(false);
      },
      error: () => {
        this.commentErrorMessage.set('Impossible de publier ce commentaire pour le moment.');
        this.isCommentSubmitting.set(false);
      }
    });
  }

  private runCommentAction(actionKey: string, request: Observable<unknown>, successMessage: string): void {
    this.commentSuccessMessage.set('');
    this.commentErrorMessage.set('');
    this.activeCommentAction.set(actionKey);

    request.subscribe({
      next: () => {
        this.commentSuccessMessage.set(successMessage);
        this.refreshRecipe();
        this.activeCommentAction.set(null);
      },
      error: () => {
        this.commentErrorMessage.set('Action impossible pour le moment.');
        this.activeCommentAction.set(null);
      }
    });
  }

  private refreshRecipe(): void {
    if (!this.currentSlug)
      return;

    this.loadRecipe(this.currentSlug, false);
  }

  private confirmAction(message: string): boolean {
    return typeof globalThis.confirm === 'function' && globalThis.confirm(message);
  }

  private loadRecipe(slug: string, showLoading = true): void {
    if (showLoading)
      this.isLoading.set(true);

    this.errorMessage.set('');

    this.recipesService.getPublishedBySlug(slug).subscribe({
      next: (recipe) => {
        this.recipe.set(recipe);
        this.titleService.setTitle(`${recipe.title} | Recipe Shelter`);
        this.metaService.setDescription(this.buildMetaDescription(recipe));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger cette recette pour le moment.');
        this.isLoading.set(false);
      }
    });
  }

  private buildMetaDescription(recipe: PublicRecipeDetail): string {
    const description = recipe.description?.trim();

    if (!description)
      return `Découvrez la recette ${recipe.title} sur Recipe Shelter.`;

    return description.length > 160 ? `${description.slice(0, 157)}...` : description;
  }
}

import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicRecipeListItem } from '../../core/models/recipe.model';

@Component({
  selector: 'rs-recipe-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.css',
})
export class RecipeCard {
  @Input({ required: true }) recipe!: PublicRecipeListItem;
  @Input() favoriteUpdating = false;
  @Input() eager = false;

  @Output() favoriteToggled = new EventEmitter<PublicRecipeListItem>();

  get timeLabel(): string {
    const totalMinutes = [this.recipe.prepTimeMinutes, this.recipe.cookTimeMinutes, this.recipe.restTimeMinutes].reduce<number>((total, minutes) => total + (minutes ?? 0), 0);

    if (totalMinutes <= 0)
      return '';

    if (totalMinutes < 60)
      return `${totalMinutes} min`;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }

  get ratingLabel(): string {
    const averageRating = this.recipe.averageRating;
    const ratingsCount = this.recipe.ratingsCount ?? 0;

    if (averageRating == null || ratingsCount <= 0)
      return '';

    return `${averageRating.toFixed(1)} / 5 (${this.getRatingsCountLabel(ratingsCount)})`;
  }

  onFavoriteClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteToggled.emit(this.recipe);
  }

  private getRatingsCountLabel(count: number): string {
    return count > 1 ? `${count} notes` : `${count} note`;
  }
}

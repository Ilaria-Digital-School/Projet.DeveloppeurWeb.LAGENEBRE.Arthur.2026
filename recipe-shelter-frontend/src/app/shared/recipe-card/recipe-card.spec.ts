import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PublicRecipeListItem } from '../../core/models/recipe.model';
import { RecipeCard } from './recipe-card';

describe('RecipeCard', () => {
  it('should display recipe metadata and emit favorite toggles', async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCard],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture: ComponentFixture<RecipeCard> = TestBed.createComponent(RecipeCard);
    const component = fixture.componentInstance;
    component.recipe = createRecipe();
    const emitSpy = vi.spyOn(component.favoriteToggled, 'emit');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tarte fine');
    expect(component.timeLabel).toBe('1 h 5 min');

    fixture.nativeElement.querySelector('.rs-favorite-badge').click();

    expect(emitSpy).toHaveBeenCalledWith(component.recipe);
  });

  function createRecipe(): PublicRecipeListItem {
    return {
      id: 7,
      title: 'Tarte fine',
      slug: 'tarte-fine',
      description: 'Une recette simple.',
      category: 'Dessert',
      coverImageUrl: null,
      prepTimeMinutes: 15,
      cookTimeMinutes: 40,
      restTimeMinutes: 10,
      servings: 4,
      authorUsername: 'alice',
      publishedAt: '2026-05-10T10:00:00.000Z',
      isFavorite: false,
      averageRating: 4.25,
      ratingsCount: 2
    };
  }
});

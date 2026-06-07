import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PublicRecipeDetail } from '../../../core/models/recipe.model';
import { CommentsService } from '../../../core/services/comments.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { MetaService } from '../../../core/services/meta.service';
import { RecipesService } from '../../../core/services/recipes.service';
import { SessionService } from '../../../core/services/session.service';
import { RecipeDetail } from './recipe-detail';

describe('RecipeDetail', () => {
  let component: RecipeDetail;
  let fixture: ComponentFixture<RecipeDetail>;
  const recipe: PublicRecipeDetail = {
    id: 1,
    title: 'Tarte fine',
    slug: 'tarte-fine',
    description: 'Une recette simple.',
    category: 'Dessert',
    coverImageUrl: null,
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    restTimeMinutes: null,
    servings: 4,
    author: { id: 1, username: 'alice' },
    publishedAt: '2026-01-12T10:00:00.000Z',
    isFavorite: true,
    ingredients: [
      {
        id: 1,
        name: 'Pomme',
        slug: 'pomme',
        quantity: 3,
        unit: null,
        note: null,
        sortOrder: 1
      }
    ],
    steps: [{ stepNumber: 1, description: 'Preparer les pommes.' }],
    equipments: [{ id: 1, name: 'Four', slug: 'four' }],
    tags: [{ id: 1, name: 'Facile', slug: 'facile' }],
    commentsCount: 2,
    averageRating: 4.5,
    ratingsCount: 1,
    comments: [
      {
        id: 10,
        isModerated: false,
        isDeleted: false,
        author: { id: 42, username: 'bob' },
        parentCommentId: null,
        moderatedAt: null,
        rating: 5,
        comment: 'Tres bonne recette.',
        createdAt: '2026-01-13T10:00:00.000Z',
        updatedAt: '2026-01-13T10:00:00.000Z',
        children: [
          {
            id: 11,
            isModerated: false,
            isDeleted: false,
            author: { id: 1, username: 'alice' },
            parentCommentId: 10,
            moderatedAt: null,
            rating: null,
            comment: 'Merci !',
            createdAt: '2026-01-13T11:00:00.000Z',
            updatedAt: '2026-01-13T11:00:00.000Z',
            children: []
          }
        ]
      }
    ]
  };
  const recipesServiceMock = {
    getPublishedBySlug: vi.fn().mockReturnValue(of(recipe))
  };
  const commentsServiceMock = {
    create: vi.fn().mockReturnValue(of({})),
    update: vi.fn().mockReturnValue(of({})),
    delete: vi.fn().mockReturnValue(of({ ok: true })),
    hide: vi.fn().mockReturnValue(of({})),
    deleteAsAdmin: vi.fn().mockReturnValue(of({ ok: true }))
  };
  const favoritesServiceMock = {
    createFavorite: vi.fn().mockReturnValue(of({})),
    deleteFavorite: vi.fn().mockReturnValue(of({}))
  };
  const metaServiceMock = {
    setDescription: vi.fn()
  };
  const sessionServiceMock = {
    user: vi.fn().mockReturnValue({ id: 42, username: 'bob' }),
    isAdmin: vi.fn().mockReturnValue(false)
  };
  const routerMock = {
    navigate: vi.fn()
  };

  beforeEach(async () => {
    recipesServiceMock.getPublishedBySlug.mockReturnValue(of(recipe));
    favoritesServiceMock.createFavorite.mockReturnValue(of({ userId: 42, recipeId: 1, createdAt: '2026-05-06T13:18:14.000Z' }));
    favoritesServiceMock.deleteFavorite.mockReturnValue(of(true));
    commentsServiceMock.create.mockReturnValue(of({}));
    commentsServiceMock.update.mockReturnValue(of({}));
    commentsServiceMock.delete.mockReturnValue(of({ ok: true }));
    commentsServiceMock.hide.mockReturnValue(of({}));
    commentsServiceMock.deleteAsAdmin.mockReturnValue(of({ ok: true }));
    metaServiceMock.setDescription.mockClear();
    sessionServiceMock.user.mockReturnValue({ id: 42, username: 'bob' });
    sessionServiceMock.isAdmin.mockReturnValue(false);
    routerMock.navigate.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [RecipeDetail],
      providers: [
        { provide: RecipesService, useValue: recipesServiceMock },
        { provide: CommentsService, useValue: commentsServiceMock },
        { provide: FavoritesService, useValue: favoritesServiceMock },
        { provide: MetaService, useValue: metaServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: vi.fn().mockReturnValue('tarte-fine')
              }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the public recipe detail', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Tarte fine');
    expect(text).toContain('Pomme');
    expect(text).toContain('Preparer les pommes.');
    expect(text).toContain('Four');
    expect(text).toContain('Facile');
    expect(text).toContain('2 commentaires');
    expect(text).toContain('4.5 / 5');
    expect(text).toContain('Tres bonne recette.');
    expect(text).toContain('Merci !');
  });

  it('should update the meta description from the recipe description', () => {
    expect(metaServiceMock.setDescription).toHaveBeenCalledWith('Une recette simple.');
  });

  it('should use a fallback meta description when the recipe has no description', () => {
    recipesServiceMock.getPublishedBySlug.mockReturnValue(of({ ...recipe, description: null }));
    metaServiceMock.setDescription.mockClear();

    fixture = TestBed.createComponent(RecipeDetail);
    fixture.detectChanges();

    expect(metaServiceMock.setDescription).toHaveBeenCalledWith(
      'Découvrez la recette Tarte fine sur Recipe Shelter.'
    );
  });

  it('should truncate long recipe meta descriptions', () => {
    const longDescription = 'a'.repeat(180);
    const expectedDescription = `${'a'.repeat(157)}...`;
    recipesServiceMock.getPublishedBySlug.mockReturnValue(of({
      ...recipe,
      description: longDescription
    }));
    metaServiceMock.setDescription.mockClear();

    fixture = TestBed.createComponent(RecipeDetail);
    fixture.detectChanges();

    expect(metaServiceMock.setDescription).toHaveBeenCalledWith(expectedDescription);
  });

  it('should keep the detail sections in the mobile logical order', () => {
    const detail = fixture.nativeElement as HTMLElement;
    const headings = Array.from(
      detail.querySelectorAll<HTMLElement>('.rs-recipe-layout .rs-detail-section h2')
    ).map((heading) => heading.textContent?.trim());

    expect(headings).toEqual(['Ingrédients', 'Ustensiles', 'Étapes']);
  });

  it('should render detail collections when backend identifiers are blank', () => {
    const recipeWithBlankIds = {
      ...recipe,
      ingredients: [
        { ...recipe.ingredients[0], id: '' },
        { ...recipe.ingredients[0], id: '', name: 'Poire' }
      ],
      equipments: [
        { id: '', name: 'Four', slug: 'four' },
        { id: '', name: 'Moule', slug: 'moule' }
      ],
      tags: [
        { id: '', name: 'Facile', slug: 'facile' },
        { id: '', name: 'Rapide', slug: 'rapide' }
      ]
    } as unknown as PublicRecipeDetail;

    recipesServiceMock.getPublishedBySlug.mockReturnValue(of(recipeWithBlankIds));
    fixture = TestBed.createComponent(RecipeDetail);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Poire');
    expect(text).toContain('Moule');
    expect(text).toContain('Rapide');
  });

  it('should remove the recipe from favorites on favorite click', () => {
    const favoriteButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-favorite-button');

    favoriteButton?.click();

    expect(favoritesServiceMock.deleteFavorite).toHaveBeenCalledWith(1);
    expect((component as unknown as { recipe: () => PublicRecipeDetail | null }).recipe()?.isFavorite).toBe(false);
  });

  it('should redirect unauthenticated users to sign in on favorite click', () => {
    sessionServiceMock.user.mockReturnValue(null);
    const favoriteButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-favorite-button');

    favoriteButton?.click();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sign-in'], { queryParams: { redirectTo: '/recipes/tarte-fine' } });
  });

  it('should create a root comment with an optional rating', () => {
    const form = (component as unknown as { rootCommentForm: { setValue: (value: { rating: number; comment: string }) => void } }).rootCommentForm;

    form.setValue({ rating: 4, comment: 'Excellent.' });
    (component as unknown as { submitRootComment: (recipe: PublicRecipeDetail) => void }).submitRootComment(recipe);

    expect(commentsServiceMock.create).toHaveBeenCalledWith(1, {
      parentCommentId: null,
      rating: 4,
      comment: 'Excellent.'
    });
  });

  it('should delete the current user comment after confirmation', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    (component as unknown as { deleteOwnComment: (comment: PublicRecipeDetail['comments'][number]) => void }).deleteOwnComment(recipe.comments[0]);

    expect(commentsServiceMock.delete).toHaveBeenCalledWith(10);
    confirmSpy.mockRestore();
  });

  it('should update the current user comment with its rating', () => {
    const editableComponent = component as unknown as {
      setEditTarget: (comment: PublicRecipeDetail['comments'][number]) => void;
      editCommentForm: { setValue: (value: { rating: number; comment: string }) => void };
      submitEdit: (comment: PublicRecipeDetail['comments'][number]) => void;
    };

    editableComponent.setEditTarget(recipe.comments[0]);
    editableComponent.editCommentForm.setValue({ rating: 3, comment: 'Encore meilleur tiede.' });
    editableComponent.submitEdit(recipe.comments[0]);

    expect(commentsServiceMock.update).toHaveBeenCalledWith(10, {
      rating: 3,
      comment: 'Encore meilleur tiede.'
    });
  });
});

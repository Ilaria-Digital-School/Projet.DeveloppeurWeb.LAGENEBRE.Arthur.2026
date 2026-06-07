import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { PublicRecipeListItem } from '../../../core/models/recipe.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { MetaService } from '../../../core/services/meta.service';
import { SessionService } from '../../../core/services/session.service';
import { PublicUserProfile, UserService } from '../../../core/services/user.service';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  const paramMap$ = new BehaviorSubject(convertToParamMap({ username: 'alice' }));
  const recipe: PublicRecipeListItem = {
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
    authorUsername: 'alice',
    publishedAt: '2026-01-12T10:00:00.000Z',
    isFavorite: false
  };
  const profile: PublicUserProfile = {
    id: 7,
    username: 'alice',
    publishedRecipes: [recipe]
  };
  const userServiceMock = {
    getPublicProfile: vi.fn().mockReturnValue(of(profile))
  };
  const favoritesServiceMock = {
    createFavorite: vi.fn().mockReturnValue(of({})),
    deleteFavorite: vi.fn().mockReturnValue(of({}))
  };
  const metaServiceMock = {
    setDescription: vi.fn()
  };
  const sessionServiceMock = {
    user: vi.fn().mockReturnValue({ id: 42, username: 'bob' })
  };
  const routerMock = {
    url: '/users/alice',
    navigate: vi.fn()
  };
  const activatedRouteMock = {
    paramMap: paramMap$.asObservable()
  };

  beforeEach(async () => {
    paramMap$.next(convertToParamMap({ username: 'alice' }));
    userServiceMock.getPublicProfile.mockReturnValue(of(profile));
    favoritesServiceMock.createFavorite.mockReturnValue(of({ userId: 42, recipeId: 1, createdAt: '2026-05-06T13:18:14.000Z' }));
    favoritesServiceMock.deleteFavorite.mockReturnValue(of({ ok: true }));
    metaServiceMock.setDescription.mockClear();
    sessionServiceMock.user.mockReturnValue({ id: 42, username: 'bob' });
    routerMock.url = '/users/alice';
    routerMock.navigate.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: FavoritesService, useValue: favoritesServiceMock },
        { provide: MetaService, useValue: metaServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and display the public user profile', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(userServiceMock.getPublicProfile).toHaveBeenCalledWith('alice');
    expect(text).toContain('alice');
    expect(text).toContain('1 recette publiée');
    expect(text).toContain('Tarte fine');
  });

  it('should update the profile meta description', () => {
    expect(metaServiceMock.setDescription).toHaveBeenCalledWith(
      'Découvrez le profil de alice et ses recettes publiées sur Recipe Shelter.'
    );
  });

  it('should display an empty state when the user has no published recipe', async () => {
    userServiceMock.getPublicProfile.mockReturnValue(of({ ...profile, publishedRecipes: [] }));
    paramMap$.next(convertToParamMap({ username: 'empty' }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aucune recette publiée');
  });

  it('should add a public recipe to favorites from the profile', () => {
    const favoriteButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-favorite-badge');

    favoriteButton?.click();
    fixture.detectChanges();

    expect(favoritesServiceMock.createFavorite).toHaveBeenCalledWith(1);
  });

  it('should redirect unauthenticated users to sign in from the profile', () => {
    sessionServiceMock.user.mockReturnValue(null);
    const favoriteButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.rs-favorite-badge');

    favoriteButton?.click();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/sign-in'], { queryParams: { redirectTo: '/users/alice' } });
  });

  it('should display a not found state for missing users', async () => {
    userServiceMock.getPublicProfile.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    paramMap$.next(convertToParamMap({ username: 'missing' }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Profil introuvable');
  });
});

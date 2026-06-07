import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { RecipeSummary } from '../../../core/models/recipe.model';
import { RecipesService } from '../../../core/services/recipes.service';
import { MyRecipes } from './my-recipes';

describe('MyRecipes', () => {
  let component: MyRecipes;
  let fixture: ComponentFixture<MyRecipes>;
  let recipesService: Pick<RecipesService, 'getMine'>;
  const queryParamMap$ = new BehaviorSubject(convertToParamMap({}));
  const paginatedRecipes = (items: RecipeSummary[] = [], page = 1) => ({
    items,
    pagination: {
      page,
      limit: 12,
      totalItems: items.length,
      totalPages: items.length > 0 ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: page > 1
    }
  });

  beforeEach(async () => {
    queryParamMap$.next(convertToParamMap({}));
    recipesService = {
      getMine: vi.fn().mockReturnValue(of(paginatedRecipes()))
    };

    await TestBed.configureTestingModule({
      imports: [MyRecipes],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParamMap$.asObservable() } },
        { provide: RecipesService, useValue: recipesService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyRecipes);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load recipes from the current page query param', async () => {
    const recipe: RecipeSummary = {
      id: 7,
      title: 'Tarte fine',
      status: 'rejected',
      category: 'Dessert',
      createdAt: '2026-05-10T10:00:00.000Z',
      rejectionReason: 'Description trop courte.'
    };
    fixture.destroy();
    (recipesService.getMine as ReturnType<typeof vi.fn>).mockReturnValue(of(paginatedRecipes([recipe], 2)));
    queryParamMap$.next(convertToParamMap({ page: '2' }));

    fixture = TestBed.createComponent(MyRecipes);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(recipesService.getMine).toHaveBeenLastCalledWith({ page: 2, limit: 10 });
    expect(fixture.nativeElement.textContent).toContain('Tarte fine');
    expect(fixture.nativeElement.textContent).toContain('Corriger');
    expect(fixture.nativeElement.textContent).toContain('Description trop courte.');
  });

});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { AdminRecipesService } from '../../../core/services/admin-recipes.service';
import { Review } from './review';

describe('Review', () => {
  let component: Review;
  let fixture: ComponentFixture<Review>;
  let adminRecipesService: Pick<AdminRecipesService, 'getById' | 'approve' | 'reject' | 'archive' | 'delete'>;
  let router: Pick<Router, 'navigate'>;

  interface ReviewHarness {
    recipe: { set: (recipe: unknown) => void };
    approve: () => void;
    reject: () => void;
    archive: () => void;
    delete: () => void;
    updateRejectionReason: (reason: string) => void;
  }

  function setRecipe(status: string): void {
    (component as unknown as ReviewHarness).recipe.set({
      id: 1,
      user: 'chef',
      category: null,
      title: 'Tarte aux pommes',
      slug: 'tarte-aux-pommes',
      description: 'Une recette simple.',
      prepTimeMinutes: 20,
      restTimeMinutes: null,
      cookTimeMinutes: 35,
      servings: 6,
      status,
      createdAt: '2026-04-01T10:00:00.000Z',
      submittedAt: '2026-04-02T10:00:00.000Z',
      moderatedAt: null,
      moderatedByUserId: null,
      publishedAt: null,
      archivedAt: null,
      rejectionReason: null,
      updatedAt: '2026-04-02T10:00:00.000Z',
      tags: [{ id: 3, name: 'Rapide' }],
      ingredients: [],
      steps: [],
      equipments: []
    });
  }

  beforeEach(async () => {
    adminRecipesService = {
      getById: vi.fn().mockReturnValue(of({
        id: 1,
        userId: 2,
        categoryId: null,
        title: 'Tarte aux pommes',
        slug: 'tarte-aux-pommes',
        description: 'Une recette simple.',
        prepTimeMinutes: 20,
        restTimeMinutes: null,
        cookTimeMinutes: 35,
        servings: 6,
        status: 'pending',
        createdAt: '2026-04-01T10:00:00.000Z',
        submittedAt: '2026-04-02T10:00:00.000Z',
        moderatedAt: null,
        moderatedByUserId: null,
        publishedAt: null,
        archivedAt: null,
        rejectionReason: null,
        updatedAt: '2026-04-02T10:00:00.000Z',
        tags: [{ id: 3, name: 'Rapide' }],
        ingredients: [],
        steps: [],
        equipments: [],
      })),
      approve: vi.fn().mockReturnValue(of(void 0)),
      reject: vi.fn().mockReturnValue(of(void 0)),
      archive: vi.fn().mockReturnValue(of(void 0)),
      delete: vi.fn().mockReturnValue(of(void 0)),
    };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Review],
      providers: [
        { provide: AdminRecipesService, useValue: adminRecipesService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
        { provide: Router, useValue: router },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Review);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render recipe tags', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Rapide');
  });

  it('should show a success message after approval', () => {
    (component as unknown as ReviewHarness).approve();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Recette approuvée.');
  });

  it('should show a success message after rejection', () => {
    const harness = component as unknown as ReviewHarness;

    harness.updateRejectionReason('Motif de refus suffisamment long.');
    harness.reject();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Recette rejetée.');
  });

  it('should archive after confirmation', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    setRecipe('published');
    (component as unknown as ReviewHarness).archive();

    expect(confirmSpy).toHaveBeenCalledWith('Archiver cette recette ?');
    expect(adminRecipesService.archive).toHaveBeenCalledWith(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Recette archivée.');

    confirmSpy.mockRestore();
  });

  it('should not archive when confirmation is cancelled', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    setRecipe('published');
    (component as unknown as ReviewHarness).archive();

    expect(adminRecipesService.archive).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('should delete after confirmation', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    setRecipe('published');
    (component as unknown as ReviewHarness).delete();

    expect(confirmSpy).toHaveBeenCalledWith('Supprimer définitivement cette recette ? Cette action est irréversible.');
    expect(adminRecipesService.delete).toHaveBeenCalledWith(1);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/recipes'], {
      state: { successMessage: 'Recette supprimée.' },
    });

    confirmSpy.mockRestore();
  });

  it('should not delete when confirmation is cancelled', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    setRecipe('published');
    (component as unknown as ReviewHarness).delete();

    expect(adminRecipesService.delete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { RecipeReferenceDataService } from '../../../core/services/recipe-reference-data.service';
import { RecipesService } from '../../../core/services/recipes.service';
import { SessionService } from '../../../core/services/session.service';
import { RecipeForm } from './recipe-form';

describe('RecipeForm', () => {
  let component: RecipeForm;
  let fixture: ComponentFixture<RecipeForm>;
  let recipesService: Pick<RecipesService, 'getById' | 'create' | 'update' | 'publish' | 'archive'>;
  let referenceDataService: Pick<RecipeReferenceDataService, 'getCategories' | 'getIngredients' | 'getEquipments' | 'getTags'>;

  const sessionServiceStub = {
    user: () => ({ id: 42, username: 'chef' })
  };

  beforeEach(async () => {
    recipesService = {
      getById: vi.fn().mockReturnValue(of()),
      create: vi.fn().mockReturnValue(
        of({
          id: 1,
          userId: 42,
          slug: '',
          title: 'Gâteau simple',
          categoryId: null,
          description: 'Description assez longue pour être valide',
          prepTimeMinutes: null,
          restTimeMinutes: null,
          cookTimeMinutes: null,
          servings: null,
          tagIds: [],
          ingredients: [],
          steps: [],
          equipments: []
        })
      ),
      update: vi.fn().mockReturnValue(
        of({
          id: 1,
          userId: 42,
          slug: '',
          title: 'Gâteau simple',
          categoryId: null,
          description: 'Description assez longue pour être valide',
          prepTimeMinutes: null,
          restTimeMinutes: null,
          cookTimeMinutes: null,
          servings: null,
          tagIds: [],
          ingredients: [],
          steps: [],
          equipments: []
        })
      ),
      publish: vi.fn().mockReturnValue(
        of({
          id: 1,
          userId: 42,
          slug: '',
          title: 'Gâteau simple',
          categoryId: null,
          description: 'Description assez longue pour être valide',
          prepTimeMinutes: null,
          restTimeMinutes: null,
          cookTimeMinutes: null,
          servings: null,
          tagIds: [],
          ingredients: [],
          steps: [],
          equipments: []
        })
      ),
      archive: vi.fn().mockReturnValue(of(true))
    };
    referenceDataService = {
      getCategories: vi.fn().mockReturnValue(of([{ id: 2, name: 'Desserts' }])),
      getIngredients: vi.fn().mockReturnValue(of([{ id: 7, name: 'Farine' }, { id: 8, name: 'Oeufs' }, { id: 10, name: 'Sucre' }, { id: 20, name: 'Lait' }])),
      getEquipments: vi.fn().mockReturnValue(of([{ id: 2, name: 'Fouet' }, { id: 4, name: 'Saladier' }, { id: 5, name: 'Poêle' }])),
      getTags: vi.fn().mockReturnValue(of([{ id: 3, name: 'Rapide' }, { id: 6, name: 'Végétarien' }]))
    };

    await TestBed.configureTestingModule({
      imports: [RecipeForm],
      providers: [
        { provide: RecipesService, useValue: recipesService },
        { provide: RecipeReferenceDataService, useValue: referenceDataService },
        { provide: SessionService, useValue: sessionServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn()
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate equipment ids when the API returns nested equipment objects', () => {
    (component as never as { fillForm: (recipe: unknown) => void }).fillForm({
      id: 12,
      userId: 42,
      slug: 'gateau-simple',
      title: 'Gâteau simple',
      categoryId: null,
      description: 'Description assez longue pour être valide',
      prepTimeMinutes: null,
      restTimeMinutes: null,
      cookTimeMinutes: null,
      servings: null,
      tagIds: [],
      ingredients: [],
      steps: [],
      equipments: [{ equipment: { id: 9 } }]
    });

    expect(component.equipmentsFormArray.at(0).controls.equipmentId.value).toBe(9);
  });

  it('should populate equipment ids when the API returns equipment ids', () => {
    (component as never as { fillForm: (recipe: unknown) => void }).fillForm({
      id: 12,
      userId: 42,
      slug: 'gateau-simple',
      title: 'Gâteau simple',
      categoryId: null,
      description: 'Description assez longue pour être valide',
      prepTimeMinutes: null,
      restTimeMinutes: null,
      cookTimeMinutes: null,
      servings: null,
      tagIds: [],
      ingredients: [],
      steps: [],
      equipments: [{ equipmentId: 2 }, { equipmentId: 4 }, { equipmentId: 5 }]
    });

    expect(component.equipmentsFormArray.at(0).controls.equipmentId.value).toBe(2);
    expect(component.equipmentsFormArray.at(1).controls.equipmentId.value).toBe(4);
    expect(component.equipmentsFormArray.at(2).controls.equipmentId.value).toBe(5);
  });

  it('should populate equipment ids when the API returns pascal case equipment ids', () => {
    (component as never as { fillForm: (recipe: unknown) => void }).fillForm({
      id: 12,
      userId: 42,
      slug: 'gateau-simple',
      title: 'Gâteau simple',
      categoryId: null,
      description: 'Description assez longue pour être valide',
      prepTimeMinutes: null,
      restTimeMinutes: null,
      cookTimeMinutes: null,
      servings: null,
      tagIds: [],
      ingredients: [],
      steps: [],
      equipments: [{ EquipmentId: '2' }, { EquipmentId: '4' }, { EquipmentId: '5' }]
    });

    expect(component.equipmentsFormArray.at(0).controls.equipmentId.value).toBe(2);
    expect(component.equipmentsFormArray.at(1).controls.equipmentId.value).toBe(4);
    expect(component.equipmentsFormArray.at(2).controls.equipmentId.value).toBe(5);
  });

  it('should populate equipment ids when the API returns nested equipment objects', () => {
    (component as never as { fillForm: (recipe: unknown) => void }).fillForm({
      id: 12,
      userId: 42,
      slug: 'gateau-simple',
      title: 'Gâteau simple',
      categoryId: null,
      description: 'Description assez longue pour être valide',
      prepTimeMinutes: null,
      restTimeMinutes: null,
      cookTimeMinutes: null,
      servings: null,
      tagIds: [],
      ingredients: [],
      steps: [],
      equipments: [{ equipment: { id: 2 } }, { equipment: { id: 4 } }, { equipment: { id: 5 } }]
    });

    expect(component.equipmentsFormArray.at(0).controls.equipmentId.value).toBe(2);
    expect(component.equipmentsFormArray.at(1).controls.equipmentId.value).toBe(4);
    expect(component.equipmentsFormArray.at(2).controls.equipmentId.value).toBe(5);
  });

  it('should populate equipment ids when the API returns equipmentID keys', () => {
    (component as never as { fillForm: (recipe: unknown) => void }).fillForm({
      id: 12,
      userId: 42,
      slug: 'gateau-simple',
      title: 'Gâteau simple',
      categoryId: null,
      description: 'Description assez longue pour être valide',
      prepTimeMinutes: null,
      restTimeMinutes: null,
      cookTimeMinutes: null,
      servings: null,
      tagIds: [],
      ingredients: [],
      steps: [],
      equipments: [{ equipmentID: 2 }, { equipmentID: 4 }, { equipmentID: 5 }]
    });

    expect(component.equipmentsFormArray.at(0).controls.equipmentId.value).toBe(2);
    expect(component.equipmentsFormArray.at(1).controls.equipmentId.value).toBe(4);
    expect(component.equipmentsFormArray.at(2).controls.equipmentId.value).toBe(5);
  });

  it('should render equipment names in the DOM while keeping ids in the form when loading a recipe', () => {
    (component as never as { fillForm: (recipe: unknown) => void }).fillForm({
      id: 3,
      userId: 2,
      slug: 'draft_2_1776943787111_xh40b4',
      title: 'pate a crepes',
      categoryId: null,
      description: '',
      prepTimeMinutes: 0,
      restTimeMinutes: null,
      cookTimeMinutes: null,
      servings: 1,
      tagIds: [],
      ingredients: [],
      steps: [],
      equipments: [{ equipmentId: 2 }, { equipmentId: 4 }, { equipmentId: 5 }]
    });

    fixture.detectChanges();

    const equipmentSelects = Array.from(
      fixture.nativeElement.querySelectorAll('select[formcontrolname="equipmentId"]')
    ) as HTMLSelectElement[];

    expect(component.equipmentsFormArray.controls.map((control) => control.controls.equipmentId.value)).toEqual([2, 4, 5]);
    expect(equipmentSelects.map((select) => select.options[select.selectedIndex].textContent?.trim())).toEqual(['Fouet', 'Saladier', 'Poêle']);
  });

  it('should preserve ingredient and step order when loading a recipe', () => {
    (component as never as { fillForm: (recipe: unknown) => void }).fillForm({
      id: 3,
      userId: 2,
      slug: 'ordered-recipe',
      title: 'Recette ordonnée',
      categoryId: null,
      description: '',
      prepTimeMinutes: 0,
      restTimeMinutes: null,
      cookTimeMinutes: null,
      servings: 1,
      tagIds: [],
      ingredients: [
        { ingredientId: 20, quantity: 2, unit: 'g', note: null, sortOrder: 2 },
        { ingredientId: 10, quantity: 1, unit: 'kg', note: null, sortOrder: 1 }
      ],
      steps: [
        { stepNumber: 2, description: 'Deuxième étape' },
        { stepNumber: 1, description: 'Première étape' }
      ],
      equipments: []
    });

    expect(component.ingredients.at(0).controls.ingredientId.value).toBe(10);
    expect(component.ingredients.at(1).controls.ingredientId.value).toBe(20);
    expect(component.steps.at(0).controls.description.value).toBe('Première étape');
    expect(component.steps.at(1).controls.description.value).toBe('Deuxième étape');
  });

  it('should filter empty dynamic rows and recalculate order on draft save', () => {
    component.form.patchValue({
      title: 'Gâteau simple',
      categoryId: 2,
      description: 'Description assez longue pour être valide',
      prepTimeMinutes: 20,
      servings: 4
    });

    component.ingredients.at(0).patchValue({
      ingredientId: 7,
      quantity: 250,
      unit: 'g',
      note: ''
    });
    component.addIngredient();
    component.addIngredient();
    component.ingredients.at(2).patchValue({
      ingredientId: 8,
      quantity: 2,
      unit: '',
      note: 'grosses'
    });

    component.steps.at(0).patchValue({
      description: 'Mélanger.'
    });
    component.addStep();
    component.addStep();
    component.steps.at(2).patchValue({
      description: 'Cuire.'
    });

    component.addEquipment();
    component.equipmentsFormArray.at(1).patchValue({
      equipmentId: 4
    });

    component.onSaveDraft();

    expect(recipesService.create).toHaveBeenCalledWith(expect.objectContaining({
      ingredients: [
        { ingredientId: 7, quantity: 250, unit: 'g', note: null, sortOrder: 1 },
        { ingredientId: 8, quantity: 2, unit: '', note: 'grosses', sortOrder: 2 }
      ],
      steps: [
        { description: 'Mélanger.', stepNumber: 1 },
        { description: 'Cuire.', stepNumber: 2 }
      ],
      equipments: [
        { equipmentId: 4 }
      ]
    }));
  });

  it('should save then publish when requesting publication', () => {
    component.form.patchValue({
      title: 'Gâteau simple',
      categoryId: 2,
      description: 'Description assez longue pour être valide',
      prepTimeMinutes: 20,
      servings: 4
    });

    component.ingredients.at(0).patchValue({
      ingredientId: 7,
      quantity: 250,
      unit: '',
      note: ''
    });

    component.steps.at(0).patchValue({
      description: 'Mélanger tous les ingrédients.'
    });

    component.onSaveDraft();
    component.onRequestPublication();

    expect(recipesService.create).toHaveBeenCalled();
    expect(recipesService.update).toHaveBeenCalled();
    expect(recipesService.publish).toHaveBeenCalledWith(1);
  });

  it('should allow draft save with only a valid title', () => {
    component.form.patchValue({
      title: 'Soupe simple'
    });

    component.onSaveDraft();

    expect(recipesService.create).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Soupe simple',
      categoryId: null,
      description: '',
      prepTimeMinutes: null,
      servings: null,
      ingredients: [],
      steps: []
    }));
  });

  it('should save selected tag ids and cover image url in the draft payload', () => {
    component.form.patchValue({
      title: 'Soupe simple',
      coverImageUrl: ' https://example.test/soupe.jpg '
    });

    component.form.controls.tagIds.setValue([3, 3, 6]);
    component.onSaveDraft();

    expect(recipesService.create).toHaveBeenCalledWith(expect.objectContaining({
      coverImageUrl: 'https://example.test/soupe.jpg',
      tagIds: [3, 6]
    }));
  });

  it('should prefill tag ids and cover image url when loading a recipe', () => {
    (component as never as { fillForm: (recipe: unknown) => void }).fillForm({
      id: 12,
      userId: 42,
      slug: 'soupe-simple',
      title: 'Soupe simple',
      categoryId: null,
      description: '',
      coverImageUrl: 'https://example.test/soupe.jpg',
      prepTimeMinutes: null,
      restTimeMinutes: null,
      cookTimeMinutes: null,
      servings: null,
      tagIds: [3, 6],
      ingredients: [],
      steps: [],
      equipments: []
    });

    expect(component.form.controls.coverImageUrl.value).toBe('https://example.test/soupe.jpg');
    expect(component.form.controls.tagIds.value).toEqual([3, 6]);
  });

  it('should require the publication checklist before submitting', () => {
    component.form.patchValue({
      title: 'Soupe simple',
      description: 'Trop court'
    });

    component.onRequestPublication();

    expect(recipesService.create).not.toHaveBeenCalled();
    expect(recipesService.publish).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe('Complétez les éléments de la checklist avant de soumettre la recette.');
  });

  it('should block duplicate equipments before saving', () => {
    component.form.patchValue({
      title: 'Gâteau simple'
    });

    component.equipmentsFormArray.at(0).patchValue({ equipmentId: 4 });
    component.addEquipment();
    component.equipmentsFormArray.at(1).patchValue({ equipmentId: 4 });

    component.onSaveDraft();

    expect(recipesService.create).not.toHaveBeenCalled();
    expect(component.errorMessage()).toBe(component.duplicateEquipmentMessage);
  });

  it('should archive an eligible recipe after confirmation', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);

    component.recipeId = 12;
    component.recipe.set({
      id: 12,
      userId: 42,
      slug: 'soupe-simple',
      title: 'Soupe simple',
      categoryId: null,
      description: '',
      prepTimeMinutes: 0,
      restTimeMinutes: null,
      cookTimeMinutes: null,
      servings: 1,
      status: 'published',
      tagIds: [],
      ingredients: [],
      steps: [],
      equipments: []
    });

    component.onRequestArchiving();

    expect(confirmSpy).toHaveBeenCalledWith('Archiver cette recette ?');
    expect(recipesService.archive).toHaveBeenCalledWith(12);

    confirmSpy.mockRestore();
  });

  it('should not archive an eligible recipe when confirmation is cancelled', () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    component.recipeId = 12;
    component.recipe.set({
      id: 12,
      userId: 42,
      slug: 'soupe-simple',
      title: 'Soupe simple',
      categoryId: null,
      description: '',
      prepTimeMinutes: 0,
      restTimeMinutes: null,
      cookTimeMinutes: null,
      servings: 1,
      status: 'published',
      tagIds: [],
      ingredients: [],
      steps: [],
      equipments: []
    });

    component.onRequestArchiving();

    expect(recipesService.archive).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);

    confirmSpy.mockRestore();
  });
});


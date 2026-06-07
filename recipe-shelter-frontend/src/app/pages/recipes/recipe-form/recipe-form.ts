import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, Observable, of, switchMap, throwError } from 'rxjs';

import { RecipeStatus } from '../../../core/models/recipe.model';
import { RecipeReferenceDataService, RecipeReferenceOption } from '../../../core/services/recipe-reference-data.service';
import { RecipesService } from '../../../core/services/recipes.service';
import { SessionService } from '../../../core/services/session.service';
import { RecipeGeneralInfoForm } from './components/recipe-general-info-form/recipe-general-info-form';
import { RecipeCoverImageForm } from './components/recipe-cover-image-form/recipe-cover-image-form';
import { RecipeIngredientsForm } from './components/recipe-ingredients-form/recipe-ingredients-form';
import { RecipeStepsForm } from './components/recipe-steps-form/recipe-steps-form';
import { RecipeTagsForm } from './components/recipe-tags-form/recipe-tags-form';
import { RecipeEquipmentsForm } from './components/recipe-equipments-form/recipe-equipments-form';
import { RecipeEquipmentFormValue, RecipeEquipmentInput, RecipeFormValue, RecipeIngredientFormValue, RecipeIngredientInput, RecipeInput, RecipeStepFormValue, RecipeStepInput } from './recipe-form.types';

type RecipeIngredientFormGroup = FormGroup<{
  ingredientId: FormControl<number | null>;
  quantity: FormControl<number | null>;
  unit: FormControl<string>;
  note: FormControl<string>;
}>;

type RecipeStepFormGroup = FormGroup<{
  description: FormControl<string>;
}>;

type RecipeEquipmentFormGroup = FormGroup<{
  equipmentId: FormControl<number | null>;
}>;

type RecipeFormGroup = FormGroup<{
  title: FormControl<string>;
  categoryId: FormControl<number | null>;
  description: FormControl<string>;
  coverImageUrl: FormControl<string>;
  prepTimeMinutes: FormControl<number | null>;
  restTimeMinutes: FormControl<number | null>;
  cookTimeMinutes: FormControl<number | null>;
  servings: FormControl<number | null>;
  tagIds: FormControl<number[]>;
  ingredients: FormArray<RecipeIngredientFormGroup>;
  steps: FormArray<RecipeStepFormGroup>;
  equipments: FormArray<RecipeEquipmentFormGroup>;
}>;

interface PublicationChecklistItem {
  label: string;
  valid: boolean;
}

type RecipeFormRecipe = RecipeInput & {
  status?: RecipeStatus | null;
  rejectionReason?: string | null;
};

@Component({
  selector: 'rs-recipe-form',
  imports: [CommonModule, ReactiveFormsModule, RecipeGeneralInfoForm, RecipeCoverImageForm, RecipeIngredientsForm, RecipeStepsForm, RecipeTagsForm, RecipeEquipmentsForm],
  standalone: true,
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.css'
})
export class RecipeForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recipesService = inject(RecipesService);
  private readonly referenceDataService = inject(RecipeReferenceDataService);
  private readonly sessionService = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSaving = signal(false);
  readonly isSubmitting = signal(false);
  readonly isInitialLoading = signal(false);
  readonly hasInitialLoadError = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly recipe = signal<RecipeFormRecipe | null>(null);
  readonly categories = signal<RecipeReferenceOption[]>([]);
  readonly ingredientsReference = signal<RecipeReferenceOption[]>([]);
  readonly equipments = signal<RecipeReferenceOption[]>([]);
  readonly tags = signal<RecipeReferenceOption[]>([]);
  private readonly formValueVersion = signal(0);

  recipeId: number | null = null;
  lastSavedSnapshot: RecipeFormValue | null = null;

  readonly form: RecipeFormGroup = this.fb.group({
    title: this.fb.control('', [Validators.required, Validators.minLength(5)]),
    categoryId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    description: this.fb.control('', [Validators.minLength(20)]),
    coverImageUrl: this.fb.control(''),
    prepTimeMinutes: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    restTimeMinutes: this.fb.control<number | null>(null),
    cookTimeMinutes: this.fb.control<number | null>(null),
    servings: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    tagIds: this.fb.control<number[]>([]),
    ingredients: this.fb.array<RecipeIngredientFormGroup>([this.createIngredientGroup()]),
    steps: this.fb.array<RecipeStepFormGroup>([this.createStepGroup()]),
    equipments: this.fb.array<RecipeEquipmentFormGroup>([this.createEquipmentGroup()])
  });

  readonly isReadonly = computed(() => {
    const status = this.recipe()?.status;

    return status === 'pending' || status === 'published' || status === 'archived';
  });

  readonly canArchiving = computed(() => {
    const status = this.recipe()?.status;

    return status === 'published' || status === 'rejected';
  });

  readonly publicationChecklist = computed<PublicationChecklistItem[]>(() => {
    this.formValueVersion();
    const formValue = this.getSanitizedFormValue();

    return [
      {
        label: 'Titre valide',
        valid: formValue.title.trim().length >= 5
      },
      {
        label: 'Description suffisante',
        valid: formValue.description.trim().length >= 20
      },
      {
        label: 'Catégorie renseignée',
        valid: formValue.categoryId !== null && formValue.categoryId > 0
      },
      {
        label: 'Au moins un ingrédient',
        valid: this.cleanIngredients(formValue.ingredients).length > 0
      },
      {
        label: 'Au moins une étape',
        valid: this.cleanSteps(formValue.steps).length > 0
      },
      {
        label: 'Portions renseignées',
        valid: formValue.servings !== null && formValue.servings > 0
      },
      {
        label: 'Temps de préparation renseigné',
        valid: formValue.prepTimeMinutes !== null && formValue.prepTimeMinutes >= 0
      },
      {
        label: 'Ustensiles sans doublon',
        valid: !this.hasDuplicateEquipments()
      }
    ];
  });

  private readonly canSaveDraftState = computed(() => {
    this.formValueVersion();

    return this.form.controls.title.valid && !this.hasDuplicateEquipments();
  });

  private readonly canRequestPublicationState = computed(() => this.publicationChecklist().every((item) => item.valid));

  private readonly canSubmitPublicationState = computed(() => this.canRequestPublicationState() && !this.isSaving() && !this.isSubmitting());

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.touchFormState());

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.loadInitialData(null);
      return;
    }

    const recipeId = Number(idParam);

    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      this.redirectToSubmitWithoutId();
      return;
    }

    this.loadInitialData(recipeId);
  }

  private loadInitialData(recipeId: number | null): void {
    this.isInitialLoading.set(true);
    this.hasInitialLoadError.set(false);
    this.form.disable();

    forkJoin({
      categories: this.referenceDataService.getCategories(),
      ingredients: this.referenceDataService.getIngredients(),
      equipments: this.referenceDataService.getEquipments(),
      tags: this.referenceDataService.getTags(),
      recipe: recipeId ? this.recipesService.getById(recipeId) : of(null)
    })
      .pipe(finalize(() => this.isInitialLoading.set(false)))
      .subscribe({
        next: ({ categories, ingredients, equipments, tags, recipe }) => {
          this.categories.set(categories);
          this.ingredientsReference.set(ingredients);
          this.equipments.set(equipments);
          this.tags.set(tags);

          if (recipeId && !recipe) {
            this.redirectToSubmitWithoutId();
            return;
          }

          if (recipe) {
            this.recipe.set(recipe as RecipeFormRecipe);
            this.recipeId = recipe.id ?? recipeId;
            this.fillForm(recipe);
          }

          if (this.isReadonly())
            this.form.disable();
          else
            this.form.enable();

          this.touchFormState();
        },
        error: () => {
          this.hasInitialLoadError.set(true);
          this.form.enable();
          this.errorMessage.set('Impossible de charger les données du formulaire.');
        }
      });
  }

  private createIngredientGroup(): RecipeIngredientFormGroup {
    return this.fb.group({
      ingredientId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      quantity: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
      unit: this.fb.control(''),
      note: this.fb.control('')
    });
  }

  private createStepGroup(): RecipeStepFormGroup {
    return this.fb.group({
      description: this.fb.control('', [Validators.required])
    });
  }

  private createEquipmentGroup(): RecipeEquipmentFormGroup {
    return this.fb.group({
      equipmentId: this.fb.control<number | null>(null)
    });
  }

  get ingredients(): FormArray<RecipeIngredientFormGroup> {
    return this.form.controls.ingredients;
  }

  get steps(): FormArray<RecipeStepFormGroup> {
    return this.form.controls.steps;
  }

  get equipmentsFormArray(): FormArray<RecipeEquipmentFormGroup> {
    return this.form.controls.equipments;
  }

  get readOnlyMessage(): string {
    const status = this.recipe()?.status;

    if (status === 'pending')
      return 'Cette recette est en attente de modération. Elle n\'est plus modifiable pour le moment.';

    if (status === 'published')
      return 'Cette recette est publiée. La modification des recettes publiées n\'est pas disponible pour le moment.';

    if (status === 'archived')
      return 'Cette recette est archivée. Elle n\'est plus modifiable.';

    return '';
  }

  addIngredient(): void {
    if (this.isReadonly())
      return;

    this.ingredients.push(this.createIngredientGroup());
    this.touchFormState();
  }

  removeIngredient(index: number): void {
    if (this.isReadonly())
      return;

    if (this.ingredients.length <= 1) {
      this.ingredients.at(0).reset({ ingredientId: null, quantity: null, unit: '', note: '' });
      this.touchFormState();
      return;
    }

    this.ingredients.removeAt(index);
    this.touchFormState();
  }

  addStep(): void {
    if (this.isReadonly())
      return;

    this.steps.push(this.createStepGroup());
    this.touchFormState();
  }

  removeStep(index: number): void {
    if (this.isReadonly())
      return;

    if (this.steps.length <= 1) {
      this.steps.at(0).reset({ description: '' });
      this.touchFormState();
      return;
    }

    this.steps.removeAt(index);
    this.touchFormState();
  }

  addEquipment(): void {
    if (this.isReadonly())
      return;

    this.equipmentsFormArray.push(this.createEquipmentGroup());
    this.touchFormState();
  }

  removeEquipment(index: number): void {
    if (this.isReadonly())
      return;

    if (this.equipmentsFormArray.length <= 1) {
      this.equipmentsFormArray.at(0).reset({ equipmentId: null });
      this.touchFormState();
      return;
    }

    this.equipmentsFormArray.removeAt(index);
    this.touchFormState();
  }

  onSaveDraft(): void {
    if (this.isReadonly())
      return;

    if (!this.canSaveDraftState()) {
      this.form.controls.title.markAsTouched();
      this.errorMessage.set(this.hasDuplicateEquipments() ? this.duplicateEquipmentMessage : 'Le brouillon doit avoir un titre d\'au moins 5 caractères.');
      return;
    }

    const userId = this.sessionService.user()?.id ?? 0;
    const payload = this.buildRecipeInput(userId);

    this.clearMessages();
    this.isSaving.set(true);

    this.persistRecipe(payload).subscribe({
      next: (result) => {
        this.isSaving.set(false);
        this.recipeId = result.id;
        this.recipe.set({ ...this.recipe(), ...result, status: (result as RecipeFormRecipe).status ?? this.recipe()?.status ?? 'draft' } as RecipeFormRecipe);
        this.successMessage.set('Brouillon enregistré.');
        this.errorMessage.set('');
        this.lastSavedSnapshot = this.getSanitizedFormValue();
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Impossible d\'enregistrer le brouillon.');
        this.successMessage.set('');
      }
    });
  }

  onRequestPublication(): void {
    if (this.isReadonly())
      return;

    if (!this.canRequestPublicationState()) {
      this.form.markAllAsTouched();
      this.errorMessage.set(this.hasDuplicateEquipments() ? this.duplicateEquipmentMessage : 'Complétez les éléments de la checklist avant de soumettre la recette.');
      return;
    }

    if (this.isSaving() || this.isSubmitting())
      return;

    const userId = this.sessionService.user()?.id ?? 0;
    const payload = this.buildRecipeInput(userId);

    this.clearMessages();
    this.isSubmitting.set(true);

    this.persistRecipe(payload)
      .pipe(
        switchMap((result) => {
          const recipeId = result.id;

          if (!recipeId)
            return throwError(() => new Error('Recipe ID is missing after save.'));

          this.recipeId = recipeId;
          this.lastSavedSnapshot = this.getSanitizedFormValue();
          return this.recipesService.publish(recipeId);
        })
      )
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.successMessage.set('Demande de publication envoyée.');
          this.errorMessage.set('');
          this.lastSavedSnapshot = this.getSanitizedFormValue();
          this.router.navigate(['/me/recipes/list']);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set('Impossible de demander la publication.');
          this.successMessage.set('');
        }
      });
  }

  onRequestArchiving(): void {
    const recipeId = this.recipeId;

    if (!recipeId || !this.canArchiving() || this.isSaving() || this.isSubmitting())
      return;

    if (!this.confirmAction('Archiver cette recette ?'))
      return;

    this.clearMessages();
    this.isSubmitting.set(true);

    this.recipesService.archive(recipeId)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.recipe.update((recipe) => recipe ? { ...recipe, status: 'archived' } : recipe);
          this.form.disable();
          this.successMessage.set('Recette archivée.');
          this.errorMessage.set('');
        },
        error: () => {
          this.errorMessage.set('Impossible d\'archiver la recette.');
          this.successMessage.set('');
        }
      });
  }

  private confirmAction(message: string): boolean {
    return typeof globalThis.confirm === 'function' && globalThis.confirm(message);
  }

  get isDirty(): boolean {
    this.formValueVersion();
    const currentValue = this.getSanitizedFormValue();

    if (!this.lastSavedSnapshot)
      return this.hasMeaningfulContent(currentValue);

    return JSON.stringify(currentValue) !== JSON.stringify(this.lastSavedSnapshot);
  }

  get canSaveDraft(): boolean {
    return this.canSaveDraftState();
  }

  get canRequestPublication(): boolean {
    return this.canRequestPublicationState();
  }

  get canSubmitPublication(): boolean {
    return this.canSubmitPublicationState();
  }

  shouldShowControlError(controlName: keyof RecipeFormGroup['controls']): boolean {
    const control = this.form.controls[controlName];

    return control.invalid && (control.touched || control.dirty);
  }

  availableEquipmentOptions(index: number): RecipeReferenceOption[] {
    this.formValueVersion();
    const currentId = this.equipmentsFormArray.at(index)?.controls.equipmentId.value ?? null;
    const selectedIds = new Set(
      this.equipmentsFormArray.controls
        .map((control, controlIndex) => controlIndex === index ? null : control.controls.equipmentId.value)
        .filter((value): value is number => value !== null)
    );

    return this.equipments().filter((equipment) => equipment.id === currentId || !selectedIds.has(equipment.id));
  }

  readonly duplicateEquipmentMessage = 'Un même ustensile ne peut pas être sélectionné plusieurs fois.';

  get legacyPublicationChecklist(): PublicationChecklistItem[] {
    const formValue = this.getSanitizedFormValue();

    return [
      {
        label: 'Titre valide',
        valid: formValue.title.trim().length >= 5
      },
      {
        label: 'Description suffisante',
        valid: formValue.description.trim().length >= 20
      },
      {
        label: 'Catégorie renseignée',
        valid: formValue.categoryId !== null && formValue.categoryId > 0
      },
      {
        label: 'Au moins un ingrédient',
        valid: this.cleanIngredients(formValue.ingredients).length > 0
      },
      {
        label: 'Au moins une étape',
        valid: this.cleanSteps(formValue.steps).length > 0
      },
      {
        label: 'Portions renseignées',
        valid: formValue.servings !== null && formValue.servings > 0
      },
      {
        label: 'Temps de préparation renseignée',
        valid: formValue.prepTimeMinutes !== null && formValue.prepTimeMinutes >= 0
      }
    ];
  }

  private buildRecipeInput(userId: number): RecipeInput {
    const formValue: RecipeFormValue = this.getSanitizedFormValue();
    const ingredients = this.cleanIngredients(formValue.ingredients).map(
      (ingredient, index): RecipeIngredientInput => ({
        ingredientId: ingredient.ingredientId as number,
        quantity: ingredient.quantity as number,
        unit: ingredient.unit.trim(),
        note: this.toNullableTrimmedString(ingredient.note),
        sortOrder: index + 1
      })
    );
    const steps = this.cleanSteps(formValue.steps).map((step, index): RecipeStepInput => ({ description: step.description.trim(), stepNumber: index + 1 }));
    const equipments = this.cleanEquipments(formValue.equipments).map((equipment): RecipeEquipmentInput => ({ equipmentId: equipment.equipmentId as number }));
    const coverImageUrl = this.toNullableTrimmedString(formValue.coverImageUrl);

    return {
      id: this.recipeId,
      userId,
      slug: '',
      title: formValue.title,
      categoryId: formValue.categoryId,
      description: formValue.description,
      coverImageUrl,
      prepTimeMinutes: formValue.prepTimeMinutes,
      restTimeMinutes: formValue.restTimeMinutes,
      cookTimeMinutes: formValue.cookTimeMinutes,
      servings: formValue.servings,
      tagIds: this.uniqueNumbers(formValue.tagIds),
      ingredients,
      steps,
      equipments
    };
  }

  private fillForm(recipe: RecipeInput): void {
    this.form.patchValue({
      title: recipe.title ?? '',
      categoryId: recipe.categoryId ?? null,
      description: recipe.description ?? '',
      coverImageUrl: this.extractCoverImageUrl(recipe) ?? '',
      prepTimeMinutes: recipe.prepTimeMinutes ?? null,
      restTimeMinutes: recipe.restTimeMinutes ?? null,
      cookTimeMinutes: recipe.cookTimeMinutes ?? null,
      servings: recipe.servings ?? null,
      tagIds: this.extractTagIds(recipe)
    });

    this.replaceIngredients(recipe.ingredients ?? []);
    this.replaceSteps(recipe.steps ?? []);
    this.replaceEquipments(recipe.equipments ?? []);
    this.lastSavedSnapshot = this.getSanitizedFormValue();
  }

  private persistRecipe(payload: RecipeInput): Observable<RecipeInput> {
    if (this.recipeId)
      return this.recipesService.update(payload);

    return this.recipesService.create(payload);
  }

  private replaceIngredients(ingredients: RecipeIngredientInput[]): void {
    const orderedIngredients = this.sortByOptionalNumber(ingredients, (ingredient) => ingredient.sortOrder);
    const ingredientGroups = orderedIngredients.length > 0
      ? orderedIngredients.map((ingredient) => this.fb.group({
        ingredientId: this.fb.control<number | null>(ingredient.ingredientId ?? null, [Validators.required, Validators.min(1)]),
        quantity: this.fb.control<number | null>(ingredient.quantity ?? null, [Validators.required, Validators.min(0.01)]),
        unit: this.fb.control(ingredient.unit ?? ''),
        note: this.fb.control(ingredient.note ?? '')
      }))
      : [this.createIngredientGroup()];

    this.form.setControl('ingredients', this.fb.array<RecipeIngredientFormGroup>(ingredientGroups));
  }

  private replaceSteps(steps: RecipeStepInput[]): void {
    const orderedSteps = this.sortByOptionalNumber(steps, (step) => step.stepNumber);
    const stepGroups = orderedSteps.length > 0 ? orderedSteps.map((step) => this.fb.group({ description: this.fb.control(step.description ?? '', [Validators.required]) })) : [this.createStepGroup()];

    this.form.setControl('steps', this.fb.array<RecipeStepFormGroup>(stepGroups));
  }

  private replaceEquipments(equipments: RecipeEquipmentInput[]): void {
    const equipmentGroups = equipments.length > 0 ? equipments.map((equipment) => this.fb.group({ equipmentId: this.fb.control<number | null>(this.extractEquipmentId(equipment)) })) : [this.createEquipmentGroup()];

    this.form.setControl('equipments', this.fb.array<RecipeEquipmentFormGroup>(equipmentGroups));
  }

  private sortByOptionalNumber<T>(items: T[], selector: (item: T) => number | null | undefined): T[] {
    return [...items].sort((left, right) => {
      const leftOrder = selector(left);
      const rightOrder = selector(right);

      if (leftOrder === null || leftOrder === undefined)
        return rightOrder === null || rightOrder === undefined ? 0 : 1;

      if (rightOrder === null || rightOrder === undefined)
        return -1;

      return leftOrder - rightOrder;
    });
  }

  private extractEquipmentId(equipment: RecipeEquipmentInput): number | null {
    const candidates = this.collectEquipmentIdCandidates(equipment as unknown);

    if (candidates.length === 0)
      return null;

    candidates.sort((left, right) => right.score - left.score);

    return candidates[0].value;
  }

  private collectEquipmentIdCandidates(value: unknown, path: string[] = []): { value: number; score: number }[] {
    if (Array.isArray(value))
      return value.flatMap((entry, index) => this.collectEquipmentIdCandidates(entry, [...path, String(index)]));

    if (!this.isRecord(value))
      return [];

    const candidates: { value: number; score: number }[] = [];

    for (const [key, entryValue] of Object.entries(value)) {
      const nextPath = [...path, key];
      const parsedValue = this.toNullableNumber(entryValue);

      if (parsedValue !== null) {
        const score = this.scoreEquipmentIdCandidate(nextPath);

        if (score > 0)
          candidates.push({ value: parsedValue, score });
      }

      candidates.push(...this.collectEquipmentIdCandidates(entryValue, nextPath));
    }

    return candidates;
  }

  private toNullableNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value))
      return value;

    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      if (trimmedValue.length === 0)
        return null;

      const parsedValue = Number(trimmedValue);

      return Number.isFinite(parsedValue) ? parsedValue : null;
    }

    return null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private scoreEquipmentIdCandidate(path: string[]): number {
    const normalizedPath = path.map((segment) => this.normalizeKey(segment));
    const lastSegment = normalizedPath.at(-1) ?? '';
    const joinedPath = normalizedPath.join('.');

    if (lastSegment === 'recipeid')
      return 0;

    if (lastSegment === 'equipmentid')
      return 100;

    if ((lastSegment === 'id' || lastSegment === 'equipmentid') && normalizedPath.some((segment) => segment === 'equipment'))
      return 90;

    if (lastSegment.includes('equipment') && lastSegment.includes('id'))
      return 85;

    if (joinedPath.includes('equipment') && joinedPath.includes('id'))
      return 80;

    if (lastSegment === 'id')
      return 10;

    return 0;
  }

  private normalizeKey(value: string): string {
    return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
  }

  private extractCoverImageUrl(recipe: RecipeInput): string | null {
    return this.toNullableString(recipe.coverImageUrl) ?? this.toNullableString(recipe.imageUrl);
  }

  private extractTagIds(recipe: RecipeInput): number[] {
    const explicitTagIds = this.uniqueNumbers((recipe.tagIds ?? []).map((tagId) => this.toNullableNumber(tagId)));

    if (explicitTagIds.length > 0)
      return explicitTagIds;

    return this.uniqueNumbers((recipe.tags ?? []).map((tag) => this.extractTagId(tag)).filter((tagId): tagId is number => tagId !== null));
  }

  private extractTagId(tag: unknown): number | null {
    const directTagId = this.toNullableNumber(tag);

    if (directTagId !== null)
      return directTagId;

    if (!this.isRecord(tag))
      return null;

    return this.toNullableNumber(tag['id'] ?? tag['tagId'] ?? tag['TagId']);
  }

  private redirectToSubmitWithoutId(): void {
    this.recipeId = null;
    this.router.navigate(['/me/recipes/submit']);
  }

  private clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  private getSanitizedFormValue(): RecipeFormValue {
    const rawValue = this.form.getRawValue();

    return {
      ...rawValue,
      title: rawValue.title.trim(),
      description: rawValue.description.trim(),
      coverImageUrl: rawValue.coverImageUrl.trim(),
      tagIds: this.uniqueNumbers(rawValue.tagIds),
      ingredients: rawValue.ingredients.map(
        (ingredient): RecipeIngredientFormValue => ({
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity,
          unit: ingredient.unit.trim(),
          note: ingredient.note.trim()
        })
      ),
      steps: rawValue.steps.map(
        (step): RecipeStepFormValue => ({
          description: step.description.trim()
        })
      ),
      equipments: rawValue.equipments.map(
        (equipment): RecipeEquipmentFormValue => ({
          equipmentId: equipment.equipmentId
        })
      )
    };
  }

  private cleanIngredients(ingredients: RecipeIngredientFormValue[]): RecipeIngredientFormValue[] {
    return ingredients.filter((ingredient) => this.isIngredientValid(ingredient));
  }

  private cleanSteps(steps: RecipeStepFormValue[]): RecipeStepFormValue[] {
    return steps.filter((step) => this.isStepValid(step));
  }

  private cleanEquipments(equipments: RecipeEquipmentFormValue[]): RecipeEquipmentFormValue[] {
    return equipments.filter((equipment) => equipment.equipmentId !== null);
  }

  private hasDuplicateEquipments(): boolean {
    const equipmentIds = this.cleanEquipments(this.getSanitizedFormValue().equipments).map((equipment) => equipment.equipmentId);

    return new Set(equipmentIds).size !== equipmentIds.length;
  }

  private touchFormState(): void {
    this.formValueVersion.update((version) => version + 1);
  }

  private hasMeaningfulContent(formValue: RecipeFormValue): boolean {
    return (
      formValue.title.length > 0 ||
      formValue.categoryId !== null ||
      formValue.description.length > 0 ||
      formValue.prepTimeMinutes !== null ||
      formValue.restTimeMinutes !== null ||
      formValue.cookTimeMinutes !== null ||
      formValue.servings !== null ||
      formValue.coverImageUrl.length > 0 ||
      formValue.tagIds.length > 0 ||
      formValue.ingredients.some((ingredient) => this.hasMeaningfulIngredientContent(ingredient)) ||
      formValue.steps.some((step) => step.description.length > 0) ||
      formValue.equipments.some((equipment) => equipment.equipmentId !== null)
    );
  }

  private hasMeaningfulIngredientContent(ingredient: RecipeIngredientFormValue): boolean {
    return (
      ingredient.ingredientId !== null ||
      ingredient.quantity !== null ||
      ingredient.unit.length > 0 ||
      ingredient.note.length > 0
    );
  }

  private isIngredientValid(ingredient: RecipeIngredientFormValue): boolean {
    return (
      ingredient.ingredientId !== null &&
      ingredient.quantity !== null &&
      ingredient.quantity > 0
    );
  }

  private isStepValid(step: RecipeStepFormValue): boolean {
    return step.description.trim().length > 0;
  }

  private toNullableTrimmedString(value: string): string | null {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  private toNullableString(value: unknown): string | null {
    if (typeof value !== 'string')
      return null;

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  private uniqueNumbers(values: (number | null)[]): number[] {
    return Array.from(new Set(values.filter((value): value is number => value !== null)));
  }
}

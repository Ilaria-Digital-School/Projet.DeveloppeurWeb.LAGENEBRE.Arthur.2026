import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { RecipeReferenceOption } from '../../../../../core/services/recipe-reference-data.service';

type RecipeIngredientItemFormGroup = FormGroup<{
  ingredientId: FormControl<number | null>;
  quantity: FormControl<number | null>;
  unit: FormControl<string>;
  note: FormControl<string>;
}>;

@Component({
  selector: 'rs-recipe-ingredients-form',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './recipe-ingredients-form.html',
  styleUrl: './recipe-ingredients-form.css',
})
export class RecipeIngredientsForm {
  @Input({ required: true }) form!: RecipeIngredientItemFormGroup;
  @Input() ingredientNumber = 1;
  @Input() ingredients: RecipeReferenceOption[] = [];

  protected get quantityInputId(): string {
    return `recipe-ingredient-${this.ingredientNumber}-quantity`;
  }

  protected get unitInputId(): string {
    return `recipe-ingredient-${this.ingredientNumber}-unit`;
  }

  protected get ingredientInputId(): string {
    return `recipe-ingredient-${this.ingredientNumber}-ingredient`;
  }

  protected get noteInputId(): string {
    return `recipe-ingredient-${this.ingredientNumber}-note`;
  }

  protected shouldShowError(controlName: keyof RecipeIngredientItemFormGroup['controls']): boolean {
    const control = this.form.controls[controlName];

    return control.invalid && (control.touched || control.dirty);
  }
}

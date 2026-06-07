import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

type RecipeStepItemFormGroup = FormGroup<{
  description: FormControl<string>;
}>;

@Component({
  selector: 'rs-recipe-steps-form',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './recipe-steps-form.html',
  styleUrl: './recipe-steps-form.css',
})
export class RecipeStepsForm {
  @Input({ required: true }) form!: RecipeStepItemFormGroup;
  @Input({ required: true }) stepNumber!: number;

  protected get descriptionInputId(): string {
    return `recipe-step-${this.stepNumber}-description`;
  }

  protected shouldShowDescriptionError(): boolean {
    const control = this.form.controls.description;

    return control.invalid && (control.touched || control.dirty);
  }
}

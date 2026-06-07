import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { RecipeReferenceOption } from '../../../../../core/services/recipe-reference-data.service';

@Component({
  selector: 'rs-recipe-general-info-form',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './recipe-general-info-form.html',
  styleUrl: './recipe-general-info-form.css',
})
export class RecipeGeneralInfoForm {
  @Input({ required: true }) form!: FormGroup;
  @Input() categories: RecipeReferenceOption[] = [];

  protected shouldShowError(controlName: string): boolean {
    const control = this.form.get(controlName);

    return !!control && control.invalid && (control.touched || control.dirty);
  }
}

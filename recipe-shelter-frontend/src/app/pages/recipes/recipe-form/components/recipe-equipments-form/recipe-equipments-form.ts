import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { RecipeReferenceOption } from '../../../../../core/services/recipe-reference-data.service';

type RecipeEquipmentItemFormGroup = FormGroup<{
  equipmentId: FormControl<number | null>;
}>;

@Component({
  selector: 'rs-recipe-equipments-form',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './recipe-equipments-form.html',
  styleUrl: './recipe-equipments-form.css',
})
export class RecipeEquipmentsForm {
  @Input({ required: true }) form!: RecipeEquipmentItemFormGroup;
  @Input({ required: true }) equipmentNumber!: number;
  @Input() equipments: RecipeReferenceOption[] = [];

  protected get equipmentInputId(): string {
    return `recipe-equipment-${this.equipmentNumber}`;
  }
}

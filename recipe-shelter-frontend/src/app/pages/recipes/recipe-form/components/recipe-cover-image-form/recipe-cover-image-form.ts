import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'rs-recipe-cover-image-form',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './recipe-cover-image-form.html',
  styleUrl: './recipe-cover-image-form.css',
})
export class RecipeCoverImageForm {
  @Input({ required: true }) form!: FormGroup;
  @Input() readonly = false;

  protected get coverImageUrl(): string {
    const value = this.form.get('coverImageUrl')?.value;

    return typeof value === 'string' ? value.trim() : '';
  }

  protected clearCoverImage(): void {
    if (this.readonly)
      return;

    this.form.get('coverImageUrl')?.setValue('');
    this.form.get('coverImageUrl')?.markAsDirty();
  }
}

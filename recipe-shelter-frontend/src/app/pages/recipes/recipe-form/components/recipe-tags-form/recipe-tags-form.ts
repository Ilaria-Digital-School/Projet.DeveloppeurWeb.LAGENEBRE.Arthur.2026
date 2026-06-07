import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { RecipeReferenceOption } from '../../../../../core/services/recipe-reference-data.service';

@Component({
  selector: 'rs-recipe-tags-form',
  imports: [],
  standalone: true,
  templateUrl: './recipe-tags-form.html',
  styleUrl: './recipe-tags-form.css'
})
export class RecipeTagsForm {
  @Input({ required: true }) form!: FormGroup;
  @Input() tags: RecipeReferenceOption[] = [];
  @Input() readonly = false;

  protected get selectedTags(): RecipeReferenceOption[] {
    const selectedIds = new Set(this.selectedTagIds);

    return this.tags.filter((tag) => selectedIds.has(tag.id));
  }

  protected isTagSelected(tagId: number): boolean {
    return this.selectedTagIds.includes(tagId);
  }

  protected toggleTag(tagId: number, checked: boolean): void {
    if (this.readonly)
      return;

    const nextTagIds = checked
      ? Array.from(new Set([...this.selectedTagIds, tagId]))
      : this.selectedTagIds.filter((selectedTagId) => selectedTagId !== tagId);

    this.form.get('tagIds')?.setValue(nextTagIds);
    this.form.get('tagIds')?.markAsDirty();
  }

  private get selectedTagIds(): number[] {
    const value = this.form.get('tagIds')?.value;

    return Array.isArray(value) ? value.filter((tagId): tagId is number => typeof tagId === 'number') : [];
  }
}

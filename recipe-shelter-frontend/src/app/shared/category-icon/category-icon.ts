import { Component, Input } from '@angular/core';

import { CategoryIconKind, resolveCategoryIconKind } from './category-icon-map';

@Component({
  selector: 'rs-category-icon',
  standalone: true,
  templateUrl: './category-icon.html',
  styleUrl: './category-icon.css',
})
export class CategoryIcon {
  @Input({ required: true }) iconName = '';

  protected get iconKind(): CategoryIconKind {
    return resolveCategoryIconKind(this.iconName);
  }
}

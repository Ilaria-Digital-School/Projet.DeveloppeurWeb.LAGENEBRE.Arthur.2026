import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PaginationMeta } from '../../../core/models/pagination.model';
import { PaginationControls } from '../../components/pagination-controls/pagination-controls';

@Component({
  selector: 'rs-recipe-list-shell',
  standalone: true,
  imports: [RouterLink, PaginationControls],
  templateUrl: './recipe-list-shell.html',
  styleUrl: './recipe-list-shell.css',
})
export class RecipeListShell {
  readonly skeletons = Array.from({ length: 12 }, (_, index) => index);

  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() emptyTitle = '';
  @Input() emptyDescription = '';
  @Input() loading = false;
  @Input() error = '';
  @Input() isEmpty = false;
  @Input() actionLabel = '';
  @Input() actionRoute: string | unknown[] | null = null;
  @Input() pagination: PaginationMeta | null = null;

  @Output() pageChange = new EventEmitter<number>();
}

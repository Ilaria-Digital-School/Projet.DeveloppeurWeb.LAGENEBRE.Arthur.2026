import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PaginationMeta } from '../../../core/models/pagination.model';

@Component({
  selector: 'rs-pagination-controls',
  standalone: true,
  templateUrl: './pagination-controls.html',
  styleUrl: './pagination-controls.css',
})
export class PaginationControls {
  @Input({ required: true }) pagination!: PaginationMeta;
  @Input() disabled = false;

  @Output() pageChange = new EventEmitter<number>();

  get totalPagesLabel(): number {
    return Math.max(this.pagination.totalPages, 1);
  }

  onPrevious(): void {
    if (this.disabled || !this.pagination.hasPreviousPage)
      return;

    this.pageChange.emit(this.pagination.page - 1);
  }

  onNext(): void {
    if (this.disabled || !this.pagination.hasNextPage)
      return;

    this.pageChange.emit(this.pagination.page + 1);
  }
}

import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminComment } from '../../../../core/models/admin-comment.model';

export type AdminCommentPrimaryAction = 'unmoderate' | 'restore';
export type AdminCommentActionType = AdminCommentPrimaryAction | 'delete';

export interface AdminCommentAction {
  type: AdminCommentActionType;
  comment: AdminComment;
}

@Component({
  selector: 'rs-admin-comments-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './admin-comments-list.html',
  styleUrl: './admin-comments-list.css',
})
export class AdminCommentsList {
  readonly comments = input.required<AdminComment[]>();
  readonly primaryAction = input.required<AdminCommentPrimaryAction>();
  readonly actionInProgressId = input<number | null>(null);
  readonly showModerationDetails = input(false);
  readonly action = output<AdminCommentAction>();

  protected primaryActionLabel(action: AdminCommentPrimaryAction): string {
    return action === 'unmoderate' ? 'Annuler la modération' : 'Restaurer';
  }

  protected emitAction(type: AdminCommentActionType, comment: AdminComment): void {
    this.action.emit({ type, comment });
  }
}

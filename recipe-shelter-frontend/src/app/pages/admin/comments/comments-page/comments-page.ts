import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { AdminComment } from '../../../../core/models/admin-comment.model';
import { AdminCommentsService } from '../../../../core/services/admin-comments.service';
import { AdminCommentAction, AdminCommentActionType, AdminCommentPrimaryAction, AdminCommentsList } from '../admin-comments-list/admin-comments-list';

type AdminCommentsView = 'moderated' | 'softDeleted';

interface AdminCommentsViewConfig {
  title: string;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
  primaryAction: AdminCommentPrimaryAction;
  showModerationDetails: boolean;
}

const VIEW_CONFIGS: Record<AdminCommentsView, AdminCommentsViewConfig> = {
  moderated: {
    title: 'Commentaires modérés',
    loadingLabel: 'Chargement des commentaires modérés...',
    emptyLabel: 'Aucun commentaire modéré.',
    errorLabel: 'Impossible de charger les commentaires modérés pour le moment.',
    primaryAction: 'unmoderate',
    showModerationDetails: true,
  },
  softDeleted: {
    title: 'Commentaires supprimés',
    loadingLabel: 'Chargement des commentaires supprimés...',
    emptyLabel: 'Aucun commentaire supprimé.',
    errorLabel: 'Impossible de charger les commentaires supprimés pour le moment.',
    primaryAction: 'restore',
    showModerationDetails: false,
  },
};

@Component({
  selector: 'rs-admin-comments-page',
  imports: [AdminCommentsList, RouterLink],
  templateUrl: './comments-page.html',
  styleUrl: './comments-page.css',
})
export class CommentsPage implements OnInit {
  private readonly adminCommentsService = inject(AdminCommentsService);
  private readonly route = inject(ActivatedRoute);

  protected readonly comments = signal<AdminComment[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly actionInProgressId = signal<number | null>(null);
  protected readonly config = signal<AdminCommentsViewConfig>(VIEW_CONFIGS.moderated);
  private view: AdminCommentsView = 'moderated';

  ngOnInit(): void {
    this.view = this.getRouteView();
    this.config.set(VIEW_CONFIGS[this.view]);
    this.loadComments();
  }

  protected handleAction(action: AdminCommentAction): void {
    const confirmation = this.getConfirmationMessage(action.type);

    if (!window.confirm(confirmation) || this.actionInProgressId())
      return;

    this.errorMessage.set('');
    this.actionInProgressId.set(action.comment.id);

    this.getActionRequest(action.type, action.comment.id).subscribe({
      next: () => {
        this.comments.update((comments) => comments.filter((comment) => comment.id !== action.comment.id));
        this.actionInProgressId.set(null);
      },
      error: () => {
        this.errorMessage.set(this.getActionErrorMessage(action.type));
        this.actionInProgressId.set(null);
      }
    });
  }

  private loadComments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.getLoadRequest().subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(this.config().errorLabel);
        this.isLoading.set(false);
      }
    });
  }

  private getRouteView(): AdminCommentsView {
    return this.route.snapshot.data['commentsView'] === 'softDeleted' ? 'softDeleted' : 'moderated';
  }

  private getLoadRequest(): Observable<AdminComment[]> {
    return this.view === 'softDeleted' ? this.adminCommentsService.getSoftDeleted() : this.adminCommentsService.getModerated();
  }

  private getActionRequest(type: AdminCommentActionType, commentId: number): Observable<boolean> {
    if (type === 'delete')
      return this.adminCommentsService.delete(commentId);

    return type === 'restore' ? this.adminCommentsService.restore(commentId) : this.adminCommentsService.unmoderate(commentId);
  }

  private getConfirmationMessage(type: AdminCommentActionType): string {
    switch (type) {
      case 'unmoderate':
        return 'Annuler la modération de ce commentaire ?';
      case 'restore':
        return 'Restaurer ce commentaire supprimé ?';
      case 'delete':
        return 'Supprimer définitivement ce commentaire ? Cette action est irréversible.';
    }
  }

  private getActionErrorMessage(type: AdminCommentActionType): string {
    switch (type) {
      case 'unmoderate':
        return 'Impossible d\'annuler la modération de ce commentaire pour le moment.';
      case 'restore':
        return 'Impossible de restaurer ce commentaire pour le moment.';
      case 'delete':
        return 'Impossible de supprimer définitivement ce commentaire pour le moment.';
    }
  }
}

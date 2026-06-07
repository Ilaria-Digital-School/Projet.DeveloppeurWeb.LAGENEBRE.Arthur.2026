import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AdminUser, AdminUserModerationLog, AdminUserStatus } from '../../../../core/models/admin-user.model';
import { AdminUsersService } from '../../../../core/services/admin-users.service';

export const MODERATION_REASON_MIN_LENGTH = 10;
export const MODERATION_REASON_MAX_LENGTH = 1000;

type ModerationFormMode = 'ban' | 'unban';

@Component({
  selector: 'rs-user-detail',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css',
})
export class UserDetail implements OnInit {
  private readonly adminUsersService = inject(AdminUsersService);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);

  protected readonly user = signal<AdminUser | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly activeForm = signal<ModerationFormMode | null>(null);
  protected readonly moderationReason = signal('');
  protected readonly moderationErrorMessage = signal('');
  protected readonly minReasonLength = MODERATION_REASON_MIN_LENGTH;
  protected readonly maxReasonLength = MODERATION_REASON_MAX_LENGTH;

  protected readonly isActive = computed(() => this.user()?.status === 'active');
  protected readonly isBanned = computed(() => this.user()?.status === 'banned');
  protected readonly trimmedModerationReason = computed(() => this.moderationReason().trim());
  protected readonly moderationReasonLength = computed(() => this.trimmedModerationReason().length);
  protected readonly canSubmitModeration = computed(() => {
    const length = this.moderationReasonLength();

    return length >= MODERATION_REASON_MIN_LENGTH && length <= MODERATION_REASON_MAX_LENGTH && !this.isSubmitting();
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.notFound.set(true);
      this.isLoading.set(false);
      return;
    }

    this.loadUser(id);
  }

  protected openModerationForm(mode: ModerationFormMode): void {
    if (this.isSubmitting())
      return;

    if ((mode === 'ban' && !this.isActive()) || (mode === 'unban' && !this.isBanned()))
      return;

    this.activeForm.set(mode);
    this.moderationReason.set('');
    this.moderationErrorMessage.set('');
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected cancelModerationForm(): void {
    if (this.isSubmitting())
      return;

    this.activeForm.set(null);
    this.moderationReason.set('');
    this.moderationErrorMessage.set('');
  }

  protected updateModerationReason(reason: string): void {
    this.moderationReason.set(reason);

    if (this.moderationErrorMessage())
      this.moderationErrorMessage.set('');
  }

  protected submitModeration(): void {
    const user = this.user();
    const mode = this.activeForm();
    const reason = this.trimmedModerationReason();

    if (!user || !mode || this.isSubmitting())
      return;

    const validationMessage = this.getReasonValidationMessage(reason);

    if (validationMessage) {
      this.moderationErrorMessage.set(validationMessage);
      return;
    }

    if ((mode === 'ban' && user.status !== 'active') || (mode === 'unban' && user.status !== 'banned'))
      return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.moderationErrorMessage.set('');

    const request = mode === 'ban' ? this.adminUsersService.banUser(user.id, reason) : this.adminUsersService.unbanUser(user.id, reason);

    request.subscribe({
      next: () => {
        this.successMessage.set(mode === 'ban' ? 'Le compte a été banni.' : 'Le compte a été réactivé.');
        this.activeForm.set(null);
        this.moderationReason.set('');
        this.loadUser(user.id, false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getActionErrorMessage(mode, error));
        this.isSubmitting.set(false);
      },
    });
  }

  protected getEmail(user: AdminUser): string {
    return user.email ?? 'Non renseigné';
  }

  protected getBanReason(user: AdminUser): string {
    return user.banReason ?? '';
  }

  protected getBanModerator(user: AdminUser): string {
    const banLog = this.getCurrentBanLog(user);

    if (banLog)
      return this.getModerationActor(banLog);

    return user.bannedByUserId ? `#${user.bannedByUserId}` : 'Non renseigné';
  }

  protected getModerationLogs(user: AdminUser): AdminUserModerationLog[] {
    return user.moderationLogs ?? [];
  }

  protected getStatusLabel(status: AdminUserStatus | string): string {
    switch (status) {
      case 'inactive':
        return 'Inactif';
      case 'active':
        return 'Actif';
      case 'banned':
        return 'Banni';
      default:
        return status || 'Inconnu';
    }
  }

  protected getModerationActionLabel(action: AdminUserModerationLog['action']): string {
    return action === 'ban' ? 'Bannissement' : 'Débannissement';
  }

  protected getModerationActor(log: AdminUserModerationLog): string {
    if (log.adminUsername)
      return log.adminUsername;

    return `#${log.adminId}`;
  }

  private getCurrentBanLog(user: AdminUser): AdminUserModerationLog | null {
    const banLogs = this.getModerationLogs(user).filter((log) => log.action === 'ban');

    if (banLogs.length === 0)
      return null;

    if (user.bannedAt) {
      const bannedAt = new Date(user.bannedAt).getTime();
      const matchingLog = banLogs.find((log) => new Date(log.createdAt).getTime() === bannedAt);

      if (matchingLog)
        return matchingLog;
    }

    return banLogs[0];
  }

  private loadUser(id: number, clearFeedback = true): void {
    this.isLoading.set(true);
    this.notFound.set(false);
    this.moderationErrorMessage.set('');

    if (clearFeedback) {
      this.errorMessage.set('');
      this.successMessage.set('');
    }

    this.adminUsersService.getUserById(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.titleService.setTitle(`${user.username} | Recipe Shelter`);
        this.isLoading.set(false);
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.user.set(null);
        this.isLoading.set(false);
        this.isSubmitting.set(false);

        if (error.status === 404) {
          this.notFound.set(true);
          return;
        }

        this.errorMessage.set('Impossible de charger cet utilisateur pour le moment.');
      },
    });
  }

  private getReasonValidationMessage(reason: string): string {
    if (!reason)
      return 'La raison est obligatoire.';

    if (reason.length < MODERATION_REASON_MIN_LENGTH)
      return `La raison doit contenir au moins ${MODERATION_REASON_MIN_LENGTH} caractères.`;

    if (reason.length > MODERATION_REASON_MAX_LENGTH)
      return `La raison doit contenir au maximum ${MODERATION_REASON_MAX_LENGTH} caractères.`;

    return '';
  }

  private getActionErrorMessage(mode: ModerationFormMode, error: HttpErrorResponse): string {
    if (mode === 'ban' && error.status === 403)
      return 'Impossible de bannir ce compte. Un administrateur ne peut pas bannir son propre compte.';

    return mode === 'ban' ? 'Impossible de bannir ce compte pour le moment.' : 'Impossible de débannir ce compte pour le moment.';
  }
}

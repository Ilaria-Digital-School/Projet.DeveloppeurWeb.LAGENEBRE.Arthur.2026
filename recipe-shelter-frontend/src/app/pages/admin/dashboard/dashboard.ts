import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';

type HealthStatus = 'OK' | 'Indisponible';

@Component({
  selector: 'rs-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly adminDashboardService = inject(AdminDashboardService);

  protected readonly healthStatus = signal<HealthStatus>('Indisponible');
  protected readonly databaseStatus = signal<HealthStatus>('Indisponible');
  protected readonly pendingRecipesCount = signal(0);
  protected readonly moderatedCommentsCount = signal(0);
  protected readonly softDeletedCommentsCount = signal(0);
  protected readonly bannedUsersCount = signal(0);
  protected readonly isPendingRecipesLoading = signal(true);
  protected readonly pendingRecipesError = signal('');
  protected readonly isModeratedCommentsLoading = signal(true);
  protected readonly moderatedCommentsError = signal('');
  protected readonly isSoftDeletedCommentsLoading = signal(true);
  protected readonly softDeletedCommentsError = signal('');
  protected readonly isBannedUsersLoading = signal(true);
  protected readonly bannedUsersError = signal('');

  ngOnInit(): void {
    this.loadHealth();
    this.loadPendingRecipesCount();
    this.loadModeratedCommentsCount();
    this.loadSoftDeletedCommentsCount();
    this.loadBannedUsersCount();
  }

  private loadHealth(): void {
    this.adminDashboardService.getHealth().subscribe({
      next: (health) => {
        this.healthStatus.set(health.ok ? 'OK' : 'Indisponible');
        this.databaseStatus.set(health.checks?.['db'] ? 'OK' : 'Indisponible');
      },
      error: () => {
        this.healthStatus.set('Indisponible');
        this.databaseStatus.set('Indisponible');
      }
    });
  }

  private loadPendingRecipesCount(): void {
    this.isPendingRecipesLoading.set(true);
    this.pendingRecipesError.set('');

    this.adminDashboardService.getCountPendingRecipes().subscribe({
      next: (count) => {
        this.pendingRecipesCount.set(count);
        this.isPendingRecipesLoading.set(false);
      },
      error: () => {
        this.pendingRecipesError.set('Impossible de charger les recettes en attente pour le moment.');
        this.isPendingRecipesLoading.set(false);
      }
    });
  }

  private loadModeratedCommentsCount(): void {
    this.isModeratedCommentsLoading.set(true);
    this.moderatedCommentsError.set('');

    this.adminDashboardService.getModeratedCommentsCount().subscribe({
      next: ({ moderatedComments }) => {
        this.moderatedCommentsCount.set(moderatedComments);
        this.isModeratedCommentsLoading.set(false);
      },
      error: () => {
        this.moderatedCommentsError.set('Impossible de charger les commentaires modérés pour le moment.');
        this.isModeratedCommentsLoading.set(false);
      }
    });
  }

  private loadSoftDeletedCommentsCount(): void {
    this.isSoftDeletedCommentsLoading.set(true);
    this.softDeletedCommentsError.set('');

    this.adminDashboardService.getSoftDeletedCommentsCount().subscribe({
      next: ({ softDeletedComments }) => {
        this.softDeletedCommentsCount.set(softDeletedComments);
        this.isSoftDeletedCommentsLoading.set(false);
      },
      error: () => {
        this.softDeletedCommentsError.set('Impossible de charger les commentaires supprimés pour le moment.');
        this.isSoftDeletedCommentsLoading.set(false);
      }
    });
  }

  private loadBannedUsersCount(): void {
    this.isBannedUsersLoading.set(true);
    this.bannedUsersError.set('');

    this.adminDashboardService.getBannedUsersCount().subscribe({
      next: ({ bannedUsers }) => {
        this.bannedUsersCount.set(bannedUsers);
        this.isBannedUsersLoading.set(false);
      },
      error: () => {
        this.bannedUsersError.set('Impossible de charger les utilisateurs suspendus pour le moment.');
        this.isBannedUsersLoading.set(false);
      }
    });
  }
}

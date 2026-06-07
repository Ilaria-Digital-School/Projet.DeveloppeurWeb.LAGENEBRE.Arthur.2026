import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminBannedUser } from '../../../../core/models/admin-user.model';
import { AdminUsersService } from '../../../../core/services/admin-users.service';

@Component({
  selector: 'rs-banned-users',
  imports: [DatePipe, RouterLink],
  templateUrl: './banned-users.html',
  styleUrl: './banned-users.css',
})
export class BannedUsers implements OnInit {
  private readonly adminUsersService = inject(AdminUsersService);

  protected readonly users = signal<AdminBannedUser[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadBannedUsers();
  }

  protected getAdminUsername(user: AdminBannedUser): string {
    return user.bannedByUsername ?? 'Non renseigné';
  }

  private loadBannedUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminUsersService.getBannedUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les utilisateurs suspendus pour le moment.');
        this.isLoading.set(false);
      }
    });
  }
}

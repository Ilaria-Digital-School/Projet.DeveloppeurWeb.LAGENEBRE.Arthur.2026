import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminBannedUser, AdminUser, AdminUserModerationPayload } from '../models/admin-user.model';

export interface BannedUsersCountResponse {
  bannedUsers: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminUsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getBannedUsers(): Observable<AdminBannedUser[]> {
    return this.http.get<AdminBannedUser[]>(`${this.baseUrl}/admin/users/banned`);
  }

  getUserById(userId: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/admin/users/${userId}`);
  }

  getBannedUsersCount(): Observable<number> {
    return this.http
      .get<BannedUsersCountResponse>(`${this.baseUrl}/admin/users/banned/count`)
      .pipe(map(({ bannedUsers }) => bannedUsers));
  }

  banUser(userId: number, reason: string): Observable<boolean> {
    const payload: AdminUserModerationPayload = { reason };

    return this.http
      .post<{ ok: boolean }>(`${this.baseUrl}/admin/users/${userId}/ban`, payload)
      .pipe(map(({ ok }) => ok));
  }

  unbanUser(userId: number, reason: string): Observable<boolean> {
    const payload: AdminUserModerationPayload = { reason };

    return this.http
      .post<{ ok: boolean }>(`${this.baseUrl}/admin/users/${userId}/unban`, payload)
      .pipe(map(({ ok }) => ok));
  }
}

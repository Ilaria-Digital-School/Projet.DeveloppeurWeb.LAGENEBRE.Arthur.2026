import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface HealthResponse {
  ok: boolean;
  checks?: Record<string, boolean>;
}

export interface PendingRecipesCountResponse {
  pendingRecipes: number;
}

export interface ModeratedCommentsCountResponse {
  moderatedComments: number;
}

export interface SoftDeletedCommentsCountResponse {
  softDeletedComments: number;
}

export interface BannedUsersCountResponse {
  bannedUsers: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }

  getCountPendingRecipes(): Observable<number> {
    return this.http
      .get<PendingRecipesCountResponse>(`${this.baseUrl}/admin/recipes/pending/count`)
      .pipe(map(({ pendingRecipes }) => pendingRecipes));
  }

  getModeratedCommentsCount(): Observable<ModeratedCommentsCountResponse> {
    return this.http.get<ModeratedCommentsCountResponse>(`${this.baseUrl}/admin/comments/moderated/count`);
  }

  getSoftDeletedCommentsCount(): Observable<SoftDeletedCommentsCountResponse> {
    return this.http.get<SoftDeletedCommentsCountResponse>(`${this.baseUrl}/admin/comments/soft-deleted/count`);
  }

  getBannedUsersCount(): Observable<BannedUsersCountResponse> {
    return this.http.get<BannedUsersCountResponse>(`${this.baseUrl}/admin/users/banned/count`);
  }
}

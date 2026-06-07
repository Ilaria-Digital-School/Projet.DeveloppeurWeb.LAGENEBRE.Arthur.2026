import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminComment } from '../models/admin-comment.model';

@Injectable({
  providedIn: 'root',
})
export class AdminCommentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getModerated(): Observable<AdminComment[]> {
    return this.http.get<AdminComment[]>(`${this.baseUrl}/admin/comments/moderated`);
  }

  getSoftDeleted(): Observable<AdminComment[]> {
    return this.http.get<AdminComment[]>(`${this.baseUrl}/admin/comments/soft-deleted`);
  }

  unmoderate(commentId: number): Observable<boolean> {
    return this.http
      .post<{ ok: boolean }>(`${this.baseUrl}/admin/comments/${commentId}/unmoderate`, {})
      .pipe(map(({ ok }) => ok));
  }

  restore(commentId: number): Observable<boolean> {
    return this.http
      .post<{ ok: boolean }>(`${this.baseUrl}/admin/comments/${commentId}/restore`, {})
      .pipe(map(({ ok }) => ok));
  }

  delete(commentId: number): Observable<boolean> {
    return this.http
      .delete<{ ok: boolean }>(`${this.baseUrl}/admin/comments/${commentId}`)
      .pipe(map(({ ok }) => ok));
  }
}

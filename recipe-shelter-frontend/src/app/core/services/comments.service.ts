import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface CreateCommentPayload {
    parentCommentId?: number | null;
    rating?: number | null;
    comment: string;
}

export interface UpdateCommentPayload {
    rating?: number | null;
    comment: string;
}

@Injectable({
    providedIn: 'root',
})
export class CommentsService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    create(recipeId: number, payload: CreateCommentPayload): Observable<unknown> {
        return this.http.post<unknown>(`${this.baseUrl}/recipes/${recipeId}/comments`, payload);
    }

    update(commentId: number, payload: UpdateCommentPayload): Observable<unknown> {
        return this.http.patch<unknown>(`${this.baseUrl}/comments/${commentId}`, payload);
    }

    delete(commentId: number): Observable<{ ok: boolean }> {
        return this.http.delete<{ ok: boolean }>(`${this.baseUrl}/comments/${commentId}`);
    }

    hide(commentId: number): Observable<unknown> {
        return this.http.post<unknown>(`${this.baseUrl}/admin/comments/${commentId}/hide`, {});
    }

    deleteAsAdmin(commentId: number): Observable<{ ok: boolean }> {
        return this.http.delete<{ ok: boolean }>(`${this.baseUrl}/admin/comments/${commentId}`);
    }
}

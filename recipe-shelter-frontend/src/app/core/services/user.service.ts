import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PRESERVE_SESSION_ON_UNAUTHORIZED } from '../interceptors/auth.context';
import type { PublicRecipeListItem } from '../models/recipe.model';

export interface UserMeResponse {
    id: number;
    mail: string;
    username: string;
    roleId: number;
    createdAt: string;
    updatedAt: string;
}

export interface PublicUserProfile {
    id: number;
    username: string;
    publishedRecipes: PublicRecipeListItem[];
}

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    me(): Observable<UserMeResponse> {
        return this.http.get<UserMeResponse>(`${this.baseUrl}/users/me`);
    }

    getPublicProfile(username: string): Observable<PublicUserProfile> {
        return this.http.get<PublicUserProfile>(`${this.baseUrl}/users/${encodeURIComponent(username)}`);
    }

    updateEmail(payload: { newEmail: string; currentPassword: string }): Observable<{ message: string }> {
        return this.http.patch<{ message: string }>(`${this.baseUrl}/users/me/email`, payload, { context: this.preserveSessionOnUnauthorizedContext() });
    }

    updatePassword(payload: { currentPassword: string; newPassword: string }): Observable<{ message: string }> {
        return this.http.patch<{ message: string }>(`${this.baseUrl}/users/me/password`, payload, { context: this.preserveSessionOnUnauthorizedContext() });
    }

    updateUsername(payload: { currentPassword: string; newUsername: string }): Observable<{ message: string }> {
        return this.http.patch<{ message: string }>(`${this.baseUrl}/users/me/username`, payload, { context: this.preserveSessionOnUnauthorizedContext() });
    }

    private preserveSessionOnUnauthorizedContext(): HttpContext {
        return new HttpContext().set(PRESERVE_SESSION_ON_UNAUTHORIZED, true);
    }
}

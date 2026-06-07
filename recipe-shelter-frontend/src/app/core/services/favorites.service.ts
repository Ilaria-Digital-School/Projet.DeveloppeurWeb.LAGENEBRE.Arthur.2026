import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Favorite } from '../models/favorite.model';
import type { PaginatedResponse, PaginationQuery } from '../models/pagination.model';
import type { PublicRecipeListItem } from '../models/recipe.model';

@Injectable({
    providedIn: 'root',
})
export class FavoritesService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    createFavorite(recipeId: number): Observable<Favorite> {
        return this.http.post<Favorite>(`${this.baseUrl}/favorites/` + recipeId, null);
    }

    deleteFavorite(recipeId: number): Observable<{ ok: boolean }> {
        return this.http.delete<{ ok: boolean }>(`${this.baseUrl}/favorites/` + recipeId);
    }

    getFavorites(params: PaginationQuery = {}): Observable<PaginatedResponse<PublicRecipeListItem>> {
        return this.http.get<PaginatedResponse<PublicRecipeListItem>>(`${this.baseUrl}/favorites/me`, { params: this.toPaginationQueryParams(params) });
    }

    getPublished(params: PaginationQuery = {}): Observable<PaginatedResponse<PublicRecipeListItem>> {
        return this.getFavorites(params);
    }

    private toPaginationQueryParams(params: PaginationQuery): Record<string, string> {
        const queryParams: Record<string, string> = {};

        if (params.page)
            queryParams['page'] = String(params.page);

        if (params.limit)
            queryParams['limit'] = String(params.limit);

        return queryParams;
    }
}

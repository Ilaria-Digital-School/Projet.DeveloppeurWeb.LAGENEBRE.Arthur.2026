import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RecipeInput } from '../../pages/recipes/recipe-form/recipe-form.types';
import { PaginatedResponse, PaginationQuery } from '../models/pagination.model';
import { PublicRecipeDetail, PublicRecipeListItem, Recipe, RecipeSummary } from '../models/recipe.model';

export interface RecipeSearchParams extends PaginationQuery {
    q?: string;
    categoryId?: number;
    tagIds?: number[];
    ingredientIds?: number[];
    maxTotalTimeMinutes?: number;
}

@Injectable({
    providedIn: 'root',
})
export class RecipesService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    getPublished(params: PaginationQuery = {}): Observable<PaginatedResponse<PublicRecipeListItem>> {
        return this.http.get<PaginatedResponse<PublicRecipeListItem>>(`${this.baseUrl}/recipes`, { params: this.toPaginationQueryParams(params) });
    }

    searchPublished(params: RecipeSearchParams = {}): Observable<PaginatedResponse<PublicRecipeListItem>> {
        const queryParams: Record<string, string> = this.toPaginationQueryParams(params);

        if (params.q)
            queryParams['q'] = params.q;

        if (params.categoryId)
            queryParams['categoryId'] = String(params.categoryId);

        if (params.tagIds?.length)
            queryParams['tagIds'] = params.tagIds.join(',');

        if (params.ingredientIds?.length)
            queryParams['ingredientIds'] = params.ingredientIds.join(',');

        if (params.maxTotalTimeMinutes)
            queryParams['maxTotalTimeMinutes'] = String(params.maxTotalTimeMinutes);

        return this.http.get<PaginatedResponse<PublicRecipeListItem>>(`${this.baseUrl}/recipes/search`, { params: queryParams });
    }

    getRecentPublished(limit = 12): Observable<PublicRecipeListItem[]> {
        return this.http.get<PublicRecipeListItem[]>(`${this.baseUrl}/recipes/recent`, { params: this.toFeedQueryParams(limit) });
    }

    getPublishedBySlug(slug: string): Observable<PublicRecipeDetail> {
        return this.http.get<PublicRecipeDetail>(`${this.baseUrl}/recipes/${slug}`);
    }

    getById(recipeId: number): Observable<Recipe> {
        return this.http.get<Recipe>(`${this.baseUrl}/recipes/me/${recipeId}`);
    }

    getMine(params: PaginationQuery = {}): Observable<PaginatedResponse<RecipeSummary>> {
        return this.http.get<PaginatedResponse<RecipeSummary>>(`${this.baseUrl}/recipes/me`, { params: this.toPaginationQueryParams(params) });
    }

    create(input: RecipeInput): Observable<Recipe> {
        return this.http.post<Recipe>(`${this.baseUrl}/recipes`, this.toRecipeBody(input));
    }

    update(input: RecipeInput): Observable<Recipe> {
        return this.http.patch<Recipe>(`${this.baseUrl}/recipes/me/${input.id}`, this.toRecipeBody(input));
    }

    publish(recipeId: number): Observable<Recipe> {
        return this.http.post<Recipe>(`${this.baseUrl}/recipes/me/${recipeId}/submit`, {});
    }

    archive(recipeId: number): Observable<boolean> {
        return this.http.post<{ ok: boolean }>(`${this.baseUrl}/recipes/me/${recipeId}/archive`, {}).pipe(map(({ ok }) => ok));
    }

    private toPaginationQueryParams(params: PaginationQuery): Record<string, string> {
        const queryParams: Record<string, string> = {};

        if (params.page)
            queryParams['page'] = String(params.page);

        if (params.limit)
            queryParams['limit'] = String(params.limit);

        return queryParams;
    }

    private toFeedQueryParams(limit: number): Record<string, string> {
        return { limit: String(limit) };
    }

    private toRecipeBody(input: RecipeInput): Omit<RecipeInput, 'id' | 'userId' | 'slug' | 'imageUrl' | 'tags'> {
        return {
            title: input.title,
            categoryId: input.categoryId,
            description: input.description,
            coverImageUrl: input.coverImageUrl,
            prepTimeMinutes: input.prepTimeMinutes,
            restTimeMinutes: input.restTimeMinutes,
            cookTimeMinutes: input.cookTimeMinutes,
            servings: input.servings,
            tagIds: input.tagIds,
            ingredients: input.ingredients,
            steps: input.steps,
            equipments: input.equipments,
        };
    }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminRecipe, RecipePending } from '../models/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class AdminRecipesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getPending(): Observable<RecipePending[]> {
    return this.http.get<RecipePending[]>(`${this.baseUrl}/admin/recipes/pending`);
  }

  getById(recipeId: number): Observable<AdminRecipe> {
    return this.http.get<AdminRecipe>(`${this.baseUrl}/admin/recipes/${recipeId}`);
  }

  approve(recipeId: number): Observable<boolean> {
    return this.http
      .post<{ ok: boolean }>(`${this.baseUrl}/admin/recipes/${recipeId}/approve`, {})
      .pipe(map(({ ok }) => ok));
  }

  reject(recipeId: number, rejectionReason: string): Observable<boolean> {
    return this.http
      .post<{ ok: boolean }>(`${this.baseUrl}/admin/recipes/${recipeId}/reject`, { rejectionReason })
      .pipe(map(({ ok }) => ok));
  }

  archive(recipeId: number): Observable<boolean> {
    return this.http
      .post<{ ok: boolean }>(`${this.baseUrl}/admin/recipes/${recipeId}/archive`, {})
      .pipe(map(({ ok }) => ok));
  }

  delete(recipeId: number): Observable<boolean> {
    return this.http
      .delete<{ ok: boolean }>(`${this.baseUrl}/admin/recipes/${recipeId}`)
      .pipe(map(({ ok }) => ok));
  }
}

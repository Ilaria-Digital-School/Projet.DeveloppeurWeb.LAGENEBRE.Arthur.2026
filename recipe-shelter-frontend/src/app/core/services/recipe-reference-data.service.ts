import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface RecipeReferenceOption {
  id: number;
  name: string;
}

export interface CategoryReferenceOption extends RecipeReferenceOption {
  iconName: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeReferenceDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getCategories(): Observable<CategoryReferenceOption[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/categories`)
      .pipe(map((response) => this.normalizeCategoryResponse(response)));
  }

  getIngredients(): Observable<RecipeReferenceOption[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/ingredients`)
      .pipe(map((response) => this.normalizeReferenceResponse(response)));
  }

  getEquipments(): Observable<RecipeReferenceOption[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/equipments`)
      .pipe(map((response) => this.normalizeReferenceResponse(response)));
  }

  getTags(): Observable<RecipeReferenceOption[]> {
    return this.http
      .get<unknown>(`${this.baseUrl}/tags`)
      .pipe(map((response) => this.normalizeReferenceResponse(response)));
  }

  private normalizeReferenceResponse(response: unknown): RecipeReferenceOption[] {
    const entries = this.extractEntries(response);

    return entries
      .map((entry) => this.toReferenceOption(entry))
      .filter((option): option is RecipeReferenceOption => option !== null)
      .sort((left, right) => left.name.localeCompare(right.name, 'fr'));
  }

  private normalizeCategoryResponse(response: unknown): CategoryReferenceOption[] {
    const entries = this.extractEntries(response);

    return entries
      .map((entry) => this.toCategoryReferenceOption(entry))
      .filter((option): option is CategoryReferenceOption => option !== null)
      .sort((left, right) => left.name.localeCompare(right.name, 'fr'));
  }

  private extractEntries(response: unknown): unknown[] {
    if (Array.isArray(response))
      return response;

    if (!this.isRecord(response))
      return [];

    for (const key of ['data', 'items', 'results', 'categories', 'ingredients', 'equipments', 'tags']) {
      const value = response[key];

      if (Array.isArray(value))
        return value;
    }

    return [];
  }

  private toReferenceOption(entry: unknown): RecipeReferenceOption | null {
    if (!this.isRecord(entry))
      return null;

    const id = this.toNumber(entry['id']);
    const name = this.toString(entry['name'] ?? entry['label'] ?? entry['title']);

    if (id === null || name === null)
      return null;

    return { id, name };
  }

  private toCategoryReferenceOption(entry: unknown): CategoryReferenceOption | null {
    if (!this.isRecord(entry))
      return null;

    const option = this.toReferenceOption(entry);

    if (option === null)
      return null;

    return { ...option, iconName: this.toString(entry['iconName']) ?? '' };
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value) && value > 0)
      return value;

    if (typeof value === 'string') {
      const parsedValue = Number(value.trim());

      return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
    }

    return null;
  }

  private toString(value: unknown): string | null {
    if (typeof value !== 'string')
      return null;

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}

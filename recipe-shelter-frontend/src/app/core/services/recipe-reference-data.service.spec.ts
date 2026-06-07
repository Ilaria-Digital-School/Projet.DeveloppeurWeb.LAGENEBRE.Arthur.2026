import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { RecipeReferenceDataService } from './recipe-reference-data.service';

describe('RecipeReferenceDataService', () => {
  it('should normalize, filter and sort reference responses', () => {
    TestBed.configureTestingModule({
      providers: [RecipeReferenceDataService, provideHttpClient(), provideHttpClientTesting()]
    });

    TestBed.inject(RecipeReferenceDataService).getIngredients().subscribe((ingredients) => {
      expect(ingredients).toEqual([
        { id: 2, name: 'Abricot' },
        { id: 1, name: 'Tomate' }
      ]);
    });

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/ingredients`);
    req.flush({ items: [{ id: '1', name: ' Tomate ' }, { id: 0, name: 'Invalid' }, { id: '2', label: 'Abricot' }] });
    TestBed.inject(HttpTestingController).verify();
  });
});

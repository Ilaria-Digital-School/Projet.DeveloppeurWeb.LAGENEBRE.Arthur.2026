import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { RecipesService } from './recipes.service';

describe('RecipesService', () => {
  it('should search published recipes with the expected query params', () => {
    TestBed.configureTestingModule({
      providers: [RecipesService, provideHttpClient(), provideHttpClientTesting()]
    });

    TestBed.inject(RecipesService).searchPublished({
      q: 'cake',
      categoryId: 3,
      tagIds: [1, 2],
      page: 2,
      limit: 12
    }).subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne((request) => request.url === `${environment.apiBaseUrl}/recipes/search`);
    expect(req.request.params.get('q')).toBe('cake');
    expect(req.request.params.get('categoryId')).toBe('3');
    expect(req.request.params.get('tagIds')).toBe('1,2');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ items: [], pagination: {} });
    TestBed.inject(HttpTestingController).verify();
  });
});

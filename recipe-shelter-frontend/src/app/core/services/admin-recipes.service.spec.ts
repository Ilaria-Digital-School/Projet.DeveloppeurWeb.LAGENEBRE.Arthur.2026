import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AdminRecipesService } from './admin-recipes.service';

describe('AdminRecipesService', () => {
  it('should reject a recipe with a moderation reason and map the response', () => {
    TestBed.configureTestingModule({
      providers: [AdminRecipesService, provideHttpClient(), provideHttpClientTesting()]
    });

    TestBed.inject(AdminRecipesService).reject(7, 'Missing details').subscribe((value) => expect(value).toBe(true));

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/admin/recipes/7/reject`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ rejectionReason: 'Missing details' });
    req.flush({ ok: true });
    TestBed.inject(HttpTestingController).verify();
  });
});

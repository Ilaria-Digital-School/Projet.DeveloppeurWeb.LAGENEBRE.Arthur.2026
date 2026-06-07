import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  it('should create a favorite for a recipe id', () => {
    TestBed.configureTestingModule({
      providers: [FavoritesService, provideHttpClient(), provideHttpClientTesting()]
    });

    TestBed.inject(FavoritesService).createFavorite(7).subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/favorites/7`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush({});
    TestBed.inject(HttpTestingController).verify();
  });
});

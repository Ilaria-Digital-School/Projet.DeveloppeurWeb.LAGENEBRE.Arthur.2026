import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('should post login credentials to the API', () => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()]
    });

    TestBed.inject(AuthService).login({ mail: 'jane@example.test', password: 'secret' }).subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ mail: 'jane@example.test', password: 'secret' });
    req.flush({ message: 'connected' });
    TestBed.inject(HttpTestingController).verify();
  });

  it('should post logout to the API', () => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()]
    });

    TestBed.inject(AuthService).logout().subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ message: 'disconnected' });
    TestBed.inject(HttpTestingController).verify();
  });
});

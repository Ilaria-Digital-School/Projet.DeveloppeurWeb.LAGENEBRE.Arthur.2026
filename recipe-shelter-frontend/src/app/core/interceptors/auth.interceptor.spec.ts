import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { authInterceptor } from './auth.interceptor';
import { PRESERVE_SESSION_ON_UNAUTHORIZED } from './auth.context';
import { SessionService } from '../services/session.service';

describe('authInterceptor', () => {
  let clearSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    clearSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: SessionService, useValue: { clear: clearSpy } }
      ]
    });
  });

  it('should send credentials for API requests without adding an Authorization header', () => {
    TestBed.inject(HttpClient).get('/api/private').subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne('/api/private');
    expect(req.request.withCredentials).toBe(false);
    expect(req.request.credentials).toBe('include');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    TestBed.inject(HttpTestingController).verify();
  });

  it('should clear the session on API 401 errors by default', () => {
    TestBed.inject(HttpClient).get('/api/private').subscribe({ error: () => undefined });

    const req = TestBed.inject(HttpTestingController).expectOne('/api/private');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(clearSpy).toHaveBeenCalledOnce();
    TestBed.inject(HttpTestingController).verify();
  });

  it('should preserve the session on API 401 errors when requested', () => {
    const context = new HttpContext().set(PRESERVE_SESSION_ON_UNAUTHORIZED, true);

    TestBed.inject(HttpClient).get('/api/private', { context }).subscribe({ error: () => undefined });

    const req = TestBed.inject(HttpTestingController).expectOne('/api/private');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(clearSpy).not.toHaveBeenCalled();
    TestBed.inject(HttpTestingController).verify();
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { PRESERVE_SESSION_ON_UNAUTHORIZED } from '../interceptors/auth.context';
import { UserService } from './user.service';

describe('UserService', () => {
  it('should encode public profile usernames in the API URL', () => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()]
    });

    TestBed.inject(UserService).getPublicProfile('alice bob').subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/users/alice%20bob`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, username: 'alice bob', publishedRecipes: [] });
    TestBed.inject(HttpTestingController).verify();
  });

  it('should preserve the session when profile credential updates return 401', () => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()]
    });

    const userService = TestBed.inject(UserService);
    const httpMock = TestBed.inject(HttpTestingController);

    userService.updateEmail({ newEmail: 'jane@example.com', currentPassword: 'password' }).subscribe();
    userService.updatePassword({ currentPassword: 'password', newPassword: 'new-password' }).subscribe();
    userService.updateUsername({ currentPassword: 'password', newUsername: 'Jane' }).subscribe();

    [
      httpMock.expectOne(`${environment.apiBaseUrl}/users/me/email`),
      httpMock.expectOne(`${environment.apiBaseUrl}/users/me/password`),
      httpMock.expectOne(`${environment.apiBaseUrl}/users/me/username`),
    ].forEach((req) => {
      expect(req.request.context.get(PRESERVE_SESSION_ON_UNAUTHORIZED)).toBe(true);
      req.flush({ message: 'ok' });
    });

    httpMock.verify();
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  it('should ban a user with a moderation reason', () => {
    TestBed.configureTestingModule({
      providers: [AdminUsersService, provideHttpClient(), provideHttpClientTesting()]
    });

    TestBed.inject(AdminUsersService).banUser(7, 'Spam').subscribe((value) => expect(value).toBe(true));

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/admin/users/7/ban`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ reason: 'Spam' });
    req.flush({ ok: true });
    TestBed.inject(HttpTestingController).verify();
  });
});

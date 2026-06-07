import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AdminCommentsService } from './admin-comments.service';

describe('AdminCommentsService', () => {
  it('should restore a soft-deleted comment and map the response', () => {
    TestBed.configureTestingModule({
      providers: [AdminCommentsService, provideHttpClient(), provideHttpClientTesting()]
    });

    TestBed.inject(AdminCommentsService).restore(12).subscribe((value) => expect(value).toBe(true));

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/admin/comments/12/restore`);
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
    TestBed.inject(HttpTestingController).verify();
  });
});

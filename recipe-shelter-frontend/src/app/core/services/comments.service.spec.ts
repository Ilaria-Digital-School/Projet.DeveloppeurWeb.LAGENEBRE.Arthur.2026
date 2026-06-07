import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  it('should create a comment on a recipe', () => {
    TestBed.configureTestingModule({
      providers: [CommentsService, provideHttpClient(), provideHttpClientTesting()]
    });
    const payload = { parentCommentId: null, rating: 5, comment: 'Top' };

    TestBed.inject(CommentsService).create(9, payload).subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/recipes/9/comments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
    TestBed.inject(HttpTestingController).verify();
  });
});

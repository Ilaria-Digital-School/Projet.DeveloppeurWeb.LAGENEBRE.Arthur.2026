import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  it('should post the contact message', () => {
    TestBed.configureTestingModule({
      providers: [ContactService, provideHttpClient(), provideHttpClientTesting()]
    });
    const service = TestBed.inject(ContactService);
    const httpTesting = TestBed.inject(HttpTestingController);
    const input = { name: 'Jane', email: 'jane@example.test', subject: 'Hello', message: 'Bonjour' };

    service.sendContactMessage(input).subscribe();

    const req = httpTesting.expectOne(`${environment.apiBaseUrl}/contact`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush(null);
    httpTesting.verify();
  });
});

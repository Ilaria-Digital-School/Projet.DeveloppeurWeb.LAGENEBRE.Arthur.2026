import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  it('should redirect authenticated users to home', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: { me: vi.fn() } },
        { provide: SessionService, useValue: { isAuthenticated: () => true } }
      ]
    });

    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    expect(TestBed.inject(Router).serializeUrl(result as never)).toBe('/');
  });
});

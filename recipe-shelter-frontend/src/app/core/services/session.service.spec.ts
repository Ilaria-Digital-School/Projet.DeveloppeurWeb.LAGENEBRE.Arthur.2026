import { TestBed } from '@angular/core/testing';

import { SessionService } from './session.service';

describe('SessionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should store the authenticated user in memory and clear the session', () => {
    const service = TestBed.inject(SessionService);

    service.setAuthUser({ userId: 42, username: 'alice', roleId: 1, status: 'active' });

    expect(service.user()).toEqual({ id: 42, username: 'alice', roleId: 1, status: 'active' });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);

    service.updateUser({ username: 'alice-updated' });

    expect(service.user()?.username).toBe('alice-updated');

    service.clear();

    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});

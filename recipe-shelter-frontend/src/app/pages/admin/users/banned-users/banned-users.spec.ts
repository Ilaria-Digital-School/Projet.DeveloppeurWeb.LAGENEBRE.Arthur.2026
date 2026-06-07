import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AdminUsersService } from '../../../../core/services/admin-users.service';
import { BannedUsers } from './banned-users';

describe('BannedUsers', () => {
  let fixture: ComponentFixture<BannedUsers>;
  let adminUsersService: Pick<AdminUsersService, 'getBannedUsers'>;

  beforeEach(async () => {
    adminUsersService = {
      getBannedUsers: vi.fn().mockReturnValue(of([
        {
          id: 7,
          username: 'alice',
          mail: 'alice@example.test',
          status: 'banned',
          bannedAt: new Date('2026-05-12T10:00:00.000Z'),
          bannedReason: 'Spam',
          bannedByUsername: 'admin'
        }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [BannedUsers],
      providers: [
        provideRouter([]),
        { provide: AdminUsersService, useValue: adminUsersService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BannedUsers);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should display banned users', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('alice');
    expect(text).toContain('alice@example.test');
    expect(text).toContain('Spam');
    expect(text).toContain('admin');
  });

  it('should link to the user detail page', () => {
    const link = fixture.nativeElement.querySelector('.rs-user-actions a') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe('/admin/users/7');
  });
});

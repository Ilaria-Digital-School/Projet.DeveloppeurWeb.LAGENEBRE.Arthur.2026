import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AdminUser } from '../../../../core/models/admin-user.model';
import { AdminUsersService } from '../../../../core/services/admin-users.service';
import { UserDetail } from './user-detail';

describe('UserDetail', () => {
  let adminUsersService: Pick<AdminUsersService, 'getUserById' | 'banUser' | 'unbanUser'>;

  interface UserDetailTestApi {
    updateModerationReason(reason: string): void;
  }

  const activeUser: AdminUser = {
    id: 7,
    username: 'alice',
    email: 'alice@example.test',
    status: 'active',
    createdAt: '2026-05-10T10:00:00.000Z',
    updatedAt: '2026-05-12T11:30:00.000Z',
    banReason: null,
    bannedAt: null,
    bannedByUserId: null,
    moderationLogs: [],
  };

  const bannedUser: AdminUser = {
    ...activeUser,
    status: 'banned',
    bannedAt: new Date('2025-01-10T10:00:00.000Z'),
    banReason: 'Spam de liens commerciaux répétés',
    bannedByUserId: 1,
    moderationLogs: [
      {
        id: 3,
        adminId: 1,
        adminUsername: 'Admin',
        action: 'ban',
        reason: 'Spam de liens commerciaux répétés',
        createdAt: '2025-01-10T10:00:00.000Z',
      },
      {
        id: 2,
        adminId: 1,
        adminUsername: 'Admin',
        action: 'unban',
        reason: 'Compte réactivé après engagement à respecter les règles de la communauté',
        createdAt: '2024-12-18T14:45:00.000Z',
      },
    ],
  };

  async function setup(user: AdminUser): Promise<ComponentFixture<UserDetail>> {
    TestBed.resetTestingModule();

    adminUsersService = {
      getUserById: vi.fn().mockReturnValue(of(user)),
      banUser: vi.fn().mockReturnValue(of(true)),
      unbanUser: vi.fn().mockReturnValue(of(true)),
    };

    await TestBed.configureTestingModule({
      imports: [UserDetail],
      providers: [
        provideRouter([]),
        { provide: AdminUsersService, useValue: adminUsersService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return fixture;
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display user information', async () => {
    const fixture = await setup(activeUser);
    const text = fixture.nativeElement.textContent as string;

    expect(adminUsersService.getUserById).toHaveBeenCalledWith(7);
    expect(text).toContain('alice');
    expect(text).toContain('alice@example.test');
    expect(text).toContain('Actif');
  });

  it('should display the current ban moderator from moderation logs', async () => {
    const fixture = await setup(bannedUser);
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Admin');
    expect(text).not.toContain('Admin (#1)');
  });

  it('should ban an active user with a trimmed reason', async () => {
    const fixture = await setup(activeUser);
    const banButton = fixture.nativeElement.querySelector('.rs-moderation-panel button') as HTMLButtonElement;

    banButton.click();
    fixture.detectChanges();

    (fixture.componentInstance as unknown as UserDetailTestApi).updateModerationReason('   Repeated abuse of rules   ');
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    expect(adminUsersService.banUser).toHaveBeenCalledWith(7, 'Repeated abuse of rules');
  });

  it('should require a reasonable moderation reason length', async () => {
    const fixture = await setup(activeUser);
    const banButton = fixture.nativeElement.querySelector('.rs-moderation-panel button') as HTMLButtonElement;

    banButton.click();
    fixture.detectChanges();

    (fixture.componentInstance as unknown as UserDetailTestApi).updateModerationReason('too short');
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);
    expect(adminUsersService.banUser).not.toHaveBeenCalled();
  });

  it('should unban a banned user with a trimmed reason', async () => {
    const fixture = await setup(bannedUser);
    const unbanButton = fixture.nativeElement.querySelector('.rs-moderation-panel button') as HTMLButtonElement;

    unbanButton.click();
    fixture.detectChanges();

    (fixture.componentInstance as unknown as UserDetailTestApi).updateModerationReason('   Appeal accepted after moderation review.   ');
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    expect(adminUsersService.unbanUser).toHaveBeenCalledWith(7, 'Appeal accepted after moderation review.');
  });
});

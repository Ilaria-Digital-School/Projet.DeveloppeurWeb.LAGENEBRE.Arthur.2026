import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { SessionService } from '../../core/services/session.service';
import { UserMeResponse, UserService } from '../../core/services/user.service';
import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let userService: Pick<UserService, 'me' | 'updateEmail' | 'updatePassword' | 'updateUsername'>;
  let sessionService: Pick<SessionService, 'clear' | 'updateUser'>;

  const user: UserMeResponse = {
    id: 1,
    mail: 'jane@example.com',
    username: 'Jane',
    roleId: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    userService = {
      me: () => of(user),
      updateEmail: () => of({ message: 'Adresse e-mail mise a jour.' }),
      updatePassword: () => of({ message: 'Mot de passe mis a jour.' }),
      updateUsername: () => of({ message: 'Nom mis a jour.' }),
    };
    sessionService = {
      clear: () => undefined,
      updateUser: () => undefined,
    };

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService },
        { provide: SessionService, useValue: sessionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sync the profile user with the session', () => {
    const updateUserSpy = vi.spyOn(sessionService, 'updateUser');

    component['loadProfile']();

    expect(updateUserSpy).toHaveBeenCalledWith({
      id: 1,
      username: 'Jane',
      roleId: 2,
    });
  });

  it('should update the username and reload the profile', () => {
    const meSpy = vi.spyOn(userService, 'me').mockReturnValue(of(user));
    const updateUsernameSpy = vi.spyOn(userService, 'updateUsername').mockReturnValue(of({ message: 'Username updated successfully.' }));
    const updateUserSpy = vi.spyOn(sessionService, 'updateUser');

    component['usernameForm'].setValue({
      newUsername: 'Jane Doe',
      currentPassword: 'current-password',
    });

    component['submitUsername']();

    expect(updateUsernameSpy).toHaveBeenCalledWith({
      newUsername: 'Jane Doe',
      currentPassword: 'current-password',
    });
    expect(component['isSubmittingUsername']()).toBe(false);
    expect(component['usernameSuccess']()).toBe('Votre nom a bien été mis à jour.');
    expect(component['usernameForm'].getRawValue()).toEqual({
      newUsername: '',
      currentPassword: '',
    });
    expect(meSpy).toHaveBeenCalledTimes(1);
    expect(updateUserSpy).toHaveBeenCalledWith({
      id: 1,
      username: 'Jane',
      roleId: 2,
    });
  });

  it('should display username errors on username update failure', () => {
    vi.spyOn(userService, 'updateUsername').mockReturnValue(
      throwError(() => ({ status: 400, error: { message: 'Nom indisponible.' } }))
    );

    component['usernameForm'].setValue({
      newUsername: 'Jane Doe',
      currentPassword: 'current-password',
    });

    component['submitUsername']();

    expect(component['isSubmittingUsername']()).toBe(false);
    expect(component['usernameError']()).toBe('Impossible de modifier votre nom.');
    expect(component['emailError']()).toBe('');
  });
});

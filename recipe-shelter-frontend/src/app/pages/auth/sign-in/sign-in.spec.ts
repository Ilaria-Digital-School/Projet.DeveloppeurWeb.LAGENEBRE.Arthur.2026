import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import type { AuthSuccessResponse } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { SignIn } from './sign-in';

describe('SignIn', () => {
  let component: SignIn;
  let fixture: ComponentFixture<SignIn>;
  let navigateByUrlSpy: ReturnType<typeof vi.spyOn>;

  const authResponse: AuthSuccessResponse = {
    user: {
      id: 42,
      mail: 'jane@example.com',
      username: 'jane',
      roleId: 2,
      status: 'active',
      createdAt: '2026-05-19T08:00:00.000Z',
      updatedAt: '2026-05-19T08:00:00.000Z'
    }
  };
  const meResponse = {
    auth: {
      userId: 42,
      username: 'jane',
      roleId: 2,
      status: 'active' as const
    }
  };

  const authServiceMock = {
    login: vi.fn(),
    me: vi.fn()
  };

  const sessionServiceMock = {
    setAuthUser: vi.fn()
  };

  const activatedRouteMock = {
    snapshot: {
      queryParamMap: convertToParamMap({})
    }
  };

  beforeEach(async () => {
    authServiceMock.login.mockReset();
    authServiceMock.login.mockReturnValue(of(authResponse));
    authServiceMock.me.mockReset();
    authServiceMock.me.mockReturnValue(of(meResponse));
    sessionServiceMock.setAuthUser.mockReset();
    activatedRouteMock.snapshot.queryParamMap = convertToParamMap({});

    await TestBed.configureTestingModule({
      imports: [SignIn],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignIn);
    component = fixture.componentInstance;
    navigateByUrlSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to the home page after login by default', () => {
    submitValidForm();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      mail: 'jane@example.com',
      password: 'super-secret'
    });
    expect(authServiceMock.me).toHaveBeenCalled();
    expect(sessionServiceMock.setAuthUser).toHaveBeenCalledWith(meResponse.auth);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/');
  });

  it('should redirect to the requested internal URL after login', () => {
    activatedRouteMock.snapshot.queryParamMap = convertToParamMap({ redirectTo: '/me/favorites' });

    submitValidForm();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/me/favorites');
  });

  it('should ignore unsafe redirect URLs after login', () => {
    activatedRouteMock.snapshot.queryParamMap = convertToParamMap({ redirectTo: 'https://example.com' });

    submitValidForm();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/');
  });

  it('should show a translated error when credentials are invalid', () => {
    authServiceMock.login.mockReturnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));

    submitValidForm();

    expect(component.apiError()).toBe('Email ou mot de passe incorrect.');
    expect(component.showResendValidationLink()).toBe(false);
  });

  function submitValidForm(): void {
    component.form.setValue({
      email: 'jane@example.com',
      password: 'super-secret'
    });

    component.onSubmit();
  }
});

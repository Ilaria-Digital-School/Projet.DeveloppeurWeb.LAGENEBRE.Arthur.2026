import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ResetPassword } from './reset-password';

describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;
  const authServiceMock = {
    resetPassword: vi.fn()
  };
  const activatedRouteMock = {
    snapshot: {
      queryParamMap: convertToParamMap({ token: 'reset-token' })
    }
  };

  beforeEach(async () => {
    authServiceMock.resetPassword.mockReset();
    authServiceMock.resetPassword.mockReturnValue(of({ message: 'Mot de passe mis a jour.' }));
    activatedRouteMock.snapshot.queryParamMap = convertToParamMap({ token: 'reset-token' });

    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the password and clear the form on success', () => {
    component.form.setValue({ password: 'Password1', confirmPassword: 'Password1' });

    component.onSubmit();

    expect(authServiceMock.resetPassword).toHaveBeenCalledWith('reset-token', 'Password1');
    expect(component.isSubmitting()).toBe(false);
    expect(component.apiSuccess()).toBe('Mot de passe mis a jour.');
    expect(component.form.getRawValue()).toEqual({ password: '', confirmPassword: '' });
  });
});

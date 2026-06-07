import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;
  const authServiceMock = {
    forgotPassword: vi.fn()
  };

  beforeEach(async () => {
    authServiceMock.forgotPassword.mockReset();
    authServiceMock.forgotPassword.mockReturnValue(of({ ok: true, message: 'ok' }));

    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request a reset link with a trimmed email and show success', () => {
    component.form.setValue({ email: 'jane@example.test' });

    component.onSubmit();

    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith('jane@example.test');
    expect(component.isSubmitting()).toBe(false);
    expect(component.apiSuccess()).toContain('lien');
    expect(component.apiError()).toBeNull();
  });
});

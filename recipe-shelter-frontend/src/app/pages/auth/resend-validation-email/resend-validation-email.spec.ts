import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ResendValidationEmail } from './resend-validation-email';

describe('ResendValidationEmail', () => {
  it('should resend the validation email with a valid address', async () => {
    const authServiceMock = {
      resendValidationEmail: vi.fn().mockReturnValue(of({ ok: true }))
    };
    await TestBed.configureTestingModule({
      imports: [ResendValidationEmail],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    const fixture: ComponentFixture<ResendValidationEmail> = TestBed.createComponent(ResendValidationEmail);
    const component = fixture.componentInstance as unknown as {
      form: { setValue(value: { email: string }): void };
      onSubmit(): void;
      apiSuccess(): string | null;
    };
    component.form.setValue({ email: 'jane@example.test' });

    component.onSubmit();

    expect(authServiceMock.resendValidationEmail).toHaveBeenCalledWith('jane@example.test');
    expect(component.apiSuccess()).toContain('validation');
  });
});

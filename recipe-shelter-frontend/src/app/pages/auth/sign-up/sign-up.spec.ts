import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { SignUp } from './sign-up';

describe('SignUp', () => {
  interface SignUpFormValue {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
  }

  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  const authServiceMock = {
    register: vi.fn()
  };

  beforeEach(async () => {
    authServiceMock.register.mockReset();
    authServiceMock.register.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUp);
    component = fixture.componentInstance;
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require accepting the legal terms before submitting', () => {
    fillValidForm({ termsAccepted: false });

    component.onSubmit();

    expect(component.termsAccepted.touched).toBe(true);
    expect(component.termsAccepted.hasError('required')).toBe(true);
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('should submit registration when the form and legal terms are valid', () => {
    fillValidForm();

    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalledWith({
      username: 'Jane Doe',
      mail: 'jane@example.com',
      password: 'Password1'
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/sign-in'], {
      queryParams: { accountCreated: 'validation-pending' }
    });
  });

  function fillValidForm(overrides: Partial<SignUpFormValue> = {}): void {
    const value: SignUpFormValue = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      termsAccepted: true,
      ...overrides
    };

    component.form.setValue(value);
  }
});

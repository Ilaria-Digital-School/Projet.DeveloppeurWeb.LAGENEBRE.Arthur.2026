import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { ValidateEmail } from './validate-email';

describe('ValidateEmail', () => {
  it('should validate the email token and show success', async () => {
    const authServiceMock = {
      validateEmail: vi.fn().mockReturnValue(of({ ok: true, message: 'Compte active.' }))
    };
    await TestBed.configureTestingModule({
      imports: [ValidateEmail],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ token: 'validation-token' }) } } }
      ]
    }).compileComponents();

    const fixture: ComponentFixture<ValidateEmail> = TestBed.createComponent(ValidateEmail);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authServiceMock.validateEmail).toHaveBeenCalledWith('validation-token');
    expect(fixture.nativeElement.textContent).toContain('Compte active.');
  });
});

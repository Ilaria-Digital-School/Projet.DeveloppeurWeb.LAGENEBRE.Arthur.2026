import { FormControl, FormGroup } from '@angular/forms';

import { passwordMatchValidator } from './password-match.validator';

describe('passwordMatchValidator', () => {
  it('should report mismatching passwords and accept matching ones', () => {
    const form = new FormGroup({
      password: new FormControl('Password1'),
      confirmPassword: new FormControl('Password2')
    });

    expect(passwordMatchValidator('password', 'confirmPassword')(form)).toEqual({ passwordMismatch: true });

    form.controls.confirmPassword.setValue('Password1');

    expect(passwordMatchValidator('password', 'confirmPassword')(form)).toBeNull();
  });
});

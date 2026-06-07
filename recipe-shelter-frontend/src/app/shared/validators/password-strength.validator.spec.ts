import { FormControl } from '@angular/forms';

import { passwordStrengthValidator } from './password-strength.validator';

describe('passwordStrengthValidator', () => {
  it('should reject weak passwords and accept a valid one', () => {
    const validator = passwordStrengthValidator();

    expect(validator(new FormControl('short'))).toEqual({ passwordStrength: true });
    expect(validator(new FormControl('password1'))).toEqual({ passwordStrength: true });
    expect(validator(new FormControl('Password1'))).toBeNull();
  });
});

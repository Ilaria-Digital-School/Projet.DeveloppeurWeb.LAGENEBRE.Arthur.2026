import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value as string;

        if (!value)
            return null;

        const hasMinLength = value.length >= 8;
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasDigit = /\d/.test(value);

        const isValid = hasMinLength && hasUppercase && hasLowercase && hasDigit;

        return isValid ? null : { passwordStrength: true };
    };
}
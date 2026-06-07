import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { getApiErrorMessage } from '../../../core/utils/auth-errors';
import { AuthShell } from '../../../shared/auth-shell/auth-shell';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';
import { passwordStrengthValidator } from '../../../shared/validators/password-strength.validator';

@Component({
  selector: 'rs-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthShell],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly apiError = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      name: this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required, passwordStrengthValidator()]),
      confirmPassword: this.fb.control('', [Validators.required]),
      termsAccepted: this.fb.control(false, [Validators.requiredTrue])
    },
    {
      validators: [passwordMatchValidator('password', 'confirmPassword')]
    }
  );

  get name() {
    return this.form.controls.name;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  get termsAccepted() {
    return this.form.controls.termsAccepted;
  }

  get passwordsDoNotMatch(): boolean {
    return this.form.hasError('passwordMismatch') && this.confirmPassword.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.apiError.set(null);

    const raw = this.form.getRawValue();

    this.authService.register({
      username: raw.name,
      mail: raw.email,
      password: raw.password,
    })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/sign-in'], { queryParams: { accountCreated: 'validation-pending' } });
        },
        error: (error) => {
          this.apiError.set(getApiErrorMessage(error) ?? `Une erreur est survenue lors de l'inscription.`);
        },
      });
  }
}

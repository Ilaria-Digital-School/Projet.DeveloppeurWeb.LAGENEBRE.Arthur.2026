import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthShell } from '../../../shared/auth-shell/auth-shell';
import { AuthService } from '../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';
import { passwordStrengthValidator } from '../../../shared/validators/password-strength.validator';

@Component({
  selector: 'rs-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthShell],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly isSubmitting = signal(false);
  readonly apiError = signal<string | null>(null);
  readonly apiSuccess = signal<string | null>(null);

  readonly token = signal(this.route.snapshot.queryParamMap.get('token') ?? '');

  readonly form = this.fb.group(
    {
      password: this.fb.control('', [Validators.required, passwordStrengthValidator()]),
      confirmPassword: this.fb.control('', [Validators.required])
    },
    {
      validators: [passwordMatchValidator('password', 'confirmPassword')]
    }
  );

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  onSubmit(): void {
    if (!this.token()) {
      this.apiError.set('Le lien est invalide.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.apiError.set(null);
    this.apiSuccess.set(null);

    const { password } = this.form.getRawValue();

    this.authService
      .resetPassword(this.token(), password)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          this.apiSuccess.set(
            res.message || 'Mot de passe réinitialisé avec succès.'
          );
          this.form.reset();
        },
        error: (err) => {
          this.apiError.set(
            err?.error?.message ||
            'Le lien est invalide ou expiré.'
          );
        },
      });
  }
}
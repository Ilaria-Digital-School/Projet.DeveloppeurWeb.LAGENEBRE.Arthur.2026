import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthShell } from '../../../shared/auth-shell/auth-shell';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'rs-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuthShell],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  readonly isSubmitting = signal(false);
  readonly apiError = signal<string | null>(null);
  readonly apiSuccess = signal<string | null>(null);

  readonly form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email])
  });

  get email() {
    return this.form.controls.email;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.apiError.set(null);
    this.apiSuccess.set(null);

    const { email } = this.form.getRawValue();

    this.authService
      .forgotPassword(email.trim())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.apiSuccess.set("Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.");
        },
        error: (err) => {
          this.apiError.set(err?.error?.message || "Impossible d'envoyer le lien de réinitialisation pour le moment.");
        },
      });
  }
}
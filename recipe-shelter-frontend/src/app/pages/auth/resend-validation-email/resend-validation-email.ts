import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { getApiErrorMessage } from '../../../core/utils/auth-errors';
import { AuthShell } from '../../../shared/auth-shell/auth-shell';

@Component({
  selector: 'rs-resend-validation-email',
  imports: [CommonModule, ReactiveFormsModule, AuthShell],
  templateUrl: './resend-validation-email.html',
  styleUrl: './resend-validation-email.css'
})
export class ResendValidationEmail {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly isSubmitting = signal(false);
  protected readonly apiError = signal<string | null>(null);
  protected readonly apiSuccess = signal<string | null>(null);

  protected readonly form = this.fb.group({ email: this.fb.control('', [Validators.required, Validators.email]) });

  protected get email() {
    return this.form.controls.email;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.apiError.set(null);
    this.apiSuccess.set(null);

    const { email } = this.form.getRawValue();

    this.authService
      .resendValidationEmail(email.trim())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.apiSuccess.set('Un nouvel email de validation a été envoyé.');
          this.form.reset();
        },
        error: (error) => {
          this.apiError.set(getApiErrorMessage(error) || `Impossible d'envoyer un nouveau lien pour le moment.`);
        },
      });
  }
}

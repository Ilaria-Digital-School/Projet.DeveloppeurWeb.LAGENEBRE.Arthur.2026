import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { getApiErrorCode, getApiErrorMessage, getAuthStatusMessage, isAuthStatusErrorCode } from '../../../core/utils/auth-errors';
import { AuthShell } from '../../../shared/auth-shell/auth-shell';

@Component({
  selector: 'rs-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthShell],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
export class SignIn implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly apiError = signal<string | null>(null);
  readonly apiSuccess = signal<string | null>(null);
  readonly showResendValidationLink = signal(false);

  readonly form = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required]),
  });

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  ngOnInit(): void {
    const accountCreated = this.route.snapshot.queryParamMap.get('accountCreated');
    const status = this.route.snapshot.queryParamMap.get('status');

    if (accountCreated === 'validation-pending')
      this.apiSuccess.set('Votre compte a été créé. Vérifiez votre boîte mail pour activer votre compte.');

    if (isAuthStatusErrorCode(status)) {
      this.apiError.set(getAuthStatusMessage(status));
      this.showResendValidationLink.set(status === 'EMAIL_NOT_VALIDATED');
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.apiError.set(null);
    this.apiSuccess.set(null);
    this.showResendValidationLink.set(false);

    const raw = this.form.getRawValue();

    this.authService.login({
      mail: raw.email,
      password: raw.password,
    })
      .pipe(
        switchMap(() => this.authService.me()),
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: ({ auth }) => {
          this.sessionService.setAuthUser(auth);
          this.router.navigateByUrl(this.getRedirectUrl());
        },
        error: (error) => {
          this.handleLoginError(error);
        }
      });
  }

  private handleLoginError(error: unknown): void {
    const code = getApiErrorCode(error);

    if (isAuthStatusErrorCode(code)) {
      this.apiError.set(getAuthStatusMessage(code));
      this.showResendValidationLink.set(code === 'EMAIL_NOT_VALIDATED');
      return;
    }

    this.apiError.set(getApiErrorMessage(error) ?? 'Une erreur est survenue lors de la connexion.');
  }

  private getRedirectUrl(): string {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo')?.trim();

    if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//') || redirectTo.startsWith('/\\'))
      return '/';

    return redirectTo;
  }
}

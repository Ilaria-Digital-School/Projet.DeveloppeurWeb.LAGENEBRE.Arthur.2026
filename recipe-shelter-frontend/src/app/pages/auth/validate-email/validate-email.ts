import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { getApiErrorCode, getApiErrorMessage } from '../../../core/utils/auth-errors';
import { AuthShell } from '../../../shared/auth-shell/auth-shell';

type ValidateEmailState = 'loading' | 'success' | 'error';

@Component({
  selector: 'rs-validate-email',
  imports: [CommonModule, RouterLink, AuthShell],
  templateUrl: './validate-email.html',
  styleUrl: './validate-email.css',
})
export class ValidateEmail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  protected readonly state = signal<ValidateEmailState>('loading');
  protected readonly message = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';

    if (!token) {
      this.state.set('error');
      this.message.set('Le lien de validation est invalide.');
      return;
    }

    this.authService
      .validateEmail(token)
      .pipe(finalize(() => {
        if (this.state() === 'loading')
          this.state.set('success');
      }))
      .subscribe({
        next: (response) => {
          this.state.set('success');
          this.message.set(response.message || 'Votre compte est activé.');
        },
        error: (error) => {
          this.state.set('error');
          this.message.set(this.getValidationErrorMessage(error));
        }
      });
  }

  private getValidationErrorMessage(error: unknown): string {
    const code = getApiErrorCode(error);

    if (code === 'EMAIL_VALIDATION_TOKEN_EXPIRED' || code === 'VALIDATION_TOKEN_EXPIRED' || code === 'TOKEN_EXPIRED')
      return 'Le lien de validation a expiré.';

    if (code === 'EMAIL_VALIDATION_TOKEN_USED' || code === 'VALIDATION_TOKEN_USED' || code === 'TOKEN_ALREADY_USED' || code === 'EMAIL_ALREADY_VALIDATED')
      return 'Ce lien de validation a déjà été utilisé.';

    return getApiErrorMessage(error) || 'Le lien de validation est invalide.';
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SessionService } from '../../core/services/session.service';
import { UserMeResponse, UserService } from '../../core/services/user.service';
import { passwordMatchValidator } from '../../shared/validators/password-match.validator';
import { passwordStrengthValidator } from '../../shared/validators/password-strength.validator';

@Component({
  selector: 'rs-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly userService = inject(UserService);

  protected readonly user = signal<UserMeResponse | null>(null);
  protected readonly loadError = signal('');

  protected readonly isLoadingProfile = signal(true);
  protected readonly isSubmittingEmail = signal(false);
  protected readonly isSubmittingPassword = signal(false);
  protected readonly isSubmittingUsername = signal(false);

  protected readonly emailSuccess = signal('');
  protected readonly emailError = signal('');
  protected readonly passwordSuccess = signal('');
  protected readonly passwordError = signal('');
  protected readonly usernameSuccess = signal('');
  protected readonly usernameError = signal('');

  protected readonly emailForm = this.fb.nonNullable.group({
    newEmail: ['', [Validators.required, Validators.email]],
    currentPassword: ['', [Validators.required]]
  });

  protected readonly usernameForm = this.fb.nonNullable.group({
    newUsername: ['', [Validators.required]],
    currentPassword: ['', [Validators.required]]
  });

  protected readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]]
    },
    {
      validators: [passwordMatchValidator('newPassword', 'confirmPassword')]
    }
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  protected get currentEmail(): string {
    return this.user()?.mail ?? '';
  }

  protected loadProfile(): void {
    this.loadError.set('');
    this.isLoadingProfile.set(true);

    this.userService.me().subscribe({
      next: (user) => {
        this.user.set(user);
        this.session.updateUser({ id: user.id, username: user.username, roleId: user.roleId });
        this.isLoadingProfile.set(false);
      },
      error: (err) => {
        this.isLoadingProfile.set(false);

        if (err?.status === 401) {
          this.session.clear();
          this.router.navigate(['/sign-in']);
          return;
        }

        this.loadError.set('Impossible de charger vos informations pour le moment.');
      }
    });
  }

  protected submitEmail(): void {
    this.emailSuccess.set('');
    this.emailError.set('');

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isSubmittingEmail.set(true);

    const payload = this.emailForm.getRawValue();

    this.userService.updateEmail(payload).subscribe({
      next: () => {
        this.isSubmittingEmail.set(false);
        this.emailSuccess.set('Votre adresse e-mail a bien été mise à jour.');
        this.emailForm.reset();

        this.loadProfile();
      },
      error: () => {
        this.isSubmittingEmail.set(false);

        this.emailError.set('Impossible de modifier votre adresse e-mail.');
      }
    });
  }

  protected submitPassword(): void {
    this.passwordSuccess.set('');
    this.passwordError.set('');

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSubmittingPassword.set(true);

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    this.userService.updatePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isSubmittingPassword.set(false);
        this.passwordSuccess.set('Votre mot de passe a bien été modifié.');
        this.passwordForm.reset();
      },
      error: () => {
        this.isSubmittingPassword.set(false);

        this.passwordError.set('Impossible de modifier votre mot de passe.');
      }
    });
  }

  protected submitUsername(): void {
    this.usernameSuccess.set('');
    this.usernameError.set('');

    if (this.usernameForm.invalid) {
      this.usernameForm.markAllAsTouched();
      return;
    }

    this.isSubmittingUsername.set(true);

    const payload = this.usernameForm.getRawValue();

    this.userService.updateUsername(payload).subscribe({
      next: () => {
        this.isSubmittingUsername.set(false);
        this.usernameSuccess.set('Votre nom a bien été mis à jour.');
        this.usernameForm.reset();

        this.loadProfile();
      },
      error: () => {
        this.isSubmittingUsername.set(false);

        this.usernameError.set('Impossible de modifier votre nom.');
      }
    });
  }

  protected hasEmailError(fieldName: 'newEmail' | 'currentPassword'): boolean {
    const field = this.emailForm.controls[fieldName];
    return field.invalid && (field.touched || field.dirty);
  }

  protected hasPasswordError(fieldName: 'currentPassword' | 'newPassword' | 'confirmPassword'): boolean {
    const field = this.passwordForm.controls[fieldName];
    return field.invalid && (field.touched || field.dirty);
  }

  protected hasUsernameError(fieldName: 'newUsername' | 'currentPassword'): boolean {
    const field = this.usernameForm.controls[fieldName];
    return field.invalid && (field.touched || field.dirty);
  }
}

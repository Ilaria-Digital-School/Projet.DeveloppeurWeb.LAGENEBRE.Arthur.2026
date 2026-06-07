import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import type { ContactMessageInput } from '../../core/models/contact.model';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'rs-contact',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly contactService = inject(ContactService);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
    email: this.fb.control('', [Validators.required, Validators.email, Validators.maxLength(255)]),
    subject: this.fb.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]),
    message: this.fb.control('', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]),
  });

  get name() {
    return this.form.controls.name;
  }

  get email() {
    return this.form.controls.email;
  }

  get subject() {
    return this.form.controls.subject;
  }

  get message() {
    return this.form.controls.message;
  }

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');
    this.trimFormValues();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.contactService
      .sendContactMessage(this.getPayload())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Votre message a bien été envoyé.');
          this.form.reset();
        },
        error: () => {
          this.errorMessage.set("Impossible d'envoyer le message pour le moment.");
        },
      });
  }

  private getPayload(): ContactMessageInput {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      email: value.email.trim(),
      subject: value.subject.trim(),
      message: value.message.trim(),
    };
  }

  private trimFormValues(): void {
    this.form.setValue(this.getPayload(), { emitEvent: false });
  }
}

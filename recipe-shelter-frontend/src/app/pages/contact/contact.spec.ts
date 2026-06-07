import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ContactService } from '../../core/services/contact.service';
import { Contact } from './contact';

describe('Contact', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;
  let contactService: Pick<ContactService, 'sendContactMessage'>;

  beforeEach(async () => {
    contactService = {
      sendContactMessage: () => of(void 0),
    };

    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: [
        { provide: ContactService, useValue: contactService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should block invalid submissions', () => {
    const sendSpy = vi.spyOn(contactService, 'sendContactMessage');

    component.onSubmit();

    expect(sendSpy).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('should send the expected contact payload and reset the form on success', () => {
    const sendSpy = vi.spyOn(contactService, 'sendContactMessage').mockReturnValue(of(void 0));

    component.form.setValue({
      name: ' Jane ',
      email: ' jane@example.com ',
      subject: ' Suggestion ',
      message: ' Une idee de recette ',
    });

    component.onSubmit();

    expect(sendSpy).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@example.com',
      subject: 'Suggestion',
      message: 'Une idee de recette',
    });
    expect(component.successMessage()).toBe('Votre message a bien été envoyé.');
    expect(component.errorMessage()).toBe('');
    expect(component.form.getRawValue()).toEqual({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  });

  it('should keep form values and show a generic error on failure', () => {
    vi.spyOn(contactService, 'sendContactMessage').mockReturnValue(throwError(() => new Error('fail')));

    component.form.setValue({
      name: 'Jane',
      email: 'jane@example.com',
      subject: 'Suggestion',
      message: 'Une idee de recette',
    });

    component.onSubmit();

    expect(component.successMessage()).toBe('');
    expect(component.errorMessage()).toBe("Impossible d'envoyer le message pour le moment.");
    expect(component.form.getRawValue()).toEqual({
      name: 'Jane',
      email: 'jane@example.com',
      subject: 'Suggestion',
      message: 'Une idee de recette',
    });
  });
});

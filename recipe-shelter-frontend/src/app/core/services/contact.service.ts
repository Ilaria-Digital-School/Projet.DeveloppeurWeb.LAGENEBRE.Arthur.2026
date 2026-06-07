import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ContactMessageInput } from '../models/contact.model';

@Injectable({
    providedIn: 'root',
})
export class ContactService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    sendContactMessage(input: ContactMessageInput): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/contact`, input);
    }
}

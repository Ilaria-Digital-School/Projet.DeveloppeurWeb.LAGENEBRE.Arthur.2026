import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EMPTY, catchError } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { SessionService } from './core/services/session.service';

@Component({
  selector: 'rs-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sessionService = inject(SessionService);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId))
      return;

    this.authService.me()
      .pipe(catchError(() => EMPTY))
      .subscribe(({ auth }) => this.sessionService.setAuthUser(auth));
  }

  logout(): void {
    this.sessionService.logout();
  }
}

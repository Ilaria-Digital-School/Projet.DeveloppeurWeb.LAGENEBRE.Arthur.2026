import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { EMPTY, catchError, finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'rs-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  readonly session = inject(SessionService);
  readonly isMenuOpen = signal(false);
  readonly isUserMenuOpen = signal(false);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    const menu = document.getElementById('user-dropdown');

    if (menu && target instanceof Node && !menu.contains(target)) {
      this.isUserMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeMenu();
  }

  toggleMenu(): void {
    this.isMenuOpen.update(isOpen => !isOpen);
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen.update(isOpen => !isOpen);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.isUserMenuOpen.set(false);
  }

  search(query: string): void {
    const q = query.trim();

    this.closeMenu();
    this.router.navigate(['/search'], { queryParams: q ? { q } : undefined });
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout()
      .pipe(
        catchError(() => EMPTY),
        finalize(() => {
          this.session.logout();
          this.router.navigateByUrl('/');
        })
      )
      .subscribe();
  }
}

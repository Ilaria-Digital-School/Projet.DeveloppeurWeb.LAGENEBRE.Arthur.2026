import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let router: Router;
  const authServiceMock = {
    logout: vi.fn()
  };
  const sessionServiceMock = {
    isAuthenticated: vi.fn(),
    isAdmin: vi.fn(),
    user: vi.fn(),
    logout: vi.fn()
  };

  beforeEach(async () => {
    authServiceMock.logout.mockReset();
    authServiceMock.logout.mockReturnValue(of({}));
    sessionServiceMock.isAuthenticated.mockReturnValue(false);
    sessionServiceMock.isAdmin.mockReturnValue(false);
    sessionServiceMock.user.mockReturnValue(null);
    sessionServiceMock.logout.mockReset();

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: SessionService, useValue: sessionServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the main menu when the toggler is clicked', () => {
    const button = fixture.nativeElement.querySelector('.navbar-toggler') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('#main-navbar') as HTMLElement;

    button.click();
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.classList.contains('show')).toBe(true);
  });

  it('should close the main menu', () => {
    component.isMenuOpen.set(true);

    component.closeMenu();

    expect(component.isMenuOpen()).toBe(false);
  });

  it('should submit the header search with the typed query', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const input = fixture.nativeElement.querySelector('#header-search-q') as HTMLInputElement;
    const form = fixture.nativeElement.querySelector('.rs-header-search') as HTMLFormElement;

    input.value = '  tarte citron  ';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));

    expect(navigateSpy).toHaveBeenCalledWith(['/search'], {
      queryParams: { q: 'tarte citron' }
    });
  });

  it('should go to search without q when the header search is empty', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.search('   ');

    expect(navigateSpy).toHaveBeenCalledWith(['/search'], {
      queryParams: undefined
    });
  });
});

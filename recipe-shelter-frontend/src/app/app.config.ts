import { ApplicationConfig, inject, Injectable, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, TitleStrategy, RouterStateSnapshot } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, Title, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { MetaService } from './core/services/meta.service';

@Injectable({ providedIn: 'root' })
export class PrefixTitleStrategy extends TitleStrategy {
  private readonly prefix = ' | Recipe Shelter';
  private readonly title = inject(Title);
  private readonly metaService = inject(MetaService);

  constructor() {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);

    this.title.setTitle(pageTitle ? `${pageTitle}${this.prefix}` : 'Recipe Shelter — Cook. Share. Discover.');
    this.metaService.setDescriptionForPage(pageTitle);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    { provide: TitleStrategy, useClass: PrefixTitleStrategy }
  ]
};
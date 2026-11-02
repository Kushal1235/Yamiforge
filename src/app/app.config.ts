import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { Auth } from './auth/auth';
import { AuthApi } from './auth/auth-api';
import { HttpAuthApi } from './auth/http-auth-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(),
    provideHttpClient(withFetch()),
    { provide: AuthApi, useClass: HttpAuthApi },
    // Guards run on the first navigation, so find out who is signed in before it starts.
    provideAppInitializer(() => inject(Auth).restore()),
  ]
};

import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core'; // Thêm importProvidersFrom
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LucideAngularModule, ChevronLeft } from 'lucide-angular';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(LucideAngularModule.pick({ ChevronLeft }))
  ],
};
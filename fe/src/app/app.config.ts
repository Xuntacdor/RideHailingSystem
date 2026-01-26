import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { authInterceptor, loggingInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  LucideAngularModule,
  ChevronLeft,
  CarTaxiFront,
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  Car,
  Users,
  FileText,
  Settings,
  LogOut,
  Search,
  Bell,
  DollarSign,
  TrendingUp,
  TrendingDown,
  XCircle,
  Gauge,
  Map,
  ChevronRight,
  Star,
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withInterceptors([authInterceptor, loggingInterceptor]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      })
    ),
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(
      LucideAngularModule.pick({
        ChevronLeft,
        CarTaxiFront,
        LayoutDashboard,
        CalendarCheck,
        CalendarClock,
        Car,
        Users,
        FileText,
        Settings,
        LogOut,
        Search,
        Bell,
        DollarSign,
        TrendingUp,
        TrendingDown,
        XCircle,
        Gauge,
        Map,
        ChevronRight,
        Star,
      })
    ),
  ],
};

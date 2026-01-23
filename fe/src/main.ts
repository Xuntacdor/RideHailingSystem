// Polyfills for Node.js globals in browser (required for sockjs and other Node.js modules)
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
  version: ''
};
(window as any).Buffer = (window as any).Buffer || undefined;

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

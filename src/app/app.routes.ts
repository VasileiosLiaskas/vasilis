import { Routes } from '@angular/router';
import {LogInComponent} from './log-in/log-in.component';
import {BusinessComponent} from './business/business.component';
import {authGuard} from './auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LogInComponent },
  { path: 'business', component: BusinessComponent,
    // canActivate: [authGuard]
  },
  // Optional: catch-all route
  { path: '**', redirectTo: 'login' }
];

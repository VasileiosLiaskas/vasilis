import { Routes } from '@angular/router';
import {LogInComponent} from './log-in/log-in.component';
import {BusinessComponent} from './business/business.component';
import {BusinessViewComponent} from './business-view.component';
import {authGuard} from './auth.guard';
import {InvoiceComponent} from './invoice/invoice.component';
import {StatsComponent} from './stats/stats.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LogInComponent },
  { path: 'business/:id/view', component: BusinessViewComponent, canActivate: [authGuard] },
  { path: 'business', component: BusinessComponent, canActivate: [authGuard] },
  { path: 'invoices', component: InvoiceComponent, canActivate: [authGuard] },
  { path: 'stats', component: StatsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];

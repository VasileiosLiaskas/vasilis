import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router,
              private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken');

    const cloned = token ? req.clone({setHeaders: {Authorization: `Bearer ${token}`}}) : req;

    return next.handle(cloned).pipe(
      catchError(error => {
        if (error.status === 401 && !this.authService.isAuthenticated()) {
          localStorage.removeItem('authToken');
          if (!this.router.url.startsWith('/login')) {
            this.router.navigate(['/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }

}

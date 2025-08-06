import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken');

    const cloned = token ? req.clone({setHeaders: {Authorization: `Bearer ${token}`}}) : req;

    return next.handle(cloned).pipe(
      catchError(error => {
        if (error.status === 401) {
          localStorage.removeItem('authToken');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

}

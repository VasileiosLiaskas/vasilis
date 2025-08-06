import { Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode';

interface CustomJwtPayload {
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      const decoded = jwtDecode<CustomJwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000); // seconds
      return (decoded.exp ?? 0) > currentTime;
    } catch {
      return false; // Token is invalid
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }
}

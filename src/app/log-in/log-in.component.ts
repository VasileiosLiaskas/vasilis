import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import { environment } from '../../environments/environment';



@Component({
  selector: 'app-log-in',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './log-in.component.html',
  standalone: true,
  styleUrl: './log-in.component.css'
})
export class LogInComponent{
  username: string ='';
  password: string ='';
  isLoading = false;
  errorMessage = '';

  private baseUrl = environment.apiUrl+'user';

  constructor(private http: HttpClient, private router: Router) {}
  onLogin() {
    this.errorMessage = '';
    this.isLoading = true;

    this.http.post<any>(`${this.baseUrl}/login`, {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (res && res.token) {
          localStorage.setItem('authToken', res.token);
          this.isLoading = false;
          this.router.navigate(['/business']);
        } else {
          this.isLoading = false;
          this.errorMessage = 'Login failed. Check your credentials and try again.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Login failed. Check your credentials and try again.';
      }
    });
  }
}

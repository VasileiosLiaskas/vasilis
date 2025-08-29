import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import { environment } from '../../environments/environment';



@Component({
  selector: 'app-log-in',
  imports: [
    FormsModule
  ],
  templateUrl: './log-in.component.html',
  standalone: true,
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  username: string ='';
  password: string ='';

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}
  onLogin() {
    this.http.post<any>(`${this.baseUrl}login`, {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('authToken', res.token);
        this.router.navigate(['/business']);
      },
      error: (err) => {
        alert('Login failed. Check your credentials.');
      }
    });
  }
}

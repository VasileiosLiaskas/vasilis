import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

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

  constructor(private http: HttpClient, private router: Router) {}
  onLogin() {
    this.http.post<any>('http://localhost:8080/api/auth/login', {
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

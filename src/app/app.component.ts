import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './header/header.component';
import {ToasterComponent} from './toaster/toaster.component';
import {NgIf, NgStyle} from '@angular/common';
import {AuthService} from './auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    ToasterComponent,
    NgStyle,
    NgIf
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit{
  activeTab: string = 'business';
  underlinePosition = '0%';
  constructor(private router: Router, private authService: AuthService) {}
  ngOnInit(): void {

  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  navigate(tab: string) {
    this.activeTab = tab;

    // move underline
    const tabPositions: { [key: string]: string } = {
      business: '0%',
      invoices: '33.33%',
      stats: '66.66%',
    };
    this.underlinePosition = tabPositions[tab] || '0%';

    // navigate to route
    this.router.navigate(['/' + tab]);
  }
}

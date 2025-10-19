import {Component, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {BusinessComponent} from './business/business.component';
import {HeaderComponent} from './header/header.component';
import {ToasterComponent} from './toaster/toaster.component';
import {NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    ToasterComponent,
    NgStyle
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit{
  activeTab: string = 'business';
  underlinePosition = '0%';
  constructor(private router: Router) {}
  ngOnInit(): void {

  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
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

import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './header/header.component';
import {ToasterComponent} from './toaster/toaster.component';
import {NgIf, NgStyle} from '@angular/common';
import {AuthService} from './auth.service';
import {filter} from 'rxjs/operators';

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

  private tabPositions: { [key: string]: string } = {
    business: '0%',
    invoices: '33.33%',
    stats: '66.66%',
  };

  constructor(private router: Router, private authService: AuthService) {}
  ngOnInit(): void {
    // Sync activeTab with the current route on every navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects || event.url;
        const segment = url.split('/')[1]?.split('?')[0]; // strip query params
        if (segment && this.tabPositions[segment] !== undefined) {
          this.activeTab = segment;
          this.underlinePosition = this.tabPositions[segment];
        }
      });
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  navigate(tab: string) {
    this.router.navigate(['/' + tab]);
  }
}

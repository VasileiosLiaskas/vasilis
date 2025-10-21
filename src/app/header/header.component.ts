import {Component, ElementRef, HostListener} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-header',
  imports: [
    NgIf
  ],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(private elementRef: ElementRef,
              private router: Router,
              private authService: AuthService) {}

  calendarView: boolean = false;
  showLogoMenu: boolean = false;

  openCalendar() {
    this.calendarView = !this.calendarView
  }

  closeCalendar() {
    this.calendarView = !this.calendarView
  }

  toggleLogoMenu() {
    this.showLogoMenu =!this.showLogoMenu;
  }

  menuAction(option1: string) {
    if (option1 === 'logout'){
      this.authService.logout();
      this.showLogoMenu=false;
      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showLogoMenu = false; // Close dropdown
    }
  }

  openInvoices() {
    this.router.navigate(['/invoices']);
  }

  openBusiness() {
    this.router.navigate(['/business']);
  }
}

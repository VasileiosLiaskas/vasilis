import {Component, ElementRef, HostListener} from '@angular/core';
import {NgIf} from '@angular/common';

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

  constructor(private elementRef: ElementRef) {}

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

  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showLogoMenu = false; // Close dropdown
    }
  }
}

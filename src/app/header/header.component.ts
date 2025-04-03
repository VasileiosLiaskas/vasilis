import { Component } from '@angular/core';
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
  calendarView: boolean = false;

  openCalendar() {
    this.calendarView = !this.calendarView
  }

  closeCalendar() {
    this.calendarView = !this.calendarView
  }
}

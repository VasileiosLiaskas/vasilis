import { Component } from '@angular/core';
import {ToasterService} from './toaster.service';
import {NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-toaster',
  imports: [
    NgForOf,
    NgClass
  ],
  templateUrl: './toaster.component.html',
  standalone: true,
  styleUrl: './toaster.component.css'
})
export class ToasterComponent {
  constructor(public toasterService: ToasterService) {}

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-times-circle';
      case 'info': return 'fas fa-info-circle';
      case 'warning': return 'fas fa-exclamation-circle';
      default: return '';
    }
  }
}

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
}

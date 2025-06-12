import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {BusinessComponent} from './business/business.component';
import {HeaderComponent} from './header/header.component';
import {ToasterComponent} from './toaster/toaster.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    ToasterComponent
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit{


  ngOnInit(): void {

  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

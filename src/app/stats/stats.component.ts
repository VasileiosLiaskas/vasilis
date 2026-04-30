import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {BusinessService} from '../business/business.service';
import {FormsModule} from '@angular/forms';



@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {


  constructor( private businessService: BusinessService,) {}

  async ngOnInit() {

  }



}

import {Component, OnInit} from '@angular/core';

import {TableModule} from 'primeng/table';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Business} from './business.model';
import {BusinessService} from './business.service';
import {CommonModule, NgForOf} from '@angular/common';
import {Ripple} from 'primeng/ripple';
import {InputText} from 'primeng/inputtext';

@Component({
  selector: 'app-business',
  imports: [
    FormsModule,
    TableModule,
    NgForOf,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './business.component.html',
  standalone: true,
  styleUrl: './business.component.css'
})
export class BusinessComponent implements OnInit{

  editingRow: number | null = null;
  originalRowData: Business | null = null;
  businessList: Business[] =[];
  showForm:boolean= false;
  businessForm!: FormGroup;
  constructor( private businessService: BusinessService) { }


  ngOnInit(): void {
    this.businessService.getBusinessList().subscribe( (responseData) => {
      this.businessList= responseData;
    })
    this.businessForm=this.businessService.initForm();

  }



  addBusiness() {
    this.showForm= !this.showForm;
  }

  submitBusiness() {

  }
}

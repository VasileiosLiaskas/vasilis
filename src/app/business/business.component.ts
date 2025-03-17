import {Component, OnInit} from '@angular/core';

import {TableModule} from 'primeng/table';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Business} from './business.model';
import {BusinessService} from './business.service';
import {CommonModule, NgForOf} from '@angular/common';
import {ToasterService} from '../toaster/toaster.service';

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

  businessList: Business[] =[];
  showForm:boolean= false;
  businessForm!: FormGroup;
  constructor(
    private businessService: BusinessService,
    private toasterService: ToasterService
  ) { }


  ngOnInit(): void {
    this.businessService.getBusinessList().subscribe( (responseData) => {
      this.businessList= responseData;
    })
    this.businessForm=this.businessService.initForm();

  }






  addBusiness() {
    this.showForm= !this.showForm;
    if (this.showForm) {
      this.businessForm = this.businessService.initForm();// Reinitialize the form with fresh values
      console.log(this.businessForm.value);
    }
  }

  submitBusiness() {
    let business= this.businessForm.value;
    this.businessService.save(business).subscribe({
      next: (responseData) => {
        this.toasterService.showMessage('Αποθηκεύτηκε επιτυχώς', 'success');

        // Clear the form
        this.businessForm.reset();

        // Hide the form (optional)
        this.showForm = false;
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('There was an error saving the business.', 'error');
      }
    });
  }
}

import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Invoice} from './invoice.model';

@Component({
  selector: 'app-invoice',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    NgIf,
    NgForOf
  ],
  templateUrl: './invoice.component.html',
  standalone: true,
  styleUrls: [
    '../business/business.component.css', // reuse Business styles
    './invoice.component.css'             // keep Invoice styles
  ],
})
export class InvoiceComponent {
  searchQuery: any;
  dateFrom: any;
  dateTo: any;
  showFilters: any;

  onSearch() {

  }

  openDatePicker(datePickerFrom: HTMLInputElement) {

  }

  setDateFrom($event: Event) {

  }

  setDateTo($event: Event) {

  }

  toggleFilters() {

  }

  addInvoice() {

  }

  protected readonly Math = Math;
  page: any;
  size: any;
  openRowId: any;
  invoiceList: Invoice[] =[];
  totalElements: any;

  deleteRow(invoice: any) {

  }

  editRow(invoice: any) {

  }

  toggleDropdown(event: MouseEvent, id:number) {
    event.stopPropagation();
    this.openRowId = this.openRowId === id ? null : id;
  }

  onPageChange(number: number) {
    
  }
}

import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

import {TableModule} from 'primeng/table';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Business} from './business.model';
import {BusinessService} from './business.service';
import {CommonModule, NgForOf} from '@angular/common';
import {ToasterService} from '../toaster/toaster.service';
import {query} from '@angular/animations';

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
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  protected readonly Math = Math;
  searchQuery: string = '';
  dateFrom: string = '';
  dateTo: string = '';
  totalIncome: number=0;
  isOpen: boolean=false;
  openRowId: number | null = null;
  filterPayout!: boolean ;
  filterFilesCompleted!: boolean;
  filterFilesDelivered!: boolean;
  showFilters = false;


  constructor(
    private businessService: BusinessService,
    private toasterService: ToasterService
  ) { }


  ngOnInit(): void {
    this.loadBusinessList(this.searchQuery);
    this.businessForm=this.businessService.initForm();


  }
  loadBusinessList(searchQuery: string | null) {

    this.businessService.getBusinessList(this.page,
      this.size,
      this.searchQuery,
      this.dateFrom,
      this.dateTo,
      this.filterFilesDelivered,
      this.filterFilesCompleted,
      this.filterPayout).subscribe(response => {
      this.businessList = response.content;  // The actual data
      this.totalElements = response.totalElements; // Total number of entries
      this.totalIncome = response.content.length > 0 ? response.content[0].totalIncome : 0;
    });
  }

  onPageChange(newPage: number) {
    if (newPage < 0 || newPage >= Math.ceil(this.totalElements / this.size)) {
      return;
    }
    this.page = newPage;
    this.loadBusinessList(this.searchQuery);
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
    business.date = this.convertToISODate(business.date);
    this.businessService.save(business).subscribe({
      next: (responseData) => {
        this.toasterService.showMessage('Αποθηκεύτηκε επιτυχώς', 'success');

        // Clear the form
        this.businessForm.reset();
        this.loadBusinessList(null);
        // Hide the form (optional)
        this.showForm = false;
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('There was an error saving the business.', 'error');
      }
    });
  }
  openDatePicker(datePicker: HTMLInputElement) {
    if (datePicker) {
      datePicker.showPicker(); // Open the date picker
    }
  }

  setDateFrom(event: any) {
    this.dateFrom = event.target.value;
    console.log(this.dateFrom);
    const query = this.searchQuery.trim() === '' ? null : this.searchQuery;
    this.loadBusinessList(query)// Updates the text input with the selected date
  }
  setDateTo(event: any) {
    this.dateTo = event.target.value; // Updates the text input with the selected date
    const query = this.searchQuery.trim() === '' ? null : this.searchQuery;
    this.loadBusinessList(query)// Updates the text input with the selected date
  }


  onSearch() {
    this.page = 0; // Reset to the first page when searching
    const query = this.searchQuery.trim() === '' ? null : this.searchQuery;
    this.loadBusinessList(query);
  }

  onCancel() {
    this.businessForm.reset();
    this.showForm=false;
  }

  convertBoolean(value: boolean): string {
    return value ? 'Ναι' : 'Όχι';
  }
  @HostListener('document:click')
  closeDropdown() {
    this.openRowId = null;
  }
  toggleDropdown(event: MouseEvent, rowId: number) {
    event.stopPropagation();
    this.openRowId = this.openRowId === rowId ? null : rowId;
  }

  editRow(business: Business) {
    this.showForm= !this.showForm;
    // Convert "DD-MM-YYYY" to "YYYY-MM-DD"
    const formattedDate = this.convertToISODate(business.date);

    this.businessForm.patchValue({
      ...business,
      date: formattedDate, // Ensure correct format for date picker
    });
  }

  deleteRow(row: any) {
    this.businessService.deleteRow(row.id).subscribe({
      next: () => {
        this.loadBusinessList(null); // Reload data
        this.toasterService.showMessage("Διαγράφηκε Επιτυχώς", "success");
      },
      error: (err) => {
        console.error("Error deleting row:", err);
        this.toasterService.showMessage("Αποτυχία διαγραφής", "error");
      }
    });
  }

  convertToISODate(dateInput: string | Date): string {
    if (!dateInput) return ''; // Handle null/undefined case

    if (dateInput instanceof Date) {
      // Convert Date object to string in YYYY-MM-DD format
      return dateInput.toISOString().split('T')[0];
    }

    // If input is a string like "18-03-2025", convert it
    const parts = dateInput.split('-');
    if (parts.length !== 3) return dateInput;

    const [day, month, year] = parts;
    return `${year}-${month}-${day}`; // Convert to "2025-03-18"
  }


  exportToExcel() {
    this.businessService.downloadExcel();
  }

  resetToggle(field: 'filterPayout' | 'filterFilesCompleted' | 'filterFilesDelivered') {
    this[field] = null as any; // Clear the toggle
    this.onSearch(); // Refresh list with updated filters
  }

  toggleFilters() {

    this.showFilters = !this.showFilters;
  }
}

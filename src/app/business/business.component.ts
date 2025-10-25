import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';

import {TableModule} from 'primeng/table';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Business} from './business.model';
import {BusinessService} from './business.service';
import {CommonModule, NgForOf} from '@angular/common';
import {ToasterService} from '../toaster/toaster.service';
import {query} from '@angular/animations';
import {BooleanColorDirective} from '../../boolean.color.directive';
import {InvoiceDialogComponent} from '../invoice-dialog/invoice-dialog.component';
import {GoogleCalendarService} from '../google-calendar.service';
import {gapi} from 'gapi-script';

@Component({
  selector: 'app-business',
  imports: [
    FormsModule,
    TableModule,
    NgForOf,
    CommonModule,
    ReactiveFormsModule,
    BooleanColorDirective,
    InvoiceDialogComponent
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
  private totalRecords!: number;
  selectedBusiness: Business | null = null;


  constructor(
    private businessService: BusinessService,
    private toasterService: ToasterService,
    private calendarService: GoogleCalendarService
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
      console.log(this.businessList,"η λίστα")
      this.totalElements = response.totalElements; // Total number of entries
      this.totalRecords= response.content.length > 0 ? response.content[0].totalRecords : 0;
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

  //
  async submitBusiness() {
    const business = this.businessForm.value;
    business.date = this.convertToISODate(business.date);
    business.dateTo = this.convertToISODate(business.dateTo);

    this.businessService.save(business).subscribe({
      next: async (savedBusiness:Business) => {
        this.toasterService.showMessage('Αποθηκεύτηκε επιτυχώς', 'success');
        console.log("to saved", savedBusiness);
        try {

          // Make sure the "end" date is +1 day so the event lasts through dateTo
          const startDate = new Date(this.convertToISODateGoogle(business.date));
          const endDate = new Date(this.convertToISODateGoogle(business.dateTo));

          endDate.setDate(endDate.getDate() + 1);

          const event = {
            summary: business.type,
            description: business.details + ' '+ business.who,
            start: { date: startDate.toISOString().split('T')[0] },
            end: { date: endDate.toISOString().split('T')[0] },
          };

          if (business.googleCalendarId) {
            console.log("yparxei to google calendar")
            try {
              console.log('Checking event before update:', business.googleCalendarId);
              const existing = await gapi.client.calendar.events.get({
                calendarId: 'primary',
                eventId: business.googleCalendarId,
              });
              console.log('Existing event found:', existing.result);
            } catch (err) {
              console.error('Event not found with this ID!', business.googleCalendarId, err);
            }

            // Use PATCH instead of UPDATE
            const updatedEvent = await this.calendarService.patchEvent(business.googleCalendarId, event);
            console.log('Google Calendar event updated:', updatedEvent);
          }
          else {
            const createdEvent = await this.calendarService.createEvent(event);
            console.log('Google Calendar new event created:', createdEvent);

            business.googleCalendarId = createdEvent.id;
            this.businessService.updateGoogleCalendarId(savedBusiness.id, createdEvent.id).subscribe();
          }
        } catch (err) {
          console.error('Error creating Google Calendar event:', err);
        }

        // Reset form and reload list
        this.businessForm.reset();
        this.loadBusinessList(null);
        this.showForm = false;
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('There was an error saving the business.', 'error');
      },
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
    const formattedDateTo = this.convertToISODate(business.dateTo);

    this.businessForm.patchValue({
      ...business,
      date: formattedDate,
      dateTo: formattedDateTo,
      googleCalendarId:business.googleCalendarId
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
    console.log("reset filter")
  }

  toggleFilters() {

    this.showFilters = !this.showFilters;
  }


  openInvoicesDialog(business: Business): void {
    this.selectedBusiness = business;
  }


  convertToISODateGoogle(dateInput: string | Date): string {
    if (!dateInput) return ''; // handle null

    if (dateInput instanceof Date) {
      return dateInput.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    const parts = dateInput.split('-'); // "19-10-2025"
    if (parts.length !== 3) return ''; // invalid format

    const [day, month, year] = parts;
    return `${year}-${month}-${day}`; // "2025-10-19" ✅ ISO-compatible
  }

  async deleteGoogleEvent(business: Business) {
    if (!business.googleCalendarId) {
      this.toasterService.showMessage('Δεν βρέθηκε αντίστοιχο event στο calendar', 'info');
      return;
    }

    try {
      await this.calendarService.deleteEvent(business.googleCalendarId);
      this.toasterService.showMessage('To Google Calendar event διαγράφηκε επιτυχώς', 'success');

      business.googleCalendarId = '';
      this.businessForm.patchValue({ googleCalendarId: '' });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      this.toasterService.showMessage('Το Google Calendar event δεν μπόρεσε να διαγραφεί', 'error');
    }
  }
}

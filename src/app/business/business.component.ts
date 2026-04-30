import {Component, ElementRef, HostListener, OnInit, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {TableModule} from 'primeng/table';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Business} from './business.model';
import {BusinessService} from './business.service';
import {CommonModule} from '@angular/common';
import {ToasterService} from '../toaster/toaster.service';
import {BooleanColorDirective} from '../../boolean.color.directive';
import {InvoiceDialogComponent} from '../invoice-dialog/invoice-dialog.component';
import {GoogleCalendarService} from '../google-calendar.service';
import {gapi} from 'gapi-script';
import {ButtonModule} from 'primeng/button';
import {ToolbarModule} from 'primeng/toolbar';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {DatePickerModule} from 'primeng/datepicker';
import {InputNumberModule} from 'primeng/inputnumber';
import {CheckboxModule} from 'primeng/checkbox';
import {Menu, MenuModule} from 'primeng/menu';
import {TagModule} from 'primeng/tag';
import {SelectButtonModule} from 'primeng/selectbutton';
import {TextareaModule} from 'primeng/textarea';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {FilterService, MenuItem} from 'primeng/api';

@Component({
  selector: 'app-business',
  imports: [
    FormsModule,
    TableModule,
    CommonModule,
    ReactiveFormsModule,
    BooleanColorDirective,
    InvoiceDialogComponent,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    InputTextModule,
    DatePickerModule,
    InputNumberModule,
    CheckboxModule,
    MenuModule,
    TagModule,
    SelectButtonModule,
    TextareaModule,
    IconFieldModule,
    InputIconModule
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
  searchValue: string = '';
  dateFromFilter: string = '';
  dateToFilter: string = '';
  activeMenuItems: MenuItem[] = [];
  @ViewChild('rowMenu') rowMenu!: Menu;
  selectedBusiness: Business | null = null;


  constructor(
    private businessService: BusinessService,
    private toasterService: ToasterService,
    private calendarService: GoogleCalendarService,
    private filterService: FilterService
  ) { }


  ngOnInit(): void {
    this.registerDateFilters();
    this.loadBusinessList();
    this.businessForm = this.businessService.initForm();
  }

  registerDateFilters() {
    // Parses "DD-MM-YYYY" string to a comparable Date
    const parseDate = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length <= 2) {
        return new Date(+parts[2], +parts[1] - 1, +parts[0]);
      }
      return new Date(dateStr);
    };

    // "dateAfter": show rows where the field date >= filter date
    this.filterService.register('dateAfter', (value: any, filter: any): boolean => {
      if (!filter) return true;
      const rowDate = parseDate(value);
      const filterDate = new Date(filter); // filter is "YYYY-MM-DD" from input[type=date]
      if (!rowDate) return false;
      return rowDate >= filterDate;
    });

    // "dateBefore": show rows where the field date <= filter date
    this.filterService.register('dateBefore', (value: any, filter: any): boolean => {
      if (!filter) return true;
      const rowDate = parseDate(value);
      const filterDate = new Date(filter);
      if (!rowDate) return false;
      return rowDate <= filterDate;
    });
  }

  loadBusinessList() {
    this.businessService.getBusinessList().subscribe(response => {
      this.businessList = response;
    });
  }

  addBusiness() {
    this.businessForm = this.businessService.initForm();
    this.showForm = true;
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
        // try {
        //
        //   // Make sure the "end" date is +1 day so the event lasts through dateTo
        //   const startDate = new Date(this.convertToISODateGoogle(business.date));
        //   const endDate = new Date(this.convertToISODateGoogle(business.dateTo));
        //
        //   endDate.setDate(endDate.getDate() + 1);
        //
        //   const event = {
        //     summary: business.type,
        //     description: business.details + ' '+ business.who,
        //     start: { date: startDate.toISOString().split('T')[0] },
        //     end: { date: endDate.toISOString().split('T')[0] },
        //   };

        //   if (business.googleCalendarId) {
        //     console.log("yparxei to google calendar")
        //     try {
        //       console.log('Checking event before update:', business.googleCalendarId);
        //       const existing = await gapi.client.calendar.events.get({
        //         calendarId: 'primary',
        //         eventId: business.googleCalendarId,
        //       });
        //       console.log('Existing event found:', existing.result);
        //     } catch (err) {
        //       console.error('Event not found with this ID!', business.googleCalendarId, err);
        //     }
        //
        //     // Use PATCH instead of UPDATE
        //     const updatedEvent = await this.calendarService.patchEvent(business.googleCalendarId, event);
        //     console.log('Google Calendar event updated:', updatedEvent);
        //   }
        //   else {
        //     const createdEvent = await this.calendarService.createEvent(event);
        //     console.log('Google Calendar new event created:', createdEvent);
        //
        //     business.googleCalendarId = createdEvent.id;
        //     this.businessService.updateGoogleCalendarId(savedBusiness.id, createdEvent.id).subscribe();
        //   }
        // } catch (err) {
        //   console.error('Error creating Google Calendar event:', err);
        // }

        // Reset form and reload list
        this.businessForm.reset();
        this.loadBusinessList();
        this.showForm = false;
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('There was an error saving the business.', 'error');
      },
    });
  }






  onCancel() {
    this.businessForm.reset();
    this.showForm=false;
  }

  convertBoolean(value: boolean): string {
    return value ? 'Ναι' : 'Όχι';
  }

  getFilteredTotal(field: string, table: any): number {
    const data = table.filteredValue || this.businessList;
    return data.reduce((sum: number, item: any) => sum + (Number(item[field]) || 0), 0);
  }

  clearFilters(table: any) {
    table.clear();
    this.searchValue = '';
    // Reset native date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input: any) => input.value = '');
  }

  convertDateForFilter(value: string): string {
    if (!value) return '';
    // Input type="date" gives "YYYY-MM-DD", convert to "DD-MM-YYYY" to match your data
    const [year, month, day] = value.split('-');
    return `${day}-${month}-${year}`;
  }

  openMenu(event: Event, business: Business) {
    this.activeMenuItems = [
      { label: 'Επεξεργασία', icon: 'pi pi-pencil', command: () => this.editRow(business) },
      { label: 'Διαγραφή', icon: 'pi pi-trash', command: () => this.deleteRow(business) }
    ];
   /* if (business.googleCalendarId) {
      this.activeMenuItems.push({ label: 'Διαγραφή Google Event', icon: 'pi pi-calendar-minus', command: () => this.deleteGoogleEvent(business) });
    }*/
    this.rowMenu.toggle(event);
  }

  editRow(business: Business) {
    this.showForm= !this.showForm;
    // Convert "DD-MM-YYYY" to "YYYY-MM-DD"
    const formattedDate = this.convertToISODate(business.date);
    const formattedDateTo = this.convertToISODate(business.dateTo);

    this.businessForm.patchValue({
      ...business,
      date: formattedDate,
      dateTo: formattedDateTo,/*
     */ googleCalendarId:business.googleCalendarId
    });
  }

  deleteRow(row: any) {
    this.businessService.deleteRow(row.id).subscribe({
      next: () => {
        this.loadBusinessList(); // Reload data
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

 /* async deleteGoogleEvent(business: Business) {
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
  }*/
}

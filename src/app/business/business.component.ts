import {Component, OnInit, ViewChild} from '@angular/core';
import {TableModule} from 'primeng/table';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Business} from './business.model';
import {BusinessService} from './business.service';
import {CommonModule} from '@angular/common';
import {ToasterService} from '../toaster/toaster.service';
import {BooleanColorDirective} from '../../boolean.color.directive';
import {InvoiceDialogComponent} from '../invoice-dialog/invoice-dialog.component';
import {GoogleCalendarService} from '../google-calendar.service';
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
import {DropdownModule} from 'primeng/dropdown';
import {FilterService, MenuItem} from 'primeng/api';
import {ActivatedRoute, Router} from '@angular/router';
import {Table} from 'primeng/table';
import * as XLSX from 'xlsx-js-style';
import {ParametricService} from '../parametric/parametric.service';
import {TooltipModule} from 'primeng/tooltip';

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
    InputIconModule,
    DropdownModule,
    TooltipModule
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
  size: number = 50;
  totalElements: number = 0;
  searchValue: string = '';
  dateFromFilter: Date | null = null;
  dateToFilter: Date | null = null;
  dateSearchFilter: string = '';
  activeMenuItems: MenuItem[] = [];
  @ViewChild('rowMenu') rowMenu!: Menu;
  @ViewChild('dt') dt!: Table;
  selectedBusiness: Business | null = null;
  highlightedBusinessId: number | null = null;
  workTypeOptions: { label: string; value: string }[] = [];
  whoOptions: { label: string; value: string }[] = [];
  areaOptions: { label: string; value: string }[] = [];
  detailsOptions: { label: string; value: string }[] = [];
  isLoadingDetails = false;
  isLoadingWorkTypes = false;
  isLoadingWho = false;
  isLoadingArea = false;
  private booleanClickCounts: Record<string, number> = {};
  // Add-parametric dialog state
  showAddParametricDialog: boolean = false;
  addParametricFieldType: string = '';
  newParametricValue: string = '';


  constructor(
    private businessService: BusinessService,
    private toasterService: ToasterService,
    private calendarService: GoogleCalendarService,
    private filterService: FilterService,
    private route: ActivatedRoute,
    private router: Router,
    private parametricService: ParametricService
  ) { }


  ngOnInit(): void {
    this.registerDateFilters();
    this.businessForm = this.businessService.initForm();
    this.loadWorkTypeOptions();
    this.loadWhoOptions();
    this.loadAreaOptions();
    this.loadDetailsOptions();

    this.route.queryParams.subscribe(params => {
      const highlightId = params['highlightBusinessId'];
      if (highlightId) {
        this.highlightedBusinessId = +highlightId;
      }
      this.loadBusinessList();
    });
  }

  setupAutomaticCalculation() {
    const feeControl = this.businessForm.get('fee');
    const advancePaymentControl = this.businessForm.get('advancePayment');
    const remainingMoneyControl = this.businessForm.get('remainingMoney');
    const payoutControl = this.businessForm.get('payout');

    if (feeControl && advancePaymentControl && remainingMoneyControl && payoutControl) {
      feeControl.valueChanges.subscribe(() => {
        const fee = feeControl.value || 0;
        const advancePayment = advancePaymentControl.value || 0;
        remainingMoneyControl.setValue(fee - advancePayment, { emitEvent: false });
      });

      advancePaymentControl.valueChanges.subscribe(() => {
        const fee = feeControl.value || 0;
        const advancePayment = advancePaymentControl.value || 0;
        remainingMoneyControl.setValue(fee - advancePayment, { emitEvent: false });
      });

      payoutControl.valueChanges.subscribe((isPaid: boolean) => {
        if (isPaid) {
          remainingMoneyControl.setValue(0, { emitEvent: false });
        }
      });
    }
  }

  registerDateFilters() {
    const parseDate = (value: string | Date): Date | null => {
      if (!value) return null;

      if (value instanceof Date) {
        const d = new Date(value);
        d.setHours(0, 0, 0, 0);
        return d;
      }

      const parts = value.split('-');
      let parsed: Date;

      if (parts.length === 3 && parts[0].length <= 2) {
        // DD-MM-YYYY
        parsed = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      } else {
        // YYYY-MM-DD (or any Date-parsable string)
        parsed = new Date(value);
      }

      if (isNaN(parsed.getTime())) return null;
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    };

    // "dateAfter": show rows where the field date >= filter date
    this.filterService.register('dateAfter', (value: any, filter: Date | string | null): boolean => {
      if (!filter) return true;
      const rowDate = parseDate(value);
      const filterDate = parseDate(filter as any);
      if (!rowDate) return false;
      if (!filterDate) return true;
      return rowDate >= filterDate;
    });

    // "dateBefore": show rows where the field date <= filter date
    this.filterService.register('dateBefore', (value: any, filter: Date | string | null): boolean => {
      if (!filter) return true;
      const rowDate = parseDate(value);
      const filterDate = parseDate(filter as any);
      if (!rowDate) return false;
      if (!filterDate) return true;
      return rowDate <= filterDate;
    });
  }

  loadBusinessList() {
    this.businessService.getBusinessList().subscribe(response => {
      this.booleanClickCounts = {};
      this.businessList = response.map((business: any) => ({
        ...business,
        dateSearch: this.formatDateAsYYMMDD(business.date),
        dateToSearch: this.formatDateAsYYMMDD(business.dateTo)
      }));

      if (this.highlightedBusinessId && this.dt) {
        // Find the index of the highlighted business
        const index = this.businessList.findIndex(b => b.id === this.highlightedBusinessId);
        if (index >= 0) {
          // Calculate the page the row is on and navigate to it
          const page = Math.floor(index / this.size);
          this.dt.first = page * this.size;

          // Scroll to the row after rendering
          setTimeout(() => {
            const row = document.querySelector(`tr[data-business-id="${this.highlightedBusinessId}"]`);
            if (row) {
              row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            // Clear highlight after 3 seconds
            setTimeout(() => {
              this.highlightedBusinessId = null;
            }, 3000);
          }, 100);
        }
      }
    });
  }

  addBusiness() {
    this.businessForm = this.businessService.initForm();
    this.setupAutomaticCalculation();
    this.showForm = true;
  }





  //
  async submitBusiness() {
    const business = this.businessForm.value;
    business.date = this.convertToISODate(business.date);
    business.dateTo = this.convertToISODate(business.dateTo);

    if (!business.dateTo) {
      business.dateTo = business.date;
    }

    this.businessService.save(business).subscribe({
      next: async (savedBusiness:Business) => {
        this.toasterService.showMessage('Αποθηκεύτηκε επιτυχώς', 'success');
        console.log("to saved", savedBusiness);

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

  onBooleanCellClick(business: any, field: 'payout' | 'filesCompleted' | 'filesDelivered') {
    const clickKey = `${business.id}-${field}`;
    const currentCount = (this.booleanClickCounts[clickKey] || 0) + 1;
    this.booleanClickCounts[clickKey] = currentCount;

    if (currentCount < 4) {
      return;
    }

    this.booleanClickCounts[clickKey] = 0;
    const newValue = !business[field];

    const payload: any = {
      ...business,
      [field]: newValue
    };

    if (field === 'payout' && newValue) {
      payload.remainingMoney = 0;
    }

    // Search helper fields are UI-only and should not be sent to API.
    delete payload.dateSearch;
    delete payload.dateToSearch;

    this.businessService.save(payload).subscribe({
      next: () => {
        business[field] = newValue;
        if (field === 'payout' && newValue) {
          business.remainingMoney = 0;
        }
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('Αποτυχία ενημέρωσης', 'error');
      }
    });
  }

  formatDateAsYYMMDD(dateInput: string | Date): string {
    if (!dateInput) return '';

    let year = '';
    let month = '';
    let day = '';

    if (dateInput instanceof Date) {
      year = String(dateInput.getFullYear());
      month = String(dateInput.getMonth() + 1).padStart(2, '0');
      day = String(dateInput.getDate()).padStart(2, '0');
    } else {
      const parts = dateInput.split('-');
      if (parts.length !== 3) return dateInput;

      // Supports both DD-MM-YYYY and YYYY-MM-DD values.
      if (parts[0].length === 4) {
        [year, month, day] = parts;
      } else {
        [day, month, year] = parts;
      }
    }

    if (!year || !month || !day) return '';
    return `${year.slice(-2)}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
  }

  getFilteredTotal(field: string, table: any): number {
    const data = table.filteredValue || this.businessList;
    return data.reduce((sum: number, item: any) => sum + (Number(item[field]) || 0), 0);
  }

  clearFilters(table: any) {
    table.clear();
    this.searchValue = '';
    this.dateFromFilter = null;
    this.dateToFilter = null;
    this.dateSearchFilter = '';
    this.loadBusinessList();
  }

  onDateSearchInput(event: Event, table: Table) {
    const value = (event.target as HTMLInputElement).value;
    table.filter(value, 'dateSearch', 'contains');
  }

  clearDateSearchFilter(table: Table) {
    this.dateSearchFilter = '';
    table.filter('', 'dateSearch', 'contains');
  }

  sortOrder: number = 1; // 1 for asc, -1 for desc

  onDateSort() {
    this.sortOrder = this.sortOrder * -1; // Toggle sort order

    const parseDate = (dateStr: any): Date => {
      if (!dateStr) return new Date(0);
      if (dateStr instanceof Date) return dateStr;

      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // Handles both DD-MM-YYYY and YYYY-MM-DD
        if (parts[0].length === 4) {
          return new Date(+parts[0], +parts[1] - 1, +parts[2]); // YYYY-MM-DD
        } else {
          return new Date(+parts[2], +parts[1] - 1, +parts[0]); // DD-MM-YYYY
        }
      }
      return new Date(0); // Invalid date format
    };

    this.businessList.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return (dateA.getTime() - dateB.getTime()) * this.sortOrder;
    });

    // This is important to trigger change detection if the reference hasn't changed.
    this.businessList = [...this.businessList];
  }

  openMenu(event: Event, business: Business) {
    this.activeMenuItems = [
      { label: 'Προβολή', icon: 'pi pi-eye', command: () => this.viewRow(business) },
      { label: 'Επεξεργασία', icon: 'pi pi-pencil', command: () => this.editRow(business) },
      { label: 'Διαγραφή', icon: 'pi pi-trash', command: () => this.deleteRow(business) }
    ];
   /* if (business.googleCalendarId) {
      this.activeMenuItems.push({ label: 'Διαγραφή Google Event', icon: 'pi pi-calendar-minus', command: () => this.deleteGoogleEvent(business) });
    }*/
    this.rowMenu.toggle(event);
  }

  viewRow(business: Business) {
    this.router.navigate([`/business/${business.id}/view`]);
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
    this.setupAutomaticCalculation();
    this.ensureCurrentDetailsOption(business.details);
    this.ensureCurrentOption('details', this.detailsOptions);
    this.ensureCurrentOption('who', this.whoOptions);
    this.ensureCurrentOption('area', this.areaOptions);
  }

  private loadWorkTypeOptions() {
    this.isLoadingWorkTypes = true;
    this.parametricService.getTextareaValues('work_type').subscribe({
      next: (data: string) => {
        this.workTypeOptions = this.parseParametricValues(data);
        this.isLoadingWorkTypes = false;
        this.ensureCurrentDetailsOption();
      },
      error: () => {
        this.workTypeOptions = [];
        this.isLoadingWorkTypes = false;
      }
    });
  }


  private loadWhoOptions() {
    this.isLoadingWho = true;
    this.parametricService.getTextareaValues('who').subscribe({
      next: (data: string) => {
        this.whoOptions = this.parseParametricValues(data);
        this.isLoadingWho = false;
        this.ensureCurrentOption('who', this.whoOptions);
      },
      error: () => {
        this.whoOptions = [];
        this.isLoadingWho = false;
      }
    });
  }

  private loadAreaOptions() {
    this.isLoadingArea = true;
    this.parametricService.getTextareaValues('area').subscribe({
      next: (data: string) => {
        this.areaOptions = this.parseParametricValues(data);
        this.isLoadingArea = false;
        this.ensureCurrentOption('area', this.areaOptions);
      },
      error: () => {
        this.areaOptions = [];
        this.isLoadingArea = false;
      }
    });
  }

  private loadDetailsOptions() {
    this.isLoadingDetails = true;
    this.parametricService.getTextareaValues('details').subscribe({
      next: (data: string) => {
        this.detailsOptions = this.parseParametricValues(data);
        this.isLoadingDetails = false;
        this.ensureCurrentOption('details', this.detailsOptions);
      },
      error: () => {
        this.detailsOptions = [];
        this.isLoadingDetails = false;
      }
    });
  }


  openAddParametricDialog(type: string) {
    this.addParametricFieldType = type; // e.g. 'from_who' or 'area'
    this.newParametricValue = '';
    this.showAddParametricDialog = true;
  }

  saveNewParametricValue() {
    const value = (this.newParametricValue || '').trim();
    if (!value) {
      this.toasterService.showMessage('Παρακαλώ εισάγετε μία τιμή', 'error');
      return;
    }

    const type = this.addParametricFieldType;
    // Load existing textarea values, append if missing, then replace
    this.parametricService.getTextareaValues(type).subscribe({
      next: (data: string) => {
        const lines = (data || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (!lines.includes(value)) {
          lines.unshift(value); // put new value on top
        }
        const updatedText = lines.join('\n');
        this.parametricService.replaceFromTextarea(type, updatedText).subscribe({
          next: () => {
            // Reload options for the specific type
            if (type === 'area') {
              this.loadAreaOptions();
              this.businessForm.patchValue({ area: value });
            } else if (type === 'details') {
              this.loadDetailsOptions();
              this.businessForm.patchValue({ details: value });
            } else if (type === 'work_type') {
              this.loadWorkTypeOptions();
              this.businessForm.patchValue({ type: value });
            } else if (type === 'who') {
              this.loadWhoOptions();
              this.businessForm.patchValue({ who: value });
            }

            this.toasterService.showMessage('Η τιμή προστέθηκε', 'success');
            this.showAddParametricDialog = false;
            this.newParametricValue = '';
          },
          error: (err) => {
            console.error(err);
            this.toasterService.showMessage('Σφάλμα κατά την αποθήκευση', 'error');
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.toasterService.showMessage('Σφάλμα κατά την φόρτωση τρεχουσών τιμών', 'error');
      }
    });
  }

  private ensureCurrentOption(field: string, options: { label: string; value: string }[]) {
    const currentValue = (this.businessForm?.get(field)?.value ?? '').trim();
    if (!currentValue) return;
    const exists = options.some(o => o.value === currentValue);
    if (!exists) {
      options.unshift({ label: currentValue, value: currentValue });
    }
  }

  private parseParametricValues(valuesText: string): { label: string; value: string }[] {
    const uniqueValues = new Set(
      (valuesText || '')
        .split(/\r?\n/)
        .map(value => value.trim())
        .filter(Boolean)
    );

    return Array.from(uniqueValues).map(value => ({ label: value, value }));
  }

  private ensureCurrentDetailsOption(details?: string) {
    const currentDetails = (details ?? this.businessForm?.get('type')?.value ?? '').trim();
    if (!currentDetails) {
      return;
    }

    const exists = this.workTypeOptions.some(option => option.value === currentDetails);
    if (!exists) {
      this.workTypeOptions = [{ label: currentDetails, value: currentDetails }, ...this.workTypeOptions];
    }
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


  exportToExcel() {
    const monthNames = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
      'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];

    // Group businesses by month (from date field DD-MM-YYYY)
    const grouped = new Map<string, Business[]>();

    this.businessList.forEach(b => {
      const dateStr = b.date as any;
      if (!dateStr) return;
      const parts = dateStr.split('-');
      let monthKey: string;
      if (parts.length === 3 && parts[0].length <= 2) {
        // DD-MM-YYYY
        monthKey = `${parts[2]}-${parts[1]}`;
      } else {
        // YYYY-MM-DD
        monthKey = `${parts[0]}-${parts[1]}`;
      }
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(b);
    });

    // Sort month keys
    const sortedKeys = Array.from(grouped.keys()).sort();

    const wb = XLSX.utils.book_new();

    // Create a sheet for each month
    sortedKeys.forEach(key => {
      const [year, month] = key.split('-');
      const sheetName = `${monthNames[+month - 1]} ${year}`;
      const businesses = grouped.get(key)!;

      const rows: any[] = businesses.map(b => ({
        'Ημερομηνία Από': b.date,
        'Ημερομηνία Έως': b.dateTo,
        'Τύπος': b.type,
        'Από Ποιον': b.fromWho || '',
        'Ποιος': b.who,
        'Περιοχή': b.area,
        'Λεπτομέρειες': b.details,
        'Έξοδα': b.costs || 0,
        'Αμοιβή': b.fee || 0,
        'Προκαταβολή': b.advancePayment || 0,
        'Υπόλοιπο': b.remainingMoney || 0,
        'Εξοφλήθηκε': b.payout ? 'Ναι' : 'Όχι',
        'Αρχεία': b.filesCompleted ? 'Ναι' : 'Όχι',
        'Παράδοση': b.filesDelivered ? 'Ναι' : 'Όχι',
        'Σχόλια': b.comments || ''
      }));

      // Add totals row
      const totalCosts = businesses.reduce((s, b) => s + (b.costs || 0), 0);
      const totalFee = businesses.reduce((s, b) => s + (b.fee || 0), 0);
      const totalAdvance = businesses.reduce((s, b) => s + (b.advancePayment || 0), 0);
      const totalRemaining = businesses.reduce((s, b) => s + (b.remainingMoney || 0), 0);

      rows.push({
        'Ημερομηνία Από': '',
        'Ημερομηνία Έως': '',
        'Τύπος': '',
        'Από Ποιον': '',
        'Ποιος': '',
        'Περιοχή': '',
        'Λεπτομέρειες': 'ΣΥΝΟΛΟ',
        'Έξοδα': totalCosts,
        'Αμοιβή': totalFee,
        'Προκαταβολή': totalAdvance,
        'Υπόλοιπο': totalRemaining,
        'Εξοφλήθηκε': '',
        'Αρχεία': '',
        'Παράδοση': '',
        'Σχόλια': ''
      });

      const ws = XLSX.utils.json_to_sheet(rows);

      // Bold header row and totals row
      this.applyBoldRows(ws, [0, rows.length]);

      // Set column widths
      ws['!cols'] = [
        {wch: 14}, {wch: 14}, {wch: 15}, {wch: 18}, {wch: 15},
        {wch: 25}, {wch: 10}, {wch: 10}, {wch: 14}, {wch: 12},
        {wch: 12}, {wch: 10}, {wch: 10}, {wch: 25}
      ];

      // Truncate sheet name to 31 chars (Excel limit)
      const safeName = sheetName.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, safeName);
    });

    // Add summary sheet
    const summaryRows = sortedKeys.map(key => {
      const [year, month] = key.split('-');
      const businesses = grouped.get(key)!;
      return {
        'Μήνας': `${monthNames[+month - 1]} ${year}`,
        'Εγγραφές': businesses.length,
        'Έξοδα': businesses.reduce((s, b) => s + (b.costs || 0), 0),
        'Αμοιβή': businesses.reduce((s, b) => s + (b.fee || 0), 0),
        'Προκαταβολή': businesses.reduce((s, b) => s + (b.advancePayment || 0), 0),
        'Υπόλοιπο': businesses.reduce((s, b) => s + (b.remainingMoney || 0), 0),
      };
    });

    // Grand totals
    summaryRows.push({
      'Μήνας': 'ΓΕΝΙΚΟ ΣΥΝΟΛΟ',
      'Εγγραφές': this.businessList.length,
      'Έξοδα': this.businessList.reduce((s, b) => s + (b.costs || 0), 0),
      'Αμοιβή': this.businessList.reduce((s, b) => s + (b.fee || 0), 0),
      'Προκαταβολή': this.businessList.reduce((s, b) => s + (b.advancePayment || 0), 0),
      'Υπόλοιπο': this.businessList.reduce((s, b) => s + (b.remainingMoney || 0), 0),
    });

    const summaryWs = XLSX.utils.json_to_sheet(summaryRows);

    // Bold header and grand total rows
    this.applyBoldRows(summaryWs, [0, summaryRows.length]);

    summaryWs['!cols'] = [{wch: 22}, {wch: 10}, {wch: 12}, {wch: 12}, {wch: 14}, {wch: 12}];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Σύνοψη');

    // Download
    const now = new Date();
    const fileName = `Δουλειές_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  private applyBoldRows(ws: XLSX.WorkSheet, rowIndices: number[]) {
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (const rowIdx of rowIndices) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({r: rowIdx, c: col});
        if (ws[cellAddr]) {
          ws[cellAddr].s = {font: {bold: true}};
        }
      }
    }
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



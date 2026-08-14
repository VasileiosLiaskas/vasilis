import {CommonModule} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {CheckboxModule} from 'primeng/checkbox';
import {DropdownModule} from 'primeng/dropdown';
import {Menu, MenuModule} from 'primeng/menu';
import {TooltipModule} from 'primeng/tooltip';
import {TextareaModule} from 'primeng/textarea';
import {MenuItem} from 'primeng/api';
import {Business} from '../business/business.model';
import {BusinessService} from '../business/business.service';
import {Invoice} from '../invoice/invoice.model';
import {InvoiceService} from '../invoice-dialog/invoice.service';
import {ToasterService} from '../toaster/toaster.service';
import {ParametricService} from '../parametric/parametric.service';
import {InvoiceTypePipe} from '../invoice-type.pipe';

@Component({
  selector: 'app-business-view',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    DropdownModule,
    MenuModule,
    TooltipModule,
    TextareaModule,
    InvoiceTypePipe
  ],
  templateUrl: './business-view.component.html',
  standalone: true,
  styleUrls: [
    '../business/business.component.css',
    '../invoice/invoice.component.css',
    './business-view.component.css'
  ]
})
export class BusinessViewComponent implements OnInit {
  @ViewChild('invoiceRowMenu') invoiceRowMenu!: Menu;
  @ViewChild('fileRowMenu') fileRowMenu!: Menu;

  businessId: number | null = null;
  business: Business | null = null;
  businessForm!: FormGroup;

  invoiceList: Invoice[] = [];
  fileList: Invoice[] = [];

  invoiceForm!: FormGroup;
  fileForm!: FormGroup;
  showInvoiceDialog = false;
  showFileDialog = false;
  selectedInvoice: Invoice | null = null;
  selectedFileRecord: Invoice | null = null;
  selectedInvoiceUpload: File | null = null;
  selectedFileUpload: File | null = null;
  invoiceMenuItems: MenuItem[] = [];
  fileMenuItems: MenuItem[] = [];

  workTypeOptions: { label: string; value: string }[] = [];
  whoOptions: { label: string; value: string }[] = [];
  areaOptions: { label: string; value: string }[] = [];
  detailsOptions: { label: string; value: string }[] = [];
  isLoadingDetails = false;
  isLoadingWorkTypes = false;
  isLoadingWho = false;
  isLoadingArea = false;

  private readonly fileAttachmentType = 'FILE_ATTACHMENT';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    private invoiceService: InvoiceService,
    private toasterService: ToasterService,
    private parametricService: ParametricService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.businessForm = this.businessService.initForm();
    this.initializeInvoiceForm();
    this.initializeFileForm();
    this.loadWorkTypeOptions();
    this.loadWhoOptions();
    this.loadAreaOptions();
    this.loadDetailsOptions();

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) {
        this.toasterService.showMessage('Δεν βρέθηκε η δουλειά', 'error');
        this.router.navigate(['/business']);
        return;
      }

      this.loadBusiness(id);
      this.loadInvoices(id);
    });
  }

  goBack(): void {
    this.router.navigate(['/business']);
  }

  saveBusiness(): void {
    const business = this.businessForm.value;
    business.date = this.convertToISODate(business.date);
    business.dateTo = this.convertToISODate(business.dateTo);

    if (!business.dateTo) {
      business.dateTo = business.date;
    }

    this.businessService.save(business).subscribe({
      next: (savedBusiness) => {
        this.business = savedBusiness;
        this.businessForm.patchValue({
          ...savedBusiness,
          date: this.convertToISODate(savedBusiness.date),
          dateTo: this.convertToISODate(savedBusiness.dateTo)
        });
        this.toasterService.showMessage('Η δουλειά αποθηκεύτηκε επιτυχώς', 'success');
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('Σφάλμα κατά την αποθήκευση της δουλειάς', 'error');
      }
    });
  }

  loadBusiness(id: number): void {
    this.businessService.getBusinessList().subscribe({
      next: (list) => {
        const found = list.find(item => item.id === id) || null;
        if (!found) {
          this.business = null;
          this.toasterService.showMessage('Η δουλειά δεν βρέθηκε', 'error');
          this.router.navigate(['/business']);
          return;
        }

        this.business = found;
        this.businessId = found.id;
        this.businessForm.patchValue({
          ...found,
          date: this.convertToISODate(found.date),
          dateTo: this.convertToISODate(found.dateTo),
          googleCalendarId: found.googleCalendarId
        });
        this.ensureCurrentDetailsOption(found.details);
        this.ensureCurrentOption('who', this.whoOptions);
        this.ensureCurrentOption('area', this.areaOptions);
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('Σφάλμα κατά τη φόρτωση της δουλειάς', 'error');
      }
    });
  }

  loadInvoices(id: number): void {
    this.invoiceService.getInvoicesByBusinessId(id).subscribe({
      next: (records) => {
        this.invoiceList = records.filter(item => item.invoiceType !== this.fileAttachmentType);
        this.fileList = records.filter(item => item.invoiceType === this.fileAttachmentType);
      },
      error: (error) => {
        console.error(error);
        this.invoiceList = [];
        this.fileList = [];
        this.toasterService.showMessage('Σφάλμα κατά τη φόρτωση των εγγραφών', 'error');
      }
    });
  }


  addInvoice(): void {
    this.selectedInvoice = null;
    this.selectedInvoiceUpload = null;
    this.initializeInvoiceForm();
    this.showInvoiceDialog = true;
  }

  editInvoice(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.selectedInvoiceUpload = null;
    this.invoiceForm.patchValue({
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: this.convertBackendDateToInput(invoice.invoiceDate),
      fileName: invoice.fileName,
      description: invoice.description,
      invoiceType: invoice.invoiceType || 'FEE_INVOICE'
    });
    this.showInvoiceDialog = true;
  }

  submitInvoice(): void {
    if (!this.invoiceForm.valid) {
      Object.keys(this.invoiceForm.controls).forEach(key => this.invoiceForm.get(key)?.markAsTouched());
      this.toasterService.showMessage('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία', 'warning');
      return;
    }

    const rawDate = this.invoiceForm.get('invoiceDate')?.value || '';
    const formattedDate = this.convertToBackendDate(rawDate);

    if (this.selectedInvoice && this.selectedInvoice.id) {
      this.invoiceService.updateInvoice({
        id: this.selectedInvoice.id,
        fileName: this.invoiceForm.get('fileName')?.value || '',
        invoiceNumber: this.invoiceForm.get('invoiceNumber')?.value || '',
        description: this.invoiceForm.get('description')?.value || '',
        invoiceDate: formattedDate,
        invoiceType: this.invoiceForm.get('invoiceType')?.value || 'FEE_INVOICE'
      }).subscribe({
        next: () => {
          this.toasterService.showMessage('Το τιμολόγιο ενημερώθηκε επιτυχώς', 'success');
          this.closeInvoiceDialog();
          this.reloadRecords();
        },
        error: (error) => {
          console.error(error);
          this.toasterService.showMessage('Σφάλμα κατά την ενημέρωση του τιμολογίου', 'error');
        }
      });
      return;
    }

    if (!this.selectedInvoiceUpload) {
      this.toasterService.showMessage('Επιλέξτε αρχείο', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedInvoiceUpload);
    formData.append('invoiceNumber', this.invoiceForm.get('invoiceNumber')?.value || '');
    formData.append('invoiceDate', formattedDate);
    formData.append('fileName', this.invoiceForm.get('fileName')?.value || '');
    formData.append('description', this.invoiceForm.get('description')?.value || '');
    formData.append('invoiceType', this.invoiceForm.get('invoiceType')?.value || 'FEE_INVOICE');
    formData.append('businessId', String(this.businessId ?? this.business?.id ?? ''));

    this.invoiceService.createInvoice(formData).subscribe({
      next: () => {
        this.toasterService.showMessage('Το τιμολόγιο δημιουργήθηκε επιτυχώς', 'success');
        this.closeInvoiceDialog();
        this.reloadRecords();
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('Σφάλμα κατά τη δημιουργία του τιμολογίου', 'error');
      }
    });
  }

  deleteInvoice(invoice: Invoice): void {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το τιμολόγιο;')) {
      return;
    }

    this.invoiceService.deleteInvoice(invoice).subscribe({
      next: () => {
        this.toasterService.showMessage('Διαγράφηκε επιτυχώς', 'success');
        this.reloadRecords();
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('Σφάλμα κατά τη διαγραφή', 'error');
      }
    });
  }

  downloadInvoice(invoice: Invoice): void {
    if (!invoice.id) return;

    this.invoiceService.downloadInvoice(invoice.id).subscribe({
      next: (blob: Blob) => this.downloadBlob(blob, invoice.fileName || `invoice_${invoice.invoiceNumber || invoice.id}.pdf`),
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('Σφάλμα κατά τη λήψη', 'error');
      }
    });
  }

  onInvoiceFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.toasterService.showMessage('Το αρχείο είναι πολύ μεγάλο (max 10MB)', 'error');
      return;
    }

    this.selectedInvoiceUpload = file;
    this.invoiceForm.patchValue({ fileName: file.name });
  }

  triggerInvoiceFileInput(): void {
    const fileInput = document.querySelector('#invoiceViewFileInput') as HTMLInputElement;
    fileInput?.click();
  }

  removeInvoiceFile(): void {
    this.selectedInvoiceUpload = null;
    this.invoiceForm.patchValue({ fileName: '' });
  }

  closeInvoiceDialog(): void {
    this.showInvoiceDialog = false;
    this.selectedInvoice = null;
    this.selectedInvoiceUpload = null;
    this.initializeInvoiceForm();
  }

  openInvoiceMenu(event: MouseEvent, invoice: Invoice): void {
    this.invoiceMenuItems = [
      { label: 'Επεξεργασία', icon: 'pi pi-pencil', command: () => this.editInvoice(invoice) },
      { label: 'Διαγραφή', icon: 'pi pi-trash', command: () => this.deleteInvoice(invoice) }
    ];

    this.invoiceRowMenu?.toggle(event);
  }

  addFile(): void {
    this.selectedFileRecord = null;
    this.selectedFileUpload = null;
    this.initializeFileForm();
    this.showFileDialog = true;
  }

  editFile(fileRecord: Invoice): void {
    this.selectedFileRecord = fileRecord;
    this.selectedFileUpload = null;
    this.fileForm.patchValue({
      fileName: fileRecord.fileName,
      description: fileRecord.description
    });
    this.showFileDialog = true;
  }

  submitFile(): void {
    if (!this.fileForm.valid) {
      Object.keys(this.fileForm.controls).forEach(key => this.fileForm.get(key)?.markAsTouched());
      this.toasterService.showMessage('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία', 'warning');
      return;
    }

    if (this.selectedFileRecord && this.selectedFileRecord.id) {
      this.invoiceService.updateInvoice({
        id: this.selectedFileRecord.id,
        fileName: this.fileForm.get('fileName')?.value || '',
        invoiceNumber: '',
        description: this.fileForm.get('description')?.value || '',
        invoiceDate: '',
        invoiceType: this.fileAttachmentType
      }).subscribe({
        next: () => {
          this.toasterService.showMessage('Το αρχείο ενημερώθηκε επιτυχώς', 'success');
          this.closeFileDialog();
          this.reloadRecords();
        },
        error: (error) => {
          console.error(error);
          this.toasterService.showMessage('Σφάλμα κατά την ενημέρωση του αρχείου', 'error');
        }
      });
      return;
    }

    if (!this.selectedFileUpload) {
      this.toasterService.showMessage('Επιλέξτε αρχείο', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFileUpload);
    formData.append('invoiceNumber', '');
    formData.append('invoiceDate', '');
    formData.append('fileName', this.fileForm.get('fileName')?.value || '');
    formData.append('description', this.fileForm.get('description')?.value || '');
    formData.append('invoiceType', this.fileAttachmentType);
    formData.append('businessId', String(this.businessId ?? this.business?.id ?? ''));

    this.invoiceService.createInvoice(formData).subscribe({
      next: () => {
        this.toasterService.showMessage('Το αρχείο δημιουργήθηκε επιτυχώς', 'success');
        this.closeFileDialog();
        this.reloadRecords();
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('Σφάλμα κατά τη δημιουργία του αρχείου', 'error');
      }
    });
  }

  deleteFile(fileRecord: Invoice): void {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το αρχείο;')) {
      return;
    }

    this.invoiceService.deleteInvoice(fileRecord).subscribe({
      next: () => {
        this.toasterService.showMessage('Διαγράφηκε επιτυχώς', 'success');
        this.reloadRecords();
      },
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('Σφάλμα κατά τη διαγραφή', 'error');
      }
    });
  }

  downloadFile(fileRecord: Invoice): void {
    if (!fileRecord.id) return;

    this.invoiceService.downloadInvoice(fileRecord.id).subscribe({
      next: (blob: Blob) => this.downloadBlob(blob, fileRecord.fileName || `file_${fileRecord.id}`),
      error: (error) => {
        console.error(error);
        this.toasterService.showMessage('Σφάλμα κατά τη λήψη', 'error');
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.toasterService.showMessage('Το αρχείο είναι πολύ μεγάλο (max 10MB)', 'error');
      return;
    }

    this.selectedFileUpload = file;
    this.fileForm.patchValue({ fileName: file.name });
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('#fileViewFileInput') as HTMLInputElement;
    fileInput?.click();
  }

  removeFile(): void {
    this.selectedFileUpload = null;
    this.fileForm.patchValue({ fileName: '' });
  }

  closeFileDialog(): void {
    this.showFileDialog = false;
    this.selectedFileRecord = null;
    this.selectedFileUpload = null;
    this.initializeFileForm();
  }

  openFileMenu(event: MouseEvent, fileRecord: Invoice): void {
    this.fileMenuItems = [
      { label: 'Επεξεργασία', icon: 'pi pi-pencil', command: () => this.editFile(fileRecord) },
      { label: 'Διαγραφή', icon: 'pi pi-trash', command: () => this.deleteFile(fileRecord) }
    ];

    this.fileRowMenu?.toggle(event);
  }

  reloadRecords(): void {
    if (this.businessId) {
      this.loadInvoices(this.businessId);
    }
  }

  convertBoolean(value: boolean): string {
    return value ? 'Ναι' : 'Όχι';
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

      if (parts[0].length === 4) {
        [year, month, day] = parts;
      } else {
        [day, month, year] = parts;
      }
    }

    if (!year || !month || !day) return '';
    return `${year.slice(-2)}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
  }

  private initializeInvoiceForm(): void {
    this.invoiceForm = this.formBuilder.group({
      invoiceNumber: ['', [Validators.required]],
      invoiceDate: ['', [Validators.required]],
      fileName: ['', [Validators.required]],
      description: [''],
      invoiceType: ['FEE_INVOICE', [Validators.required]]
    });
  }

  private initializeFileForm(): void {
    this.fileForm = this.formBuilder.group({
      fileName: ['', [Validators.required]],
      description: ['']
    });
  }

  private convertToISODate(dateInput: string | Date): string {
    if (!dateInput) return '';

    if (dateInput instanceof Date) {
      return dateInput.toISOString().split('T')[0];
    }

    const parts = dateInput.split('-');
    if (parts.length !== 3) return dateInput;

    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }

  private convertBackendDateToInput(dateInput: string | Date): string {
    if (!dateInput) return '';

    if (dateInput instanceof Date) {
      return dateInput.toISOString().split('T')[0];
    }

    const parts = dateInput.split('-');
    if (parts.length !== 3) return dateInput;

    if (parts[0].length === 2) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return dateInput;
  }

  private convertToBackendDate(dateInput: string | Date): string {
    if (!dateInput) return '';

    if (dateInput instanceof Date) {
      return this.convertToISODate(dateInput).split('-').reverse().join('-');
    }

    const parts = dateInput.split('-');
    if (parts.length !== 3) return dateInput;

    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return dateInput;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private loadWorkTypeOptions(): void {
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

  private loadWhoOptions(): void {
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

  private loadAreaOptions(): void {
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

  private loadDetailsOptions(): void {
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

  private ensureCurrentOption(field: string, options: { label: string; value: string }[]): void {
    const currentValue = (this.businessForm?.get(field)?.value ?? '').trim();
    if (!currentValue) return;

    const exists = options.some(option => option.value === currentValue);
    if (!exists) {
      options.unshift({ label: currentValue, value: currentValue });
    }
  }

  private ensureCurrentDetailsOption(details?: string): void {
    const currentDetails = (details ?? this.businessForm?.get('type')?.value ?? '').trim();
    if (!currentDetails) {
      return;
    }

    const exists = this.workTypeOptions.some(option => option.value === currentDetails);
    if (!exists) {
      this.workTypeOptions = [{ label: currentDetails, value: currentDetails }, ...this.workTypeOptions];
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
}


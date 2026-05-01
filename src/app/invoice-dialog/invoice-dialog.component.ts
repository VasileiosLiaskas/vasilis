import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Business} from '../business/business.model';
import {NgIf} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {InvoiceService} from './invoice.service';
import {ToasterService} from '../toaster/toaster.service';
import {Invoice} from '../invoice/invoice.model';
import {DialogModule} from 'primeng/dialog';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {Menu, MenuModule} from 'primeng/menu';
import {DropdownModule} from 'primeng/dropdown';
import {TooltipModule} from 'primeng/tooltip';
import {MenuItem} from 'primeng/api';
import {InvoiceTypePipe} from '../invoice-type.pipe';
import {TextareaModule} from 'primeng/textarea';

@Component({
  selector: 'app-invoice-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    MenuModule,
    DropdownModule,
    TooltipModule,
    NgIf,
    InvoiceTypePipe,
    TextareaModule,
  ],
  templateUrl: './invoice-dialog.component.html',
  standalone: true,
  styleUrl: './invoice-dialog.component.css'
})
export class InvoiceDialogComponent implements OnInit {
  @Input() business!: Business;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  @ViewChild('invoiceRowMenu') invoiceRowMenu!: Menu;

  invoiceList: Invoice[] = [];
  showDialog: boolean = false;
  searchValue: string = '';
  selectedInvoice: Invoice | null = null;
  selectedFile: File | null = null;

  showInvoiceForm: boolean = false;
  invoiceForm!: FormGroup;
  activeMenuItems: MenuItem[] = [];

  invoiceTypeOptions = [
    { label: 'Τιμολόγιο Παροχής Υπηρεσιών', value: 'FEE_INVOICE' },
    { label: 'Τιμολόγιο Αγοράς', value: 'PURCHASE_INVOICE' },
  ];

  constructor(
    private http: HttpClient,
    private invoiceService: InvoiceService,
    private toasterService: ToasterService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.showDialog = true;
    this.initializeForm();
    this.loadInvoices();
  }

  initializeForm() {
    this.invoiceForm = this.formBuilder.group({
      invoiceNumber: ['', [Validators.required]],
      invoiceDate: ['', [Validators.required]],
      fileName: ['', [Validators.required]],
      description: [''],
      invoiceType: ['FEE_INVOICE', [Validators.required]]
    });
  }

  closeDialog() {
    this.showDialog = false;
    this.close.emit();
  }

  loadInvoices(): void {
    if (this.business?.id) {
      this.invoiceService.getInvoicesByBusinessId(this.business.id).subscribe({
        next: (invoices) => {
          this.invoiceList = invoices;
        },
        error: (err) => {
          console.error('Error loading invoices:', err);
          this.invoiceList = [];
        }
      });
    }
  }

  addInvoice() {
    this.selectedInvoice = null;
    this.selectedFile = null;
    this.invoiceForm.reset({ invoiceType: 'FEE_INVOICE' });
    this.showInvoiceForm = true;
  }

  editInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.selectedFile = null;

    let formattedDate = '';
    if (invoice.invoiceDate) {
      if (typeof invoice.invoiceDate === 'string' && invoice.invoiceDate.includes('-')) {
        const parts = invoice.invoiceDate.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else {
          formattedDate = invoice.invoiceDate;
        }
      }
    }

    this.invoiceForm.patchValue({
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: formattedDate,
      fileName: invoice.fileName,
      description: invoice.description,
      invoiceType: invoice.invoiceType
    });
    this.showInvoiceForm = true;
  }

  submitInvoice() {
    if (!this.invoiceForm.valid) {
      Object.keys(this.invoiceForm.controls).forEach(key => {
        this.invoiceForm.get(key)?.markAsTouched();
      });
      this.toasterService.showMessage('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία', 'warning');
      return;
    }

    const rawDate = this.invoiceForm.get('invoiceDate')?.value || '';
    let formattedDate = '';
    if (rawDate) {
      const dateParts = rawDate.split('-');
      if (dateParts.length === 3) {
        formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      }
    }

    if (this.selectedInvoice && this.selectedInvoice.id) {
      // Update
      const invoiceData = {
        id: this.selectedInvoice.id,
        fileName: this.invoiceForm.get('fileName')?.value || '',
        invoiceNumber: this.invoiceForm.get('invoiceNumber')?.value || '',
        description: this.invoiceForm.get('description')?.value || '',
        invoiceDate: formattedDate,
        invoiceType: this.invoiceForm.get('invoiceType')?.value || ''
      };

      this.invoiceService.updateInvoice(invoiceData).subscribe({
        next: () => {
          this.toasterService.showMessage('Το τιμολόγιο ενημερώθηκε επιτυχώς', 'success');
          this.showInvoiceForm = false;
          this.loadInvoices();
          this.saved.emit();
        },
        error: (err) => {
          this.toasterService.showMessage('Σφάλμα κατά την ενημέρωση', 'error');
        }
      });
    } else {
      // Create
      if (!this.selectedFile) {
        this.toasterService.showMessage('Επιλέξτε αρχείο', 'warning');
        return;
      }

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('invoiceNumber', this.invoiceForm.get('invoiceNumber')?.value || '');
      formData.append('invoiceDate', formattedDate);
      formData.append('fileName', this.invoiceForm.get('fileName')?.value || '');
      formData.append('description', this.invoiceForm.get('description')?.value || '');
      formData.append('invoiceType', this.invoiceForm.get('invoiceType')?.value || '');
      formData.append('businessId', this.business.id.toString());

      this.invoiceService.createInvoice(formData).subscribe({
        next: () => {
          this.toasterService.showMessage('Το τιμολόγιο δημιουργήθηκε επιτυχώς', 'success');
          this.showInvoiceForm = false;
          this.loadInvoices();
          this.saved.emit();
        },
        error: (err) => {
          this.toasterService.showMessage('Σφάλμα κατά τη δημιουργία', 'error');
        }
      });
    }
  }

  deleteInvoice(invoice: Invoice) {
    if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το τιμολόγιο;')) {
      this.invoiceService.deleteInvoice(invoice).subscribe({
        next: () => {
          this.toasterService.showMessage('Διαγράφηκε επιτυχώς', 'success');
          this.loadInvoices();
          this.saved.emit();
        },
        error: () => {
          this.toasterService.showMessage('Σφάλμα κατά τη διαγραφή', 'error');
        }
      });
    }
  }

  downloadInvoice(invoice: Invoice) {
    if (!invoice.id) return;
    this.invoiceService.downloadInvoice(invoice.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = invoice.fileName || `invoice_${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toasterService.showMessage('Σφάλμα κατά τη λήψη', 'error');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.toasterService.showMessage('Το αρχείο είναι πολύ μεγάλο (max 10MB)', 'error');
        return;
      }
      this.selectedFile = file;
      this.invoiceForm.patchValue({ fileName: file.name });
    }
  }

  triggerFileInput() {
    const fileInput = document.querySelector('#invoiceDialogFileInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  removeFile() {
    this.selectedFile = null;
    this.invoiceForm.patchValue({ fileName: '' });
  }

  openMenu(event: MouseEvent, invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.activeMenuItems = [
      { label: 'Επεξεργασία', icon: 'pi pi-pencil', command: () => this.editInvoice(invoice) },
      { label: 'Διαγραφή', icon: 'pi pi-trash', command: () => this.deleteInvoice(invoice) }
    ];
    if (this.invoiceRowMenu) {
      this.invoiceRowMenu.toggle(event);
    }
  }

  closeInvoiceForm() {
    this.showInvoiceForm = false;
    this.selectedInvoice = null;
    this.selectedFile = null;
    this.invoiceForm.reset({ invoiceType: 'FEE_INVOICE' });
  }
}

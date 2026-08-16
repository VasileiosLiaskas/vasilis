import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Invoice} from './invoice.model';
import {HttpClient} from '@angular/common/http';
import {InvoiceService} from '../invoice-dialog/invoice.service';
import {ToasterService} from '../toaster/toaster.service';
import {response} from 'express';
import {InvoiceTypePipe} from '../invoice-type.pipe';
import {InvoiceDialogComponent} from '../invoice-dialog/invoice-dialog.component';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {Menu, MenuModule} from 'primeng/menu';
import {DialogModule} from 'primeng/dialog';
import {DropdownModule} from 'primeng/dropdown';
import {CheckboxModule} from 'primeng/checkbox';
import {InputTextarea} from 'primeng/inputtextarea';
import {TooltipModule} from 'primeng/tooltip';
import {MenuItem} from 'primeng/api';
import {Table} from 'primeng/table';
import {Router} from '@angular/router';

@Component({
  selector: 'app-invoice',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    MenuModule,
    DialogModule,
    DropdownModule,
    CheckboxModule,
    TooltipModule,
    NgIf,
    InvoiceTypePipe,
  ],
  templateUrl: './invoice.component.html',
  standalone: true,
  styleUrls: [
    '../business/business.component.css', // reuse Business styles
    './invoice.component.css'             // keep Invoice styles
  ],
})
export class InvoiceComponent implements OnInit{

  @ViewChild('rowMenu') rowMenu!: Menu;

  // Table data and pagination
  invoiceList: Invoice[] = [];
  filteredInvoiceList: Invoice[] = [];
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  searchValue: string = '';
  dateFilterValue: string = '';
  showInvoices: boolean = true;
  showFileAttachments: boolean = true;

  // Form and dialog
  invoiceForm!: FormGroup;
  openDialog: boolean = false;
  selectedInvoice: Invoice | null = null;
  selectedFile: File | null = null;

  // Menu and options
  activeMenuItems: MenuItem[] = [];
  invoiceTypeOptions = [
    { label: 'Τιμολόγιο Παροχής Υπηρεσιών', value: 'FEE_INVOICE' },
    { label: 'Τιμολόγιο Αγοράς', value: 'PURCHASE_INVOICE' },
  ];

  constructor(private http: HttpClient,
              private invoiceService: InvoiceService,
              private toasterService: ToasterService,
              private formBuilder: FormBuilder,
              private router: Router) {
    this.initializeMenuItems();
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadInvoiceList();
  }

  loadInvoiceList(){
    this.invoiceService.getInvoices()
      .subscribe({
        next: (response) => {
          this.invoiceList = response;
          this.applyTypeFilter();
        },
        error: (error) => {
          console.error('Error loading invoices:', error);
          this.toasterService.showMessage('Σφάλμα κατά τη φόρτωση των τιμολογίων', 'error');
          this.invoiceList = [];
          this.filteredInvoiceList = [];
          this.totalElements = 0;
        }
      });
  }

  clearFilters(table: Table) {
    table.clear();
    this.searchValue = '';
    this.dateFilterValue = '';
    this.showInvoices = true;
    this.showFileAttachments = true;
    this.applyTypeFilter();
  }

  applyTypeFilter() {
    this.filteredInvoiceList = this.invoiceList.filter((invoice) =>
      (this.showInvoices && ['FEE_INVOICE', 'PURCHASE_INVOICE'].includes(invoice.invoiceType)) ||
      (this.showFileAttachments && invoice.invoiceType === 'FILE_ATTACHMENT')
    );
    this.totalElements = this.filteredInvoiceList.length;
  }

  private initializeForm() {
    this.invoiceForm = this.formBuilder.group({
      invoiceNumber: ['', [Validators.required]],
      invoiceDate: ['', [Validators.required]],
      fileName: ['', [Validators.required]],
      description: [''],
      invoiceType: ['', [Validators.required]]
    });
  }

  submitInvoice() {
    if (this.invoiceForm.valid) {
      if (this.selectedInvoice) {
        // Update existing invoice - use request parameters
        const rawDate = this.invoiceForm.get('invoiceDate')?.value || '';
        let formattedDate = '';

        // Convert date from YYYY-MM-DD to dd-MM-yyyy for backend
        if (rawDate) {
          const dateParts = rawDate.split('-');
          if (dateParts.length === 3) {
            formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // dd-MM-yyyy
          }
        }

        const invoiceData = {
          id: this.selectedInvoice.id,
          fileName: this.invoiceForm.get('fileName')?.value || '',
          invoiceNumber: this.invoiceForm.get('invoiceNumber')?.value || '',
          description: this.invoiceForm.get('description')?.value || '',
          invoiceDate: formattedDate,
          invoiceType: this.invoiceForm.get('invoiceType')?.value || ''
        };

        this.invoiceService.updateInvoice(invoiceData)
          .subscribe({
            next: () => {
              this.onInvoiceSaved();
            },
            error: (error) => {
              console.error('Error updating invoice:', error);
              this.toasterService.showMessage('Σφάλμα κατά την ενημέρωση του τιμολογίου', 'error');
            }
          });
      } else {
        // Create new invoice - use FormData for file upload
        const rawDate = this.invoiceForm.get('invoiceDate')?.value || '';
        let formattedDate = '';

        // Convert date from YYYY-MM-DD to dd-MM-yyyy for backend
        if (rawDate) {
          const dateParts = rawDate.split('-');
          if (dateParts.length === 3) {
            formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // dd-MM-yyyy
          }
        }

        const formData = new FormData();
        formData.append('invoiceNumber', this.invoiceForm.get('invoiceNumber')?.value || '');
        formData.append('invoiceDate', formattedDate);
        formData.append('fileName', this.invoiceForm.get('fileName')?.value || '');
        formData.append('description', this.invoiceForm.get('description')?.value || '');
        formData.append('invoiceType', this.invoiceForm.get('invoiceType')?.value || '');

        // Add file if selected
        if (this.selectedFile) {
          formData.append('file', this.selectedFile);
        }

        this.invoiceService.createInvoice(formData)
          .subscribe({
            next: () => {
              this.onInvoiceSaved();
            },
            error: (error) => {
              console.error('Error creating invoice:', error);
              this.toasterService.showMessage('Σφάλμα κατά τη δημιουργία του τιμολογίου', 'error');
            }
          });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.invoiceForm.controls).forEach(key => {
        this.invoiceForm.get(key)?.markAsTouched();
      });
      this.toasterService.showMessage('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία', 'warning');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        this.toasterService.showMessage('Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος: 10MB', 'error');
        return;
      }

      this.selectedFile = file;
      this.invoiceForm.patchValue({
        fileName: file.name
      });
    }
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.invoiceForm.patchValue({
      fileName: ''
    });

    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  addInvoice() {
    this.selectedInvoice = null;
    this.selectedFile = null;
    this.invoiceForm.reset();
    this.openDialog = true;
  }

  editInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.selectedFile = null;

    // Format the date for HTML date input (YYYY-MM-DD)
    let formattedDate = '';
    if (invoice.invoiceDate) {
      // Check if the date is in dd-MM-yyyy format from backend
      if (typeof invoice.invoiceDate === 'string' && invoice.invoiceDate.includes('-')) {
        const parts = invoice.invoiceDate.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          // Convert from dd-MM-yyyy to yyyy-MM-dd
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
          formattedDate = `${year}-${month}-${day}`;
        } else {
          // Try to parse as regular date
          const date = new Date(invoice.invoiceDate);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0];
          }
        }
      } else {
        // Try to parse as regular date
        const date = new Date(invoice.invoiceDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
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
    this.openDialog = true;
  }

  deleteInvoice(invoice: Invoice) {
    if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το τιμολόγιο;')) {
      this.invoiceService.deleteInvoice(invoice).subscribe({
        next: () => {
          this.loadInvoiceList();
          this.toasterService.showMessage('Το τιμολόγιο διαγράφηκε επιτυχώς', 'success');
        },
        error: (error) => {
          console.error('Error deleting invoice:', error);
          this.toasterService.showMessage('Σφάλμα κατά τη διαγραφή του τιμολογίου', 'error');
        }
      });
    }
  }

  downloadInvoice(invoice: Invoice) {
    if (!invoice.id) {
      this.toasterService.showMessage('Δεν μπορεί να γίνει λήψη του αρχείου', 'error');
      return;
    }

    this.invoiceService.downloadInvoice(invoice.id).subscribe({
      next: (blob: Blob) => {
        // Create blob URL
        const url = window.URL.createObjectURL(blob);

        // Create temporary link element
        const link = document.createElement('a');
        link.href = url;

        // Set filename - use invoice fileName or generate one
        const fileName = invoice.fileName || `invoice_${invoice.invoiceNumber}.pdf`;
        link.download = fileName;

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(url);

        // Show success message
        this.toasterService.showMessage('Η λήψη του αρχείου ολοκληρώθηκε', 'success');
      },
      error: (error) => {
        console.error('Error downloading invoice:', error);
        this.toasterService.showMessage('Σφάλμα κατά τη λήψη του αρχείου', 'error');
      }
    });
  }

  openMenu(event: MouseEvent, invoice: Invoice) {
    this.selectedInvoice = invoice;

    // Show the context menu
    if (this.rowMenu) {
      this.rowMenu.show(event);
    }
  }

  closeDialog() {
    this.openDialog = false;
    this.selectedInvoice = null;
    this.selectedFile = null;
    this.invoiceForm.reset();
  }

  onInvoiceSaved() {
    this.closeDialog();
    this.loadInvoiceList();
    this.toasterService.showMessage('Το τιμολόγιο αποθηκεύτηκε επιτυχώς', 'success');
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadInvoiceList();
  }

  goToBusiness(businessId: number) {
    this.router.navigate(['/business', businessId, 'view']);
  }

  private initializeMenuItems() {
    this.activeMenuItems = [
      {
        label: 'Επεξεργασία',
        icon: 'pi pi-pencil',
        command: () => {
          if (this.selectedInvoice) {
            this.editInvoice(this.selectedInvoice);
          }
        }
      },
      {
        label: 'Διαγραφή',
        icon: 'pi pi-trash',
        command: () => {
          if (this.selectedInvoice) {
            this.deleteInvoice(this.selectedInvoice);
          }
        }
      }
    ];
  }
}

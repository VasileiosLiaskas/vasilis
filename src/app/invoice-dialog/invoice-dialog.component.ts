import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {Business} from '../business/business.model';
import {NgForOf, NgIf} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {InvoiceService} from './invoice.service';
import {ToasterService} from '../toaster/toaster.service';
import {Invoice} from '../invoice/invoice.model';

@Component({
  selector: 'app-invoice-dialog',
  imports: [
    FormsModule,
  ],
  templateUrl: './invoice-dialog.component.html',
  standalone: true,
  styleUrl: './invoice-dialog.component.css'
})
export class InvoiceDialogComponent implements OnInit{
  @Input() business!: Business;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>()
  invoiceList: any;
  businessId!: number;
  invoiceNumber: any;
  description: any;
  selectedFile: any;
  invoiceDate!: string;
  openRowId: any;
  editable: boolean=false;
  beforeEdit!: Invoice;
  invoiceType!: string;
  @Input() invoice?: Invoice | null;
  fileName: string | null = null;


  constructor(private http: HttpClient,
              private invoiceService: InvoiceService,
              private toasterService: ToasterService) {}

  ngOnInit(): void {
    this.businessId = this.business?.id ?? null;
    if(this.businessId) {
      this.invoiceType='FEE_INVOICE'
    }
    if (this.invoice) {
      this.invoiceNumber = this.invoice.invoiceNumber;
      this.description = this.invoice.description;
      this.invoiceDate = this.invoice.invoiceDate;
      this.invoiceType = this.invoice.invoiceType;
      this.fileName = this.invoice.fileName;
      this.editable = true;
    }
    this.loadInvoices();
  }

  closeDialog() {
    this.close.emit();
  }

  loadInvoices(): void {


  }

  @HostListener('document:click')
  closeDropdown() {
    this.openRowId = null;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadInvoice(): void {
  //   if (!this.invoice && !this.selectedFile || !this.invoiceNumber) {
  //     alert('Συμπληρώστε τον αριθμό τιμολογίου και επιλέξτε αρχείο.');
  //     return;
  //   }
  //
  //   const date = new Date(this.invoiceDate);
  //
  //   this.invoiceService.uploadInvoice( {
  //     file: this.selectedFile,
  //     invoiceNumber: this.invoiceNumber,
  //     description: this.description,
  //     businessId: this.business?.id,
  //     invoiceDate: date.toISOString(),
  //     invoiceType:this.invoiceType
  //   }).subscribe({
  //     next: () => {
  //
  //       this.toasterService.showMessage('Το τιμολόγιο ανέβηκε επιτυχώς', 'success');
  //       this.selectedFile = null;
  //       this.invoiceNumber = '';
  //       this.description = '';
  //       if(!this.businessId){
  //         this.closeDialog()
  //       }
  //       this.loadInvoices(); // Reload the table
  //     }
  //   });
  // }
    const date = new Date(this.invoiceDate);

    // --- 1️⃣ Validation ---
    if (!this.invoiceNumber) {
      alert('Συμπληρώστε τον αριθμό τιμολογίου.');
      return;
    }

    // --- 2️⃣ Editing existing invoice ---
    if (this.invoice && this.invoice.id) {
      const updatedInvoice: any = {
        ...this.invoice,
        invoiceNumber: this.invoiceNumber,
        description: this.description,
        invoiceDate: date.toISOString(),
        invoiceType: this.invoiceType,
      };

      // If user selected a new file, include it
      if (this.selectedFile) {
        updatedInvoice.file = this.selectedFile;
      }

      this.invoiceService.saveInvoice(updatedInvoice).subscribe({
        next: () => {
          this.toasterService.showMessage('Η επεξεργασία ήταν επιτυχής', 'success');
          this.saved.emit();
          this.closeDialog();
        },
        error: (err) => {
          console.error('Error updating invoice:', err);
          this.toasterService.showMessage('Αποτυχία επεξεργασίας τιμολογίου', 'error');
        }
      });

      return; // stop here for edit case
    }

    // --- 3️⃣ Creating new invoice ---
    if (!this.selectedFile) {
      alert('Επιλέξτε αρχείο για το νέο τιμολόγιο.');
      return;
    }

    this.invoiceService.uploadInvoice({
      file: this.selectedFile,
      invoiceNumber: this.invoiceNumber,
      description: this.description,
      businessId: this.business?.id,
      invoiceDate: date.toISOString(),
      invoiceType: this.invoiceType
    }).subscribe({
      next: () => {
        this.toasterService.showMessage('Το τιμολόγιο ανέβηκε επιτυχώς', 'success');
        this.saved.emit();
        this.selectedFile = null;
        this.invoiceNumber = '';
        this.description = '';
        if (!this.businessId) {
          this.closeDialog();
        }

        this.loadInvoices();
      },
      error: (err) => {
        console.error('Error uploading invoice:', err);
        this.toasterService.showMessage('Αποτυχία ανεβάσματος τιμολογίου', 'error');
      }
    });
  }

  openDatePicker(event: MouseEvent, datePicker: HTMLInputElement) {
    if (datePicker) {
      const input = event.target as HTMLElement;
      const rect = input.getBoundingClientRect();

      // Position the hidden date input near the clicked text field
      datePicker.style.position = 'fixed';
      datePicker.style.left = `${rect.left}px`;
      datePicker.style.top = `${rect.bottom + 2}px`; // a few pixels below
      datePicker.style.opacity = '0';
      datePicker.style.visibility = 'visible';
      datePicker.style.width = `${rect.width}px`;
      datePicker.style.height = `1px`; // tiny but clickable anchor

      void datePicker.offsetHeight;

      // Show the native date picker
      datePicker.showPicker();// Open the date picker
    }
  }

  setDateTo(event:any) {
    this.invoiceDate = event.target.value;
  }

  downloadInvoice(invoice: any) {
    this.invoiceService.downloadInvoice(invoice.id).subscribe(responseData => {
      const blob = new Blob([responseData], {type: responseData.type || 'application/octet-stream'});

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice_${invoice.invoiceNumber}.pdf`;
      link.click();

      window.URL.revokeObjectURL(link.href);
    });
  }


  deleteRow(invoice: any) {
    this.invoiceService.deleteInvoice(invoice).subscribe({
      next:(success) =>{
        if (success){
          this.loadInvoices();
          this.toasterService.showMessage("Διαγράφηκε Επιτυχώς", "success")
          this.saved.emit();

        }
      },error: (err) =>{
        this.toasterService.showMessage("Προέκυψε σφάλμα κατά την διαγραφή","error")
    }
    })
  }

  editRow(invoice: any) {
    invoice.editable=true;
    this.beforeEdit = JSON.parse(JSON.stringify(invoice));
  }

  toggleDropdown(event: MouseEvent, rowId: number) {
    event.stopPropagation();
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    this.openRowId = this.openRowId === rowId ? null : rowId;
    if (this.openRowId) {
      document.documentElement.style.setProperty('--x', `${rect.left}px`);
      document.documentElement.style.setProperty('--y', `${rect.bottom}px`);
    }
  }

  saveRow(invoice: any) {
    this.invoiceService.saveInvoice(invoice).subscribe({
      next: (responseData) => {
        invoice.editable = false;
        this.toasterService.showMessage("Η επεξεργασία ήταν επιτυχής", "success");

        this.saved.emit();
      },
      error: (err) => {
        console.error("Error updating invoice:", err);
        this.toasterService.showMessage("Αποτυχία επεξεργασίας τιμολογίου", "error");
      }
    });
  }

  cancelEdit(invoice: any) {

    invoice.invoiceDate= this.beforeEdit.invoiceDate
    invoice.invoiceNumber= this.beforeEdit.invoiceNumber;
    invoice.fileName=this.beforeEdit.fileName;
    invoice.description=this.beforeEdit.description;
    invoice.editable=false;
  }
}

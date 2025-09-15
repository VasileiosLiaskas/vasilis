import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Business} from '../business/business.model';
import {NgForOf, NgIf} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {InvoiceService} from './invoice.service';
import {ToasterService} from '../toaster/toaster.service';

@Component({
  selector: 'app-invoice-dialog',
  imports: [
    NgForOf,
    FormsModule,
    NgIf
  ],
  templateUrl: './invoice-dialog.component.html',
  standalone: true,
  styleUrl: './invoice-dialog.component.css'
})
export class InvoiceDialogComponent implements OnInit{
  @Input() business!: Business;
  @Output() close = new EventEmitter<void>();
  invoiceList: any;
  businessId!: number;
  invoiceNumber: any;
  description: any;
  selectedFile: any;
  invoiceDate!: string;


  constructor(private http: HttpClient,
              private invoiceService: InvoiceService,
              private toasterService: ToasterService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  closeDialog() {
    this.close.emit();
  }

  loadInvoices(): void {

    this.invoiceService.loadInvoices({ businessId: this.business.id }).subscribe( invoices => {
     this.invoiceList = invoices;
     console.log(this.invoiceList);
    })
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadInvoice(): void {
    if (!this.selectedFile || !this.invoiceNumber) {
      alert('Συμπληρώστε τον αριθμό τιμολογίου και επιλέξτε αρχείο.');
      return;
    }

    this.invoiceService.uploadInvoice( this.selectedFile, this.invoiceNumber,
      this.description, this.business.id, this.invoiceDate).subscribe({
      next: () => {
        this.toasterService.showMessage('Αποθηκεύτηκε επιτυχώς', 'success');
        this.selectedFile = null;
        this.invoiceNumber = '';
        this.description = '';
        this.loadInvoices(); // Reload the table
      }
    });
  }

  openDatePicker(datePicker: HTMLInputElement) {
    if (datePicker) {
      datePicker.showPicker(); // Open the date picker
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
      link.download = `invoice_${invoice.invoiceNumber}.pdf`; // 👈 or pass real fileName from backend metadata
      link.click();

      window.URL.revokeObjectURL(link.href);
    });
  }
}

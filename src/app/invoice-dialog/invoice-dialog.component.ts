import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
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
  openRowId: any;
  editable: boolean=false;


  constructor(private http: HttpClient,
              private invoiceService: InvoiceService,
              private toasterService: ToasterService) {}

  ngOnInit(): void {
    this.businessId = this.business.id;
    this.loadInvoices();
  }

  closeDialog() {
    this.close.emit();
  }

  loadInvoices(): void {

    this.invoiceService.loadInvoices({businessId:this.businessId}).subscribe( invoices => {
     this.invoiceList = invoices.content;
     console.log(this.invoiceList);
    })
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
    if (!this.selectedFile || !this.invoiceNumber) {
      alert('Συμπληρώστε τον αριθμό τιμολογίου και επιλέξτε αρχείο.');
      return;
    }

    const date = new Date(this.invoiceDate);

    this.invoiceService.uploadInvoice( this.selectedFile, this.invoiceNumber,
      this.description, this.business.id, date.toISOString()).subscribe({
      next: () => {

        this.toasterService.showMessage('Το τιμολόγιο ανέβηκε επιτυχώς', 'success');
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

        }
      },error: (err) =>{
        this.toasterService.showMessage("Προέκυψε σφάλμα κατά την διαγραφή","error")
    }
    })
  }

  editRow(invoice: any) {
    invoice.editable=true;

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
        this.loadInvoices();
      },
      error: (err) => {
        console.error("Error updating invoice:", err);
        this.toasterService.showMessage("Αποτυχία επεξεργασίας τιμολογίου", "error");
      }
    });
  }

  cancelEdit(invoice: any) {

  }
}

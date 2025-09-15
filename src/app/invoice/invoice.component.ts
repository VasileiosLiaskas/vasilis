import {Component, HostListener, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Invoice} from './invoice.model';
import {Event} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {InvoiceService} from '../invoice-dialog/invoice.service';
import {ToasterService} from '../toaster/toaster.service';

@Component({
  selector: 'app-invoice',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    NgIf,
    NgForOf
  ],
  templateUrl: './invoice.component.html',
  standalone: true,
  styleUrls: [
    '../business/business.component.css', // reuse Business styles
    './invoice.component.css'             // keep Invoice styles
  ],
})
export class InvoiceComponent implements OnInit{
  searchQuery: any;
  dateFrom: any;
  dateTo: any;
  showFilters: any;
  invoiceList: Invoice[] | undefined;
  protected readonly Math = Math;
  page: any;
  size: any;
  openRowId: number | null = null;
  totalElements: number = 0;

  constructor(private http: HttpClient,
              private invoiceService: InvoiceService,
              private toasterService: ToasterService) {}

  ngOnInit(): void {
    this.invoiceService.loadInvoices({}).subscribe( invoices => {
      this.invoiceList = invoices;
  })
  }

  onSearch() {

  }

  openDatePicker(datePickerFrom: HTMLInputElement) {

  }

  setDateFrom(event:any) {
    this.dateFrom = event.target.value;
  }

  setDateTo(event: any) {
    this.dateTo = event.target.value;
  }

  toggleFilters() {

  }

  addInvoice() {

  }



  deleteRow(invoice: any) {

  }

  editRow(invoice: any) {

  }

  @HostListener('document:click')
  closeDropdown() {
    this.openRowId = null;
  }
  toggleDropdown(event: MouseEvent, id:number) {
    event.stopPropagation();
    this.openRowId = this.openRowId === id ? null : id;
  }

  onPageChange(newPage: number) {
    if (newPage < 0 || newPage >= Math.ceil(this.totalElements / this.size)) {
      return;
    }
    this.page = newPage;
  }


  downloadInvoice(invoice: Invoice) {
    this.invoiceService.downloadInvoice(invoice.id).subscribe(responseData => {
      const blob = new Blob([responseData], {type: responseData.type || 'application/octet-stream'});

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice_${invoice.invoiceNumber}.pdf`;
      link.click();

      window.URL.revokeObjectURL(link.href);
    });
  }
}

import {Component, HostListener, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Invoice} from './invoice.model';
import {Event} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {InvoiceService} from '../invoice-dialog/invoice.service';
import {ToasterService} from '../toaster/toaster.service';
import {response} from 'express';
import {InvoiceTypePipe} from '../invoice-type.pipe';
import {InvoiceDialogComponent} from '../invoice-dialog/invoice-dialog.component';

@Component({
  selector: 'app-invoice',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    NgIf,
    NgForOf,
    InvoiceTypePipe,
    InvoiceDialogComponent
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
  page: number = 0;
  size: number = 10;

  openRowId: number | null = null;
  totalElements: number = 0;
  private totalRecords: any;
  createNewInvoice: boolean= false;

  constructor(private http: HttpClient,
              private invoiceService: InvoiceService,
              private toasterService: ToasterService) {}

  ngOnInit(): void {
    this.loadInvoiceList();
  }


  loadInvoiceList(){
    let params= {
      page:this.page,
      size:this.size,
      searchQuery:this.searchQuery,
      dateFrom:this.dateFrom,
      dateTo:this.dateTo
    }
    this.invoiceService.loadInvoices(params).subscribe( responseData => {
        console.log(this.totalElements)
        this.invoiceList=responseData.content;
        this.totalElements = responseData.totalElements
      console.log("invocieNBumber", this.invoiceList)
    })
  }

  openDatePicker(datePicker: HTMLInputElement) {
    if (datePicker) {
      datePicker.showPicker(); // Open the date picker
    }
  }

  setDateFrom(event:any) {
    this.dateFrom = event.target.value;
    this.loadInvoiceList();
  }

  setDateTo(event: any) {
    this.dateTo = event.target.value;
    this.loadInvoiceList();
  }

  toggleFilters() {

  }

  addInvoice() {
    this.createNewInvoice=true;
  }



  deleteRow(invoice: any) {
    this.invoiceService.deleteInvoice(invoice).subscribe( responseData=>{
      console.log(responseData);
      this.toasterService.showMessage("Το τιμολόγιο διαγράφηκε επιτυχώς", 'success');
      this.loadInvoiceList();
    })
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

  closeDialog() {
    this.createNewInvoice=false;
  }
}

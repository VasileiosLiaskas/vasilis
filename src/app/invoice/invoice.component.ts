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
  ],
  templateUrl: './invoice.component.html',
  standalone: true,
  styleUrls: [
    '../business/business.component.css', // reuse Business styles
    './invoice.component.css'             // keep Invoice styles
  ],
})
export class InvoiceComponent implements OnInit{


  constructor(private http: HttpClient,
              private invoiceService: InvoiceService,
              private toasterService: ToasterService) {}

  ngOnInit(): void {
    this.loadInvoiceList();
  }


  loadInvoiceList(){

    }

}

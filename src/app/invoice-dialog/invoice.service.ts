import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormBuilder} from '@angular/forms';
import {Invoice} from '../invoice/invoice.model';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class InvoiceService{
  constructor(private http: HttpClient,
              private formBuilder: FormBuilder) {}


  private baseUrl = 'http://localhost:8080/invoice';


  uploadInvoice(
    file: File,invoiceNumber: string,description: string, businessId: number, invoiceDate:string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoiceNumber', invoiceNumber);
    formData.append('description', description);
    formData.append('businessId', businessId.toString());
    formData.append('date', invoiceDate);

    console.log("formDATA", formData);
    return this.http.post(`${this.baseUrl}/save`, formData);
  }
}

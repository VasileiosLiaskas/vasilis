import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {FormBuilder} from '@angular/forms';
import {Invoice} from '../invoice/invoice.model';
import {Observable} from 'rxjs';
import {environment} from '../../enviroments/environment';

@Injectable({providedIn: 'root'})
export class InvoiceService {
  constructor(private http: HttpClient,
              private formBuilder: FormBuilder) {
  }


  private baseUrl = environment.apiUrl + 'invoice';


  uploadInvoice(
    file: File, invoiceNumber: string, description: string, businessId: number, invoiceDate: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoiceNumber', invoiceNumber);
    formData.append('description', description);
    formData.append('businessId', businessId.toString());
    formData.append('date', invoiceDate);

    console.log("formDATA", formData);
    return this.http.post(`${this.baseUrl}/save`, formData);
  }

  loadInvoices(filters?: {
    invoiceNumber?: string;
    businessId?: number;
    invoiceDate?: string;
    dateCreated?: string;
  }): Observable<Invoice[]> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value);
        }
      });
    }

    return this.http.get<Invoice[]>(`${this.baseUrl}/find`, {params});
  }

  downloadInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${id}`, {
      responseType: 'blob'
    });
  }
}

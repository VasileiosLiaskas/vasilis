import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {FormBuilder} from '@angular/forms';
import {Invoice} from '../invoice/invoice.model';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {Page} from '../business/page.model';
import {Business} from '../business/business.model';

@Injectable({providedIn: 'root'})
export class InvoiceService {
  constructor(private http: HttpClient,
              private formBuilder: FormBuilder) {
  }


  private baseUrl = environment.apiUrl + 'invoice';


  uploadInvoice({file, invoiceNumber, description, businessId, invoiceDate, invoiceType}: {
    file: File,
    invoiceNumber: string,
    description: string,
    businessId?: number,
    invoiceDate: string,
    invoiceType?: string
  }): Observable<any>
  {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoiceNumber', invoiceNumber);
    formData.append('description', description);
    formData.append('invoiceDate', invoiceDate);
    if (businessId !== undefined && businessId !== null) {
      formData.append('businessId', businessId.toString());
    }

    if (invoiceType) {
      formData.append('invoiceType', invoiceType);
    }


    return this.http.post(`${this.baseUrl}/save`, formData,{ responseType: 'text'} );
  }



  downloadInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${id}`, {
      responseType: 'blob'
    });
  }

  deleteInvoice(invoice: any) {
    return this.http.delete<boolean>(`${this.baseUrl}/delete/${invoice.id}`);
  }

  saveInvoice(invoice: any) {
    const params = {
      fileName: invoice.fileName,
      invoiceNumber: invoice.invoiceNumber,
      description: invoice.description,
      invoiceDate: invoice.invoiceDate,
      invoiceType: invoice.invoiceType
    };

    return this.http.put(
      `${this.baseUrl}/edit/${invoice.id}`,{}, { params, responseType: 'text' }
    );
  }

  getInvoices() {
    return this.http.get<Invoice[]>(`${this.baseUrl}/list`);
  }

  getInvoicesByBusinessId(businessId: number): Observable<Invoice[]> {
    const params = new HttpParams().set('businessId', businessId.toString());
    return this.http.get<Invoice[]>(`${this.baseUrl}/find`, { params });
  }

  createInvoice(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, formData, { responseType: 'text' });
  }

  updateInvoice(invoice: {
    id: number;
    fileName: string;
    invoiceNumber: string;
    description: string;
    invoiceDate: string;
    invoiceType: string;
  }): Observable<any> {
    const params = new HttpParams()
      .set('fileName', invoice.fileName || '')
      .set('invoiceNumber', invoice.invoiceNumber || '')
      .set('description', invoice.description || '')
      .set('invoiceDate', invoice.invoiceDate || '')
      .set('invoiceType', invoice.invoiceType || '');

    return this.http.put(`${this.baseUrl}/edit/${invoice.id}`, {}, {
      params: params,
      responseType: 'text'
    });
  }
}

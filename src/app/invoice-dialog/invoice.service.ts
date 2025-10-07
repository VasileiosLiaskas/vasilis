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


  uploadInvoice(file: File, invoiceNumber: string, description: string, businessId: number, invoiceDate: string): Observable<any>
  {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoiceNumber', invoiceNumber);
    formData.append('description', description);
    formData.append('businessId', businessId.toString());
    formData.append('invoiceDate', invoiceDate);




    return this.http.post(`${this.baseUrl}/save`, formData,{ responseType: 'text'} );
  }

  loadInvoices(options: {
    page?: number;
    size?: number;
    searchQuery?: string;
    dateFrom?: string;
    dateTo?: string;
    businessId?: number;
  } = {}): Observable<Page<Invoice>> {

    let params = new HttpParams()
      .set('page', (options.page ?? 0).toString())
      .set('size', (options.size ?? 10).toString());

    if (options.searchQuery) params = params.set('keyword', options.searchQuery);
    if (options.dateFrom) params = params.set('dateFrom', options.dateFrom);
    if (options.dateTo) params = params.set('dateTo', options.dateTo);
    if (options.businessId) params = params.set('businessId', options.businessId.toString());

    return this.http.get<Page<Invoice>>(`${this.baseUrl}/list`, { params });
  }

  // loadInvoices(filters?: {
  //   invoiceNumber?: string;
  //   businessId?: number;
  //   invoiceDate?: string;
  //   dateCreated?: string;
  // }): Observable<Invoice[]> {
  //   let params = new HttpParams();
  //
  //   if (filters) {
  //     Object.keys(filters).forEach(key => {
  //       const value = filters[key as keyof typeof filters];
  //       if (value !== null && value !== undefined && value !== '') {
  //         params = params.set(key, value);
  //       }
  //     });
  //   }
  //
  //   return this.http.get<Invoice[]>(`${this.baseUrl}/find`, {params});
  // }

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
      invoiceDate: invoice.invoiceDate
    };

    console.log(params.invoiceDate);
    return this.http.put(
      `${this.baseUrl}/edit/${invoice.id}`,{}, { params, responseType: 'text' }
    );
  }
}

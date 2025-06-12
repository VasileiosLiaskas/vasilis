import {Injectable} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Business} from './business.model';
import {Observable} from 'rxjs';
import {Page} from './page.model';

@Injectable({providedIn: 'root'})
export class BusinessService {

  constructor(private http: HttpClient,
              private formBuilder: FormBuilder) {
  }
  private baseUrl = 'http://localhost:8080/business';

  getBusinessList(page: number = 0, size: number = 10, searchQuery: string,
                  dateFrom: string, dateTo: string, filterFilesDelivered: boolean, filterFilesCompleted: boolean,
                  filterPayout: boolean
                  ): Observable<Page<Business>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchQuery) {
      params = params.set('keyword', searchQuery);
    }
    if (dateFrom){
      params=params.set('dateFrom', dateFrom);
    }
    if (dateTo){
      params=params.set('dateTo', dateTo);
    }
    if (filterFilesDelivered !== null && filterFilesDelivered !== undefined) {
      params = params.set('filterFilesDelivered', String(filterFilesDelivered));
    }

    if (filterFilesCompleted !== null && filterFilesCompleted !== undefined) {
      params = params.set('filterFilesCompleted', String(filterFilesCompleted));
    }

    if (filterPayout !== null && filterPayout !== undefined) {
      params = params.set('filterPayout', String(filterPayout));
    }


    return this.http.get<Page<Business>>(`${this.baseUrl}/list`, { params });
  }

  initForm() {
    const business = new Business();
    return this.formBuilder.group({
      id: [business.id],
      date: [this.formatDate(new Date())], // Set date to current timestamp
      type: [business.type],
      who: [business.who],
      area: [business.area],
      details: [business.details],
      costs: [business.costs],
      fee: [business.fee],
      advancePayment: [business.advancePayment],
      remainingMoney: [business.remainingMoney],
      payout: [false], // Ensure it starts as false
      filesCompleted: [false], // Ensure it starts as false
      filesDelivered: [false], // Ensure it starts as false
      comments: [business.comments]
    });
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // Returns 'YYYY-MM-DD'
  }

  save(business: any) {
    return this.http.post(`${this.baseUrl}/save`, business)
  }

  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export`, {
      responseType: 'blob', // Important to receive file as a binary blob
    });
  }

  downloadExcel() {
    this.exportExcel().subscribe((blob) => {
      const file = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileURL = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = 'Business_Report.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  deleteRow(id:number) {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}

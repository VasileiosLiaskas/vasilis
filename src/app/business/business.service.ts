import {Injectable} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Business} from './business.model';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class BusinessService {

  constructor(private http: HttpClient,
              private formBuilder: FormBuilder) {
  }
  private baseUrl = environment.apiUrl + 'business';


  getBusinessList(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.baseUrl}/list`);
  }

  initForm() {
    const business = new Business();
    return this.formBuilder.group({
      id: [business.id],
      date: [this.formatDate(new Date())],
      dateTo: [null],// Set date to current timestamp
      type: [business.type],
      fromWho: [business.fromWho],
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
      comments: [business.comments],
      googleCalendarId: [business.googleCalendarId],
    });
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // Returns 'YYYY-MM-DD'
  }

  save(business: Business):Observable<Business> {
    return this.http.post<Business>(`${this.baseUrl}/save`, business)
  }

  deleteRow(id:number) {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}

import {Injectable} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Business} from './business.model';

@Injectable({providedIn: 'root'})
export class BusinessService {

  constructor(private http: HttpClient,
              private formBuilder: FormBuilder) {
  }
  private baseUrl = 'http://localhost:8080/business';

  getBusinessList(){
    return this.http.get<Business[]>(`${this.baseUrl}/list`);
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
}

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
    return this.formBuilder.group(business)
  }
}

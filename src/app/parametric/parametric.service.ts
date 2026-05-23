import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParametricService {
  private apiUrl = environment.apiUrl + 'parametric-values';

  constructor(private http: HttpClient) { }

  getTextareaValues(type: string): Observable<string> {
    return this.http.get(this.apiUrl + '/textarea-values', { params: { type }, responseType: 'text' });
  }

  replaceFromTextarea(type: string, valuesText: string): Observable<void> {
    return this.http.put<void>(this.apiUrl + '/replace-from-textarea', { type, valuesText });
  }
}

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Comment} from './comment.model';
import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class CommentService {
  private baseUrl = environment.apiUrl + 'comments';

  constructor(private http: HttpClient) {}

  getComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/list`);
  }

  addComment(text: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/save`, {text});
  }

  updateComment(id: number, text: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/edit/${id}`, {text});
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}


import {Component, ElementRef, HostListener} from '@angular/core';
import {NgIf, NgForOf, DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {CommentService} from '../comment/comment.service';
import {Comment} from '../comment/comment.model';
import {FormsModule} from '@angular/forms';
import {ToasterService} from '../toaster/toaster.service';

@Component({
  selector: 'app-header',
  imports: [
    NgIf,
    NgForOf,
    DatePipe,
    FormsModule
  ],
  templateUrl: './header.component.html',
  standalone: true,
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(private elementRef: ElementRef,
              private router: Router,
              private authService: AuthService,
              private commentService: CommentService,
              private toasterService: ToasterService) {}

  calendarView: boolean = false;
  showLogoMenu: boolean = false;
  showComments: boolean = false;
  comments: Comment[] = [];
  newCommentText: string = '';
  editingCommentId: number | null = null;
  editingText: string = '';
  commentCount: number = 0;

  openCalendar() {
    this.calendarView = !this.calendarView;
  }

  closeCalendar() {
    this.calendarView = !this.calendarView;
  }

  toggleLogoMenu() {
    this.showLogoMenu = !this.showLogoMenu;
  }

  menuAction(option1: string) {
    if (option1 === 'logout') {
      this.authService.logout();
      this.showLogoMenu = false;
      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showLogoMenu = false;
    }
  }

  openInvoices() {
    this.router.navigate(['/invoices']);
  }

  openBusiness() {
    this.router.navigate(['/business']);
  }

  // Comments
  toggleComments() {
    this.showComments = !this.showComments;
    if (this.showComments) {
      this.loadComments();
    }
  }

  closeComments() {
    this.showComments = false;
    this.editingCommentId = null;
    this.editingText = '';
  }

  loadComments() {
    this.commentService.getComments().subscribe({
      next: (comments) => {
        this.comments = comments;
        console.log(this.comments);
        this.commentCount = comments.length;
      },
      error: () => {
        this.comments = [];
        this.commentCount = 0;
      }
    });
  }

  addComment() {
    const text = this.newCommentText.trim();
    if (!text) return;

    this.commentService.addComment(text).subscribe({
      next: () => {
        this.newCommentText = '';
        this.loadComments();
        this.toasterService.showMessage('Το σχόλιο προστέθηκε', 'success');
      },
      error: () => {
        this.toasterService.showMessage('Σφάλμα κατά την προσθήκη', 'error');
      }
    });
  }

  startEdit(comment: Comment) {
    this.editingCommentId = comment.id!;
    this.editingText = comment.text;
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editingText = '';
  }

  saveEdit(comment: Comment) {
    const text = this.editingText.trim();
    if (!text) return;

    this.commentService.updateComment(comment.id!, text).subscribe({
      next: () => {
        this.editingCommentId = null;
        this.editingText = '';
        this.loadComments();
        this.toasterService.showMessage('Το σχόλιο ενημερώθηκε', 'success');
      },
      error: () => {
        this.toasterService.showMessage('Σφάλμα κατά την ενημέρωση', 'error');
      }
    });
  }

  deleteComment(comment: Comment) {
    if (!confirm('Διαγραφή σχολίου;')) return;

    this.commentService.deleteComment(comment.id!).subscribe({
      next: () => {
        this.loadComments();
        this.toasterService.showMessage('Το σχόλιο διαγράφηκε', 'success');
      },
      error: () => {
        this.toasterService.showMessage('Σφάλμα κατά τη διαγραφή', 'error');
      }
    });
  }

  formatCommentDate(dateStr?: string): string {
    if (!dateStr) return '';
    // Handle "DD-MM-YYYY" or "DD-MM-YYYY HH:mm" format
    const parts = dateStr.split(' ');
    const datePart = parts[0];
    const timePart = parts.length > 1 ? parts[1] : '';

    const datePieces = datePart.split('-');
    if (datePieces.length === 3 && datePieces[0].length <= 2) {
      const [day, month, year] = datePieces;
      const monthNames = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαϊ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
      const monthName = monthNames[+month - 1] || month;
      return timePart ? `${day} ${monthName} ${year} ${timePart}` : `${day} ${monthName} ${year}`;
    }
    return dateStr;
  }
}

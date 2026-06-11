import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ParametricService} from '../parametric/parametric.service';
import {ToasterService} from '../toaster/toaster.service';

@Component({
  selector: 'app-settings',
  imports: [NgIf, NgForOf, NgClass, FormsModule],
  templateUrl: './settings.component.html',
  standalone: true,
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  @Output() close = new EventEmitter<void>();

  activeSection: string = 'parametric';
  parametricValues: string = '';
  whoValues: string = '';

  menuItems = [
    {id: 'parametric', label: 'Παραμετρικές Τιμές Τύπου'},
    {id: 'who', label: 'Παραμετρικές Τιμές Ποιος'}
  ];

  constructor(private parametricService: ParametricService,
              private toasterService: ToasterService) {}

  ngOnInit() {
    this.loadParametricValues();
   this.loadWhoValues();
  }

  selectSection(id: string) {
    this.activeSection = id;
  }

  loadParametricValues() {
    this.parametricService.getTextareaValues('work_type').subscribe({
      next: (data: string) => {
        this.parametricValues = data || '';
      },
      error: () => {
        this.parametricValues = '';
      }
    });
  }

  saveParametricValues() {
    this.parametricService.replaceFromTextarea('work_type', this.parametricValues).subscribe({
      next: () => {
        this.toasterService.showMessage('Οι τιμές αποθηκεύτηκαν', 'success');
      },
      error: () => {
        this.toasterService.showMessage('Σφάλμα κατά την αποθήκευση', 'error');
      }
    });
  }


  loadWhoValues() {
    this.parametricService.getTextareaValues('who').subscribe({
      next: (data: string) => { this.whoValues = data || ''; },
      error: () => { this.whoValues = ''; }
    });
  }

  saveWhoValues() {
    this.parametricService.replaceFromTextarea('who', this.whoValues).subscribe({
      next: () => { this.toasterService.showMessage('Οι τιμές αποθηκεύτηκαν', 'success'); },
      error: () => { this.toasterService.showMessage('Σφάλμα κατά την αποθήκευση', 'error'); }
    });
  }

  closeModal() {
    this.close.emit();
  }
}

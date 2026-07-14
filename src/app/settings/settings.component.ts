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
  areaValues: string = '';
  detailsValues: string = '';
  menuItems = [
    {id: 'parametric', label: 'Παραμετρικές Τιμές Τύπου'},
    {id: 'who', label: 'Παραμετρικές Τιμές Ποιος'},
    {id: 'area', label: 'Παραμετρικές Τιμές Περιοχή'},
    {id: 'details', label: 'Παραμετρικές Τιμές Λεπτομέρειες'}
  ];

  constructor(private parametricService: ParametricService,
              private toasterService: ToasterService) {}

  ngOnInit() {
    this.loadParametricValues();
    this.loadWhoValues();
    this.loadAreaValues();
    this.loadDetailsValues();
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

  loadAreaValues() {
    this.parametricService.getTextareaValues('area').subscribe({
      next: (data: string) => { this.areaValues = data || ''; },
      error: () => { this.areaValues = ''; }
    });
  }

  saveAreaValues() {
    this.parametricService.replaceFromTextarea('area', this.areaValues).subscribe({
      next: () => { this.toasterService.showMessage('Οι τιμές αποθηκεύτηκαν', 'success'); },
      error: () => { this.toasterService.showMessage('Σφάλμα κατά την αποθήκευση', 'error'); }
    });
  }

  loadDetailsValues() {
    this.parametricService.getTextareaValues('details').subscribe({
      next: (data: string) => { this.detailsValues = data || ''; },
      error: () => { this.detailsValues = ''; }
    });
  }

  saveDetailsValues() {
    this.parametricService.replaceFromTextarea('details', this.detailsValues).subscribe({
      next: () => { this.toasterService.showMessage('Οι τιμές αποθηκεύτηκαν', 'success'); },
      error: () => { this.toasterService.showMessage('Σφάλμα κατά την αποθήκευση', 'error'); }
    });
  }

  loadFromWhoValues() {
    // Removed: 'from_who' parametric values are no longer managed here.
  }

  saveFromWhoValues() {
    // Removed: not applicable when 'from_who' is not a parametric textarea
  }

  closeModal() {
    this.close.emit();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {BusinessService} from '../business/business.service';
import {FormsModule} from '@angular/forms';



@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  totalBusinesses = 0;
  totalIncome = 0;
  currentMonthName = '';
  fromDate!: string; // e.g., "2025-10-01"
  toDate!: string;   // e.g., "2025-10-31"

  constructor( private businessService: BusinessService,) {}

  async ngOnInit() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Format as yyyy-MM-dd (ISO without time)
    this.fromDate = firstDayOfMonth.toISOString().split('T')[0];
    this.toDate = lastDayOfMonth.toISOString().split('T')[0];

    this.currentMonthName = now.toLocaleString('default', { month: 'long' });

    await this.loadData();
  }

  async loadData() {
    this.businessService
      .getBusinessList(0, 10, '',this.fromDate, this.toDate, false, false, false)
      .subscribe({
        next: (response) => {
          console.log('Business list:', response);
          this.totalBusinesses=response.totalElements;
          this.totalIncome=response.content[0].totalIncome;
        },
        error: (err) => {
          console.error('Error loading business list:', err);
        }
    })
  }

  // calculateCurrentMonthIncome(businesses: any) {
  //   const now = new Date();
  //   const currentMonth = now.getMonth();
  //   const currentYear = now.getFullYear();
  //
  //   const monthlyBusinesses = businesses.filter(b => {
  //     const date = new Date(b.createdDate);
  //     return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  //   });
  //
  //   this.totalIncomeCurrentMonth = monthlyBusinesses.reduce((sum, b) => sum + (b.income || 0), 0);
  // }
  //
  // updateMonthlyChart() {
  //   const now = new Date();
  //   const currentYear = now.getFullYear();
  //
  //   const monthlyTotals = new Array(12).fill(0);
  //   businesses.forEach(b => {
  //     const date = new Date(b.createdDate);
  //     if (date.getFullYear() === currentYear) {
  //       monthlyTotals[date.getMonth()] += (b.income || 0);
  //     }
  //   });
  //
  //   this.barChartLabels = [
  //     'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  //     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  //   ];
  //
  //   this.barChartData = {
  //     labels: this.barChartLabels,
  //     datasets: [
  //       { data: monthlyTotals, label: 'Income', backgroundColor: '#10b981' }
  //     ]
  //   };
  // }
}

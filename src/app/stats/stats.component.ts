import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessService } from '../business/business.service';
import { Business } from '../business/business.model';
import { ChartModule } from 'primeng/chart';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule, InputTextModule, ButtonModule, CardModule],
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  allBusinessList: Business[] = [];
  filteredList: Business[] = [];

  dateFrom: string = '';
  dateTo: string = '';

  totalIncome: number = 0;

  pieData: any;
  pieOptions: any;
  whoBreakdown: { who: string; amount: number; color: string }[] = [];

  fromWhoPieData: any;
  fromWhoPieOptions: any;
  fromWhoBreakdown: { fromWho: string; amount: number; color: string }[] = [];

  typePieData: any;
  typePieOptions: any;
  typeBreakdown: { type: string; amount: number; color: string }[] = [];

  areaPieData: any;
  areaPieOptions: any;
  areaBreakdown: { area: string; amount: number; color: string }[] = [];

  barData: any;
  barOptions: any;

  feeBarData: any;
  feeBarOptions: any;

  constructor(private businessService: BusinessService) {}

  ngOnInit() {
    // Default range: current year
    const now = new Date();
    this.dateFrom = `${now.getFullYear()}-01-01`;
    this.dateTo = `${now.getFullYear()}-12-31`;

    this.businessService.getBusinessList().subscribe(list => {
      this.allBusinessList = list;
      this.applyFilter();
    });
  }

  applyFilter() {
    const from = this.dateFrom ? new Date(this.dateFrom) : null;
    const to = this.dateTo ? new Date(this.dateTo) : null;

    this.filteredList = this.allBusinessList.filter(b => {
      const bDate = this.parseDate(b.date as any);
      if (!bDate) return false;
      if (from && bDate < from) return false;
      if (to && bDate > to) return false;
      return true;
    });

    this.totalIncome = this.filteredList.reduce((sum, b) => sum + (b.fee || 0), 0);

    this.buildPieChart();
    this.buildTypePieChart();
    this.buildBarChart();
    this.buildFromWhoPieChart();
    this.buildAreaPieChart();
    this.buildFeeBarChart();
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length <= 2) {
      // DD-MM-YYYY
      return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    }
    // YYYY-MM-DD
    return new Date(dateStr);
  }

  private buildPieChart() {
    // Group by "who"
    const whoMap = new Map<string, number>();
    this.filteredList.forEach(b => {
      const who = b.who || 'Άγνωστο';
      whoMap.set(who, (whoMap.get(who) || 0) + (b.fee || 0));
    });

    const labels = Array.from(whoMap.keys());
    const data = Array.from(whoMap.values());

    const backgroundColors = this.generateColors(labels.length);

    this.whoBreakdown = labels.map((who, i) => ({
      who,
      amount: data[i],
      color: backgroundColors[i]
    })).sort((a, b) => b.amount - a.amount);

    this.pieData = {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundColors.map(c => c + 'CC')
      }]
    };

    this.pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${context.label}: ${value.toLocaleString('el-GR')}€ (${pct}%)`;
            }
          }
        }
      }
    };
  }

  private buildFromWhoPieChart() {
    const map = new Map<string, number>();
    this.filteredList.forEach(b => {
      const key = (b.fromWho && b.fromWho.trim()) || 'Άγνωστο';
      map.set(key, (map.get(key) || 0) + (b.fee || 0));
    });

    const labels = Array.from(map.keys());
    const data = Array.from(map.values());
    const backgroundColors = this.generateColors(labels.length);

    this.fromWhoBreakdown = labels.map((fromWho, i) => ({
      fromWho,
      amount: data[i],
      color: backgroundColors[i]
    })).sort((a, b) => b.amount - a.amount);

    this.fromWhoPieData = {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundColors.map(c => c + 'CC')
      }]
    };

    this.fromWhoPieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${context.label}: ${value.toLocaleString('el-GR')}€ (${pct}%)`;
            }
          }
        }
      }
    };
  }

  private buildTypePieChart() {
    const typeMap = new Map<string, number>();
    this.filteredList.forEach(b => {
      const type = b.type || 'Άγνωστο';
      typeMap.set(type, (typeMap.get(type) || 0) + (b.fee || 0));
    });

    const labels = Array.from(typeMap.keys());
    const data = Array.from(typeMap.values());
    const backgroundColors = this.generateColors(labels.length);

    this.typeBreakdown = labels.map((type, i) => ({
      type,
      amount: data[i],
      color: backgroundColors[i]
    })).sort((a, b) => b.amount - a.amount);

    this.typePieData = {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundColors.map(c => c + 'CC')
      }]
    };

    this.typePieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${context.label}: ${value.toLocaleString('el-GR')}€ (${pct}%)`;
            }
          }
        }
      }
    };
  }

  private buildAreaPieChart() {
    const map = new Map<string, number>();
    this.filteredList.forEach(b => {
      const key = (b.area && b.area.trim()) || 'Άγνωστο';
      map.set(key, (map.get(key) || 0) + (b.fee || 0));
    });

    const labels = Array.from(map.keys());
    const data = Array.from(map.values());
    const backgroundColors = this.generateColors(labels.length);

    this.areaBreakdown = labels.map((area, i) => ({
      area,
      amount: data[i],
      color: backgroundColors[i]
    })).sort((a, b) => b.amount - a.amount);

    this.areaPieData = {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundColors.map(c => c + 'CC')
      }]
    };

    this.areaPieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${context.label}: ${value.toLocaleString('el-GR')}€ (${pct}%)`;
            }
          }
        }
      }
    };
  }

  private buildBarChart() {
    const monthNames = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαϊ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];

    // Determine the year range from the filter
    const fromYear = this.dateFrom ? new Date(this.dateFrom).getFullYear() : new Date().getFullYear();
    const toYear = this.dateTo ? new Date(this.dateTo).getFullYear() : fromYear;

    // Build all months in range
    const allMonths: string[] = [];
    for (let y = fromYear; y <= toYear; y++) {
      for (let m = 1; m <= 12; m++) {
        allMonths.push(`${y}-${String(m).padStart(2, '0')}`);
      }
    }

    // Group data by month
    const monthMap = new Map<string, number>();
    allMonths.forEach(key => monthMap.set(key, 0));

    this.filteredList.forEach(b => {
      const d = this.parseDate(b.date as any);
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) || 0) + (b.fee || 0));
      }
    });

    const labels = allMonths.map(key => {
      const [year, month] = key.split('-');
      return fromYear === toYear ? monthNames[+month - 1] : `${monthNames[+month - 1]} ${year}`;
    });
    const data = allMonths.map(key => monthMap.get(key) || 0);

    this.barData = {
      labels,
      datasets: [{
        label: 'Αμοιβή (€)',
        data,
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
        borderWidth: 1,
        borderRadius: 6
      }]
    };

    this.barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.parsed.y.toLocaleString('el-GR')}€`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => `${value.toLocaleString('el-GR')}€`
          }
        }
      }
    };
  }

  private buildFeeBarChart() {
    const feeMap = new Map<string, number>();
    this.filteredList.forEach(b => {
      const details = b.details || 'Άγνωστο';
      feeMap.set(details, (feeMap.get(details) || 0) + (b.fee || 0));
    });

    const labels = Array.from(feeMap.keys());
    const data = Array.from(feeMap.values());

    this.feeBarData = {
      labels,
      datasets: [{
        label: 'Αμοιβή (€)',
        data,
        backgroundColor: '#66BB6A',
        borderColor: '#388E3C',
        borderWidth: 1,
        borderRadius: 6
      }]
    };

    this.feeBarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.parsed.y.toLocaleString('el-GR')}€`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => `${value.toLocaleString('el-GR')}€`
          }
        }
      }
    };
  }

  private generateColors(count: number): string[] {
    const palette = [
      '#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC',
      '#26C6DA', '#8D6E63', '#EC407A', '#7E57C2', '#26A69A',
      '#D4E157', '#FF7043', '#5C6BC0', '#29B6F6', '#9CCC65'
    ];
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }
}

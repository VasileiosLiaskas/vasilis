import { Pipe, PipeTransform } from '@angular/core';

@Pipe({standalone: true, name: 'invoiceTypeTranslate'})
export class InvoiceTypePipe implements PipeTransform {
  private translations: Record<string, string> = {
    FEE_INVOICE: 'Αμοιβής',
    PURCHASE_INVOICE: 'Αγοράς',
  };

  transform(value: string): string {
    return this.translations[value] || value;
  }
}

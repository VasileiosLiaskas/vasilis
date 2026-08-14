export class Invoice {
  public id!: number;
  public businessDate!: string;
  public fileName!: string;
  public date!: Date;
  public description!: string;
  public invoiceNumber!: string;
  public invoiceDate!: string;
  public invoiceType!: string;
  public businessId!: number;
  public editable:boolean= false;
}

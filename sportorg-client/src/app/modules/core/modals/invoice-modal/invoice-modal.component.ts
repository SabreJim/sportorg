import {AfterViewInit, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Invoice} from "../../models/data-objects";

@Component({
  selector: 'app-invoice-modal',
  templateUrl: './invoice-modal.component.html',
  styleUrls: ['./invoice-modal.component.scss']
})
export class InvoiceModalComponent implements AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public matDialogRef: MatDialogRef<InvoiceModalComponent>) {
  }

  public invoice: Invoice;
  public itemColumns = ['description', 'units', 'unitPrice', 'total'];
  ngAfterViewInit(): void {
    if (this.data && this.data.invoice) {
      if (this.data.invoice.balance && this.data.invoice.balance.indexOf) {
        this.data.invoice.status = (this.data.invoice.balance.indexOf('$0') === 0) ? 'PAID' : 'DUE';
      } else {
        this.data.invoice.status = 'DUE';
      }
      setTimeout(() => this.invoice = this.data.invoice );
    }
  }

}

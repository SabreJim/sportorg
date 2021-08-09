import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Company, Invoice, InvoiceItem} from "../../models/data-objects";
import {AppUser} from "../../models/authentication";
import {FirebaseAuthService} from "../../services/firebase-auth.service";
import { clone, equals } from 'ramda';
import {FinancialProxyService} from "../../services/financial-proxy.service";
import {jsPDF} from "jspdf";
import {ConfirmModalComponent} from "../confirm-modal/confirm-modal.component";
import {LookupItem} from "../../models/rest-objects";

@Component({
  selector: 'app-invoice-modal',
  templateUrl: './invoice-modal.component.html',
  styleUrls: ['./invoice-modal.component.scss']
})
export class InvoiceModalComponent implements AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public matDialogRef: MatDialogRef<InvoiceModalComponent>,
              public dialog: MatDialog,
              protected authService: FirebaseAuthService,
              protected financeService: FinancialProxyService) {
  };
  @ViewChild('invoiceCard') cardElement: ElementRef;
  public invoice: Invoice;
  public originalInvoice: Invoice;
  public itemColumns = ['description', 'units', 'unitPrice', 'total'];
  public isAdmin = false;
  public hideActions = false;
  public fromCompany: Company = null;
  public toCompany: Company = null;
  ngAfterViewInit(): void {
    if (this.data && this.data.invoice) {
      if (this.data.invoice.balance && this.data.invoice.balance.indexOf) {
        this.data.invoice.status = (this.data.invoice.balance.indexOf('$0') === 0) ? 'PAID' : 'DUE';
      } else {
        this.data.invoice.status = 'DUE';
      }
      if (this.data.invoice.fromType === 'company') {
        this.financeService.getCompany(this.data.invoice.fromId).subscribe((company: Company) => {
          this.fromCompany = company;
          console.log('fromComp', this.fromCompany);
        });
      }
      if (this.data.invoice.toType === 'company') {
        this.financeService.getCompany(this.data.invoice.toId).subscribe((company: Company) => {
          this.toCompany = company;
        });
      }
      // generate the total row
      const totalLine: InvoiceItem = {itemId: -2, description: 'Total', units: 1, unitPrice: 0};
      this.data.invoice.lineItems.map((item: InvoiceItem) => {
        totalLine.unitPrice = totalLine.unitPrice + (item.units * item.unitPrice);
      });
      this.data.invoice.lineItems.push(totalLine);

      setTimeout(() => { // show the record after the UI has settled
        this.invoice = this.data.invoice;
        this.originalInvoice = clone(this.invoice);
        if (this.data.printImmediate) {
          this.printPDF(() => {
            this.matDialogRef.close();
          })
        }
      } );
    } else { // this modal not used for new records
      this.matDialogRef.close();
    }
    this.authService.CurrentUser.subscribe((user: AppUser) => {
      if (user.isAnonymous === false) {
        this.isAdmin = user.isAdmin;
        if (this.isAdmin && (this.data && !this.data.printImmediate)) {
          this.itemColumns.push('edit');
        }
      }
    });
    this.authService.getSession();
  };

  public addLineItem = () => {
    const items = clone(this.invoice.lineItems);
    items.push({ itemId: -1, description: 'new item', units: 1, unitPrice: 0, updateDate: null, isEditing: true });
    this.invoice.lineItems = items;
  };

  public editRow = (lineItem: InvoiceItem) => {
    lineItem.isEditing = !lineItem.isEditing;
  };

  public updateSelection = (selectedId: number, fieldName: string) => {
    console.log('got company', selectedId, fieldName);
  }

  public canSave = () => {
    return this.isAdmin && !equals(this.invoice, this.originalInvoice);
  };
  public saveInvoice = () => {
    // send save request
    this.financeService.upsertInvoice(this.invoice).subscribe((success: boolean) => {
      if (success) {
        this.matDialogRef.close({ refresh: true });
      }
    });
  };
  public cancelInvoice = () => {
    const dialogRef = this.dialog.open(ConfirmModalComponent,
      { width: '350px', height: '240px', data: { title: `Cancel this invoice`,
          message: `Are you sure you want to cancel this invoice?`}});
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        // send the request to cancel the invoice
        this.financeService.cancelInvoice(this.invoice.invoiceId).subscribe((success: boolean) => {
          if (success) {
            this.matDialogRef.close({ refresh: true });
          }
        });
      }
    });
  };

  public printPDF = (afterPrint: () => void = null) => {
    console.log('found card', this.cardElement, this.invoice);
    const holdAdmin = this.isAdmin;
    this.isAdmin = false;
    this.hideActions = true; // prune out the mat-card-actions element
    const pdfGenerator = new jsPDF('p', 'pt', 'letter');
    // check the invoice to create a default file name
    const invoiceFileName = `${this.invoice.fromName}-invoice-${(this.invoice.dueDate) ? this.invoice.dueDate : this.invoice.updateDate}.pdf`;

    setTimeout(() => { // allow UI changes to render
      pdfGenerator.html(this.cardElement.nativeElement, {
        html2canvas: { scale: 0.8 },
        callback: (doc: jsPDF) => {
          doc.save(invoiceFileName);
          this.isAdmin = holdAdmin;
          this.hideActions = false;

          if (afterPrint) { // if there are operations to perform after the file is generated, run that now
            afterPrint();
          }
        }, x: 10, y: 10
      }).catch(() => { // revert state
        this.isAdmin = holdAdmin;
        this.hideActions = false;
      });
    });

  }

}

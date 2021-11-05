import {AfterViewInit, Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {AppMember, Invoice, Payment} from "../../models/data-objects";
import {Subscription} from "rxjs";
import {LookupItem} from "../../models/rest-objects";
import {LookupProxyService} from "../../services/lookup-proxy.service";

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent implements AfterViewInit {

  constructor(protected lookupProxy: LookupProxyService, @Inject(MAT_DIALOG_DATA) public data: any,
              public matDialogRef: MatDialogRef<PaymentModalComponent>) {
  }

  public payment: Payment;
  public members: LookupItem[] = [];
  public companies: LookupItem[] = [];
  protected allInvoices: Invoice[] = [];
  public memberInvoices: LookupItem[] = [];
  public paymentMethods: LookupItem[] = [
    { id: 1, name:'e-transfer', lookup: 'method'},
    { id: 2, name:'cash', lookup: 'method'},
    { id: 3, name:'cheque', lookup: 'method'},
    { id: 4, name:'credit card', lookup: 'method'}
    ];

  ngAfterViewInit(): void {
    let tempPayment: Payment = {
      paymentId: -1,
      fromId: null,
      fromType: 'member',
      toId: 1, // beaches
      toType: 'company',
      amount: 0,
      paymentMethod: 'e-transfer'
    }
    if (this.data && this.data.paymentId) {
      // use the provided payment if editing
    }
    this.lookupProxy.getLookup('companies').subscribe((items: LookupItem[]) => {
      this.companies = items;
    });

    setTimeout(() => {
      this.payment = tempPayment;
      if (this.data){
        if(this.data.members) {
          const tempMembers: LookupItem[] = [];
          this.data.members.map((m: any) => {
             tempMembers.push({
              id: m.memberId,
            name: `${m.firstName} ${m.lastName}`,
            lookup: 'member'
            });
          });
          this.members = tempMembers;
        }
        if (this.data.invoices) {
          this.allInvoices = this.data.invoices;
        }
      }
    });
  }

  public selectPayFrom = (event: LookupItem, source: string) => {
    if (!event || !event.id) return;
    this.payment.fromId = event.id;
    const tempInvoices: LookupItem[] = [];
    this.allInvoices.map((invoice: Invoice) => {
      if (source === 'company') {
        if (invoice.fromId === this.payment.fromId &&invoice.fromType === 'company') {
          tempInvoices.push({
            id: invoice.invoiceId,
            name: `${invoice.invoiceAmount} from: ${invoice.updateDate}`,
            lookup: 'invoice'
          });
        }
      } else {
        if (invoice.fromId === this.payment.fromId &&invoice.fromType !== 'company') {
          tempInvoices.push({
            id: invoice.invoiceId,
            name: `${invoice.invoiceAmount} from: ${invoice.updateDate}`,
            lookup: 'invoice'
          });
        }
      }
    });
    // set the payment from type
    this.payment.fromType = source;
    this.memberInvoices = tempInvoices;
  }
  public selectPayTo = (event: LookupItem, source: string) => {
    if (!event || !event.id) return;
    this.payment.toId = event.id;
    this.payment.fromType = source;
  }

  public selectInvoice = (event: LookupItem) => {
    if (!event || !event.id) return;
    this.payment.invoiceId = event.id;
  }

  public updateAmount = (event: number) => {
    this.payment.amount = event;

  }
  public selectMethod = (event: LookupItem) => {
    if (!event || !event.id) return;
    this.payment.paymentMethod = event.name;
  }

  public paymentValid = () => {
    return this.payment && this.payment.fromId > 0 && this.payment.toId > 0 && this.payment.amount && this.payment.fromType && this.payment.toType;
  }
  public savePayment = () => {
    if (!this.paymentValid()) return;

    this.matDialogRef.close(this.payment);
  }

}

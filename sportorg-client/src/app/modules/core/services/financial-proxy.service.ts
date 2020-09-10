import {RestProxyService} from "./rest-proxy.service";
import {Invoice, InvoiceItem, Payment} from "../models/data-objects";
import {Observable, Subject} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {SnackbarService} from "./snackbar.service";


@Injectable({providedIn: 'root'})
export class FinancialProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  public Invoices = new Subject<Invoice[]>();
  public Payments = new Subject<Payment[]>();

  // list program enrollments this user can see
  public getMyInvoices = () => {
      this.get('my-invoices/').subscribe((response: ApiResponse<Invoice[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error('Invoices could not be loaded at this time');
          this.Invoices.next([]);
        } else {
          this.Invoices.next(response.data || []);
        }
      }, (error: any) => {});
  };

  public getMyPayments = ()=> {
    this.get(`my-payments/`).subscribe((response: ApiResponse<Payment[]>) => {
      if (response.hasErrors()) {
        SnackbarService.error('Payments could not be loaded at this time');
        this.Payments.next([]);
      } else {
        this.Payments.next(response.data || []);
      }
    }, (error: any) => {});
  };
  public recordPayment = (payment: Payment): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('payment/', payment).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Payment could not be recorded as requested`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Payment was recorded successfully`);
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  // TODO: delete payment, delete invoice, view other's invoices, view other's payments
//   router.get('/my-invoices/user/:userId', adminRequired, Finances.getUsersInvoices);
//   router.put('/invoice/cancel/:invoiceId', adminRequired, Finances.cancelInvoice);
//   router.get('/my-payments/user/:userId', adminRequired, Finances.getUsersPayments);
}

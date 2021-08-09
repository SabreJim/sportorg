import {RestProxyService} from "./rest-proxy.service";
import {Company, Invoice, InvoiceItem, NewInvoice, Payment} from "../models/data-objects";
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
  protected companyCache: Company[] = null;

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
  public upsertInvoice = (invoice: Invoice): Observable<boolean> => {
    return new Observable((subscription) => {
      const body = {
        invoiceId: invoice.invoiceId,
        fromId: invoice.fromId,
        fromType: invoice.fromType,
        toId: invoice.toId,
        toType: invoice.toType,
        lineItems: invoice.lineItems
      };
      this.put('invoice/', body).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Invoice could not be saved as requested`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Invoice was saved successfully`);
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  public createInvoice = (newInvoice: NewInvoice): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('create-invoice/', newInvoice).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Invoice could not be created as requested`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Invoice was created successfully`);
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  public cancelInvoice = (invoiceId: number): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put(`invoice/cancel/${invoiceId}`, {}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Invoice could not be cancelled as requested`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Invoice was cancelled successfully`);
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  // TODO: delete payment, delete invoice, view other's invoices, view other's payments
//   router.get('/my-invoices/user/:userId', adminRequired, Finances.getUsersInvoices);
//   router.put('/invoice/cancel/:invoiceId', adminRequired, Finances.cancelInvoice);
//   router.get('/my-payments/user/:userId', adminRequired, Finances.getUsersPayments);

  // operate on company records
  public getCompanies = () => {
    return new Observable<Company[]>((subscription) => {
      if (this.companyCache && this.companyCache.length) {
        subscription.next(this.companyCache);
      } else {
        this.get(`companies/`).subscribe((response: ApiResponse<Company[]>) => {
          if (response.hasErrors()) {
            SnackbarService.error('Companies could not be loaded at this time');
            subscription.next([]);
          } else {
            this.companyCache = response.data;
            subscription.next(this.companyCache);
          }
        }, (error: any) => {});
      }
    })
  };

  public getCompany = (companyId: number): Observable<Company> => {
    return new Observable<Company>((subscription) => {
      if (this.companyCache && this.companyCache.length) {
        subscription.next(this.companyCache.find(c => c.companyId = companyId));
      } else {
        this.get(`companies/`).subscribe((response: ApiResponse<Company[]>) => {
          if (response.hasErrors()) {
            subscription.next(null);
          } else {
            this.companyCache = response.data;
            subscription.next(this.companyCache.find(c => c.companyId = companyId));
          }
        }, (error: any) => {});
      }
    })
  };

  public upsertCompany = (company: Company): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('company/', company).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Company could not be saved as requested`);
          subscription.next(false);
        } else {
          this.companyCache = [];
          SnackbarService.notify(`Company was saved successfully`);
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
}

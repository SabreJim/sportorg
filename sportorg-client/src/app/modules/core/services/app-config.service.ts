import {RestProxyService} from "./rest-proxy.service";
import {Company, Invoice, InvoiceItem, Payment} from "../models/data-objects";
import {Observable, Subject} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {SnackbarService} from "./snackbar.service";
import {ConfigRow} from "../models/ui-objects";


@Injectable({providedIn: 'root'})
export class AppConfigService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }

  // list program enrollments this user can see
  public getAppConfigs = () => {
    return new Observable<ConfigRow[]>((subscription) => {
      this.get('app-config/').subscribe((response: ApiResponse<any[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error('App configurations could not be loaded at this time');
          subscription.next([]);
        } else {
         subscription.next(response.data || []);
        }
      }, (error: any) => {});
    });
  };


  public updateConfigs = (config: any): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('app-config/', config).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`App configurations could not be updated as requested`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`App configurations were updated successfully`);
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  };
}

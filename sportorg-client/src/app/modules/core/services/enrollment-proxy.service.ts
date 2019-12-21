import {RestProxyService} from "./rest-proxy.service";
import {AppMember, Enrollment, RegistrationConfig} from "../models/data-objects";
import {Observable} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {SnackbarService} from "./snackbar.service";


@Injectable({providedIn: 'root'})
export class EnrollmentProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  public getMyEnrollments = (): Observable<Enrollment[]> => {
    return new Observable((subscription) => {
      this.get('my-enrollments/').subscribe((response: ApiResponse<Enrollment[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error('Class Enrollment could not be loaded at this time');
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
        }
      }, (error: any) => {});
    });
  };
  public enrollClass = (enrollmentBody: RegistrationConfig): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('enroll-class', enrollmentBody).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Class enrollment could not be completed as requested`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Class was enrolled in successfully`);
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

}

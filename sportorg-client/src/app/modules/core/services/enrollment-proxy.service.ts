import {RestProxyService} from "./rest-proxy.service";
import {AppMember, Enrollment, RegistrationConfig} from "../models/data-objects";
import {Observable} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";


@Injectable({providedIn: 'root'})
export class EnrollmentProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  public getMyEnrollments = (): Observable<Enrollment[]> => {
    return new Observable((subscription) => {
      this.get('my-enrollments/').subscribe((response: ApiResponse<Enrollment[]>) => {
        if (response.hasErrors()) {
          console.log('Error getting my enrollments', response.message);
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
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

}

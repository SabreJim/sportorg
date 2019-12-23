import {RestProxyService} from "./rest-proxy.service";
import {ClassRecord } from "../models/data-objects";
import {Observable} from "rxjs";
import {ApiResponse, IndexedCache} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {SnackbarService} from "./snackbar.service";


@Injectable({providedIn: 'root'})
export class ClassesProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  // cache any requested season of programs/classes
  protected classCache: ClassRecord[];

  public getAllClasses = (): Observable<ClassRecord[]> => {
    return new Observable((subscription) => {
      if (this.classCache && this.classCache.length) {
        subscription.next(this.classCache);
      } else {
        this.get('all-classes').subscribe((response: ApiResponse<ClassRecord[]>) => {
          if (response.hasErrors()) {
            SnackbarService.error(`Classes could not be retrieved at this time`);
            subscription.next([]);
          } else {
            if (response.data && response.data.length) {
              this.classCache = response.data;
            }
            subscription.next(response.data || []);
          }
        }, (error: any) => {});
      }
    });
  }

  public upsertClass = (classBody: ClassRecord): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('classes', classBody).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Classes were not updated successfully: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Classes updated successfully`);
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
  public deleteClass = (classBody: ClassRecord): Observable<boolean> => {
    return new Observable((subscription) => {
      const classId = classBody.scheduleId;
      if (!classId) { // no ID to delete on
        subscription.next(false);
      }
      this.delete(`classes/${classId}`).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Class was not deleted successfully: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Class deleted successfully`);
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
}

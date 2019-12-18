import {RestProxyService} from "./rest-proxy.service";
import {ClassRecord } from "../models/data-objects";
import {Observable} from "rxjs";
import {ApiResponse, IndexedCache} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";


@Injectable({providedIn: 'root'})
export class ClassesProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  // cache any requested season of programs/classes
  protected classCache: IndexedCache<ClassRecord[]> = { cache: [] };

  public getAllClasses = (seasonId: number = null): Observable<ClassRecord[]> => {
    return new Observable((subscription) => {
      if (seasonId !== -1 && this.classCache[seasonId]) {
        subscription.next(this.classCache[seasonId]);
      } else {
        const url = (seasonId === null) ? 'all-classes' : `all-classes?seasonId=${seasonId}`;
        this.get(url).subscribe((response: ApiResponse<ClassRecord[]>) => {
          if (response.hasErrors()) {
            console.log('Error getting programs', response.message);
            subscription.next([]);
          } else {
            if (seasonId !== -1) {
              this.classCache[seasonId] = response.data;
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
          subscription.next(false);
        } else {
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
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
}

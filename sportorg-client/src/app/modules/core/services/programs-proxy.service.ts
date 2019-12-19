import {RestProxyService} from "./rest-proxy.service";
import {ClassRecord, ProgramRecord} from "../models/data-objects";
import {Observable, Subject} from "rxjs";
import {ApiResponse, IndexedCache} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";


@Injectable({providedIn: 'root'})
export class ProgramsProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  public Programs = new Subject<ProgramRecord[]>();
  protected programCache: ProgramRecord[] = [];

  public getAllPrograms = (): Observable<ProgramRecord[]> => {
    return new Observable((subscription) => {
        this.get('all-programs/').subscribe((response: ApiResponse<ProgramRecord[]>) => {
          if (response.hasErrors()) {
            console.log('Error getting programs', response.message);
            subscription.next([]);
          } else {
            subscription.next(response.data || []);
          }
        }, (error: any) => {});
    });
  };
  public getPrograms = () => {
    if (this.programCache.length > 0) {
      this.Programs.next(this.programCache);
    } else {
      this.get('programs/').subscribe((response: ApiResponse<ProgramRecord[]>) => {
        if (response.hasErrors()) {
          console.log('Error getting programs', response.message);
          this.Programs.next([]);
        } else {
          this.programCache = response.data || [];
          this.Programs.next(this.programCache);
        }
      }, (error: any) => {});
    }
  };

  public upsertPrograms = (classBody: ProgramRecord): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('programs', classBody).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
  public deletePrograms = (programBody: ProgramRecord): Observable<boolean> => {
    return new Observable((subscription) => {
      const programId = programBody.programId;
      if (!programId) { // no ID to delete on
        subscription.next(false);
      }
      this.delete(`programs/${programId}`).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
}

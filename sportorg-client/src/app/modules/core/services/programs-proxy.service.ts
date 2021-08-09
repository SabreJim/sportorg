import {RestProxyService} from "./rest-proxy.service";
import {FeeStructure, ProgramRecord, Season} from "../models/data-objects";
import {Observable, Subject} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
import {Injectable} from "@angular/core";
import {SnackbarService} from "./snackbar.service";


@Injectable({providedIn: 'root'})
export class ProgramsProxyService extends RestProxyService {
  public Programs = new Subject<ProgramRecord[]>();
  protected programCache: ProgramRecord[] = [];

  public getAllPrograms = (): Observable<ProgramRecord[]> => {
    return new Observable((subscription) => {
        this.get('all-programs/').subscribe((response: ApiResponse<ProgramRecord[]>) => {
          if (response.hasErrors()) {
            SnackbarService.error('Programs could not be loaded at this time');
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
          SnackbarService.error('Programs could not be loaded at this time');
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
          SnackbarService.error(`Program was not updated successfully: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
          SnackbarService.notify(`Program was updated successfully`);
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
          SnackbarService.error(`Program was not updated successfully: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
          SnackbarService.notify(`Program was deleted successfully`);
        }
      }, (error: any) => {});
    });
  }

  public getSeasons = (): Observable<Season[]> => {
    return new Observable<Season[]>((subscription) => {
      this.get(`seasons/` ).subscribe((response: ApiResponse<Season[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        }
        subscription.next(response.data || []);
      });
    });
  }
  // update the exercise log and calculate any changes on the back end
  public upsertSeason = (season: Season): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('season', season).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
}

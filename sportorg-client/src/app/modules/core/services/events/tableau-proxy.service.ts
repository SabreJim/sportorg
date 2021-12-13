import {Injectable} from "@angular/core";
import {RestProxyService} from "../rest-proxy.service";
import {FilterRequest} from "../../filter-bar/filter-bar.component";
import {Observable} from "rxjs";
import {ScheduledEvent} from "../../models/data-objects";
import {ApiResponse} from "../../models/rest-objects";
import {SnackbarService} from "../snackbar.service";

@Injectable({providedIn: 'root'})
export class TableauProxyService extends RestProxyService {

  public createTableau = (eventId: number, eventRoundId: number): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put(`porthos/tableau/create-tablea/${eventId}/round/${eventRoundId}`, {}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`Tableau could not be created`);
          subscription.next(false);
        }
        subscription.next(true);
      });
    });
  }
}

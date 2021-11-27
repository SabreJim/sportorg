import {RestProxyService} from "../rest-proxy.service";
import {Observable} from "rxjs";
import {ApiResponse} from "../../models/rest-objects";
import {Injectable} from "@angular/core";
import {SnackbarService} from "../snackbar.service";
import {
  EventAthlete, EventPool, PoolOrderItem
} from "../../models/data-objects";


@Injectable({providedIn: 'root'})
export class PoolsProxyService extends RestProxyService {

  // get the list of athletes this user can access for the selected event
  public getRoundPools = (eventId: number, eventRoundId: number): Observable<EventPool[]> => {
    return new Observable<EventPool[]>((subscription) => {
      this.get(`porthos/pool-round/${eventId}/round/${eventRoundId}`).subscribe((response: ApiResponse<EventPool[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`Event pools could not be found`);
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }
  public getPool = (poolId: number): Observable<EventPool> => {
    return new Observable<EventPool>((subscription) => {
      this.get(`porthos/pool-details/${poolId}`).subscribe((response: ApiResponse<EventPool>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`Event pool could not be found`);
          subscription.next(null);
        }

        subscription.next(response.data);
      });
    });
  }

  public createPools = (eventId: number, eventRoundId: number): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put(`porthos/event-item/create-pools/${eventId}/round/${eventRoundId}`, {}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Pools could not be run for this event: ${response.message}`);
          subscription.next(false);
        } else {
          if (response?.data.poolsCleared) {
            SnackbarService.notify(`Pools cleared successfully`);
          } else {
            SnackbarService.notify(`Pools created successfully`);
          }
          subscription.next(true);
        }
      });
    });
  }

  public savePoolScore = (poolId: number, score: PoolOrderItem): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put(`porthos/pool-details/match-score/${poolId}`, score).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.eventId < 0) {
          SnackbarService.error(`Pool Score could not be run for this event: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Pool Score updated successfully`);
          subscription.next(true);
        }
      });
    });
  }
}

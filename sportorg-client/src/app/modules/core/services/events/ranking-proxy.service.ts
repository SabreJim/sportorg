import {Injectable} from "@angular/core";
import {RestProxyService} from "../rest-proxy.service";
import {FilterRequest} from "../../filter-bar/filter-bar.component";
import {Observable} from "rxjs";
import {Circuit, CircuitRanking, EventPoolAthlete, ScheduledEvent} from "../../models/data-objects";
import {ApiResponse} from "../../models/rest-objects";
import {SnackbarService} from "../snackbar.service";

@Injectable({providedIn: 'root'})
export class RankingProxyService extends RestProxyService {

  public getRankingsList = (filter: FilterRequest): Observable<Circuit[]> => {
    return new Observable<any[]>((subscription) => {
      this.get(`porthos/all-rankings/`, filter).subscribe((response: ApiResponse<Circuit[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`List of Rankings could not be found`);
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }

  public getRanking = (circuitId: number): Observable<CircuitRanking[]> => {
    return new Observable<CircuitRanking[]>((subscription) => {
      this.get(`porthos/ranking/${circuitId}`).subscribe((response: ApiResponse<CircuitRanking[]>) => {
        if (response.hasErrors() || !response?.data) {
          SnackbarService.error(`Rankings for this circuit could not be found`);
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }

  public updateRanking = (circuitId: number, eventValues: any[]): Observable<number> => {
    return new Observable<number>((subscription) => {
      this.put(`porthos/ranking/event/${circuitId}`, eventValues).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.scheduledEventId < 0) {
          SnackbarService.error(`Scheduled Event could not be update or inserted: ${response.message}`);
          subscription.next(-1);
        } else {
          if (response?.data?.scheduledEventId > 0) {
            SnackbarService.notify(`Event updated for: ${circuitId}`);
          } else {
            SnackbarService.notify(`Event created for: ${circuitId}`);
          }
          subscription.next(response?.data?.scheduledEventId);
        }
      }, (error: any) => {
      });
    });
  }

  public requestRankingUpdate = (): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put(`porthos/ranking/request-update/`, {}).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Rankings could not be updated from a third-party source: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Rankings have been update updated from an external source`);
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }
  public getCircuit = (circuitId: number): Observable<Circuit> => {
    return new Observable<Circuit>((subscription) => {
      this.get(`porthos/circuit/${circuitId}`).subscribe((response: ApiResponse<Circuit>) => {
        if (response.hasErrors() || !response?.data) {
          SnackbarService.error(`Ranking circuit details could not be found`);
          subscription.next(null);
        }
        subscription.next(response.data);
      });
    });
  }
  //   updateCircuit,
//   getCircuit
  public getEventRoundRanking = (eventId: number, eventRoundId: number): Observable<EventPoolAthlete[]> => {
    return new Observable<EventPoolAthlete[]>((subscription) => {
      this.get(`porthos/ranking/event/${eventId}/round/${eventRoundId}`).subscribe((response: ApiResponse<EventPoolAthlete[]>) => {
        if (response.hasErrors() || !response?.data) {
          SnackbarService.error(`Ranking for this round could not be found`);
          subscription.next(null);
        }
        subscription.next(response.data);
      });
    });
  }
}


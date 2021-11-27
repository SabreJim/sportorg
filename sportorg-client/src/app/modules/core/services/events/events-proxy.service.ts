import {RestProxyService} from "../rest-proxy.service";
import {Observable} from "rxjs";
import {ApiResponse} from "../../models/rest-objects";
import {Injectable} from "@angular/core";
import {SnackbarService} from "../snackbar.service";
import {FilterRequest} from "../../filter-bar/filter-bar.component";
import {
  EventAthlete, EventAthleteStatus,
  EventConfiguration,
  EventItem, EventRound,
  ScheduledEvent
} from "../../models/data-objects";
import {LookupProxyService} from "../lookup-proxy.service";
import {clone} from 'ramda';

@Injectable({providedIn: 'root'})
export class EventsProxyService extends RestProxyService {

  public getScheduledEvents = (filter: FilterRequest): Observable<ScheduledEvent[]> => {
    return new Observable<any[]>((subscription) => {
      this.get(`porthos/scheduled-events/`, filter).subscribe((response: ApiResponse<ScheduledEvent[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`List of Events could not be found`);
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }
  public getScheduledEvent = (scheduleEventId: number): Observable<ScheduledEvent> => {
    return new Observable<ScheduledEvent>((subscription) => {
      this.get(`porthos/scheduled-event/${scheduleEventId}`).subscribe((response: ApiResponse<ScheduledEvent>) => {
        if (response.hasErrors() || !response?.data?.scheduledEventId) {
          SnackbarService.error(`Scheduled Event could not be found`);
          subscription.next(null);
        }
        subscription.next(response.data);
      });
    });
  }

  public upsertScheduledEvent = (event: ScheduledEvent): Observable<number> => {
    return new Observable<number>((subscription) => {
      this.put('porthos/scheduled-event', event).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.scheduledEventId < 0) {
          SnackbarService.error(`Scheduled Event could not be update or inserted: ${response.message}`);
          subscription.next(-1);
        } else {
          if (response?.data?.scheduledEventId > 0) {
            SnackbarService.notify(`Event updated for: ${event.scheduledEventName}`);
          } else {
            SnackbarService.notify(`Event created for: ${event.scheduledEventName}`);
          }
          subscription.next(response?.data?.scheduledEventId);
        }
      }, (error: any) => {
      });
    });
  }

  public getEventsList = (scheduledEventId: number): Observable<EventItem[]> => {
    return new Observable<any[]>((subscription) => {
      this.get(`porthos/event-items/${scheduledEventId}`).subscribe((response: ApiResponse<EventItem[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`Event items could not be found`);
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }

  public getEventItem = (eventId: number): Observable<EventItem> => {
    return new Observable<EventItem>((subscription) => {
      this.get(`porthos/event-item/${eventId}`).subscribe((response: ApiResponse<EventItem>) => {
        if (response.hasErrors() || !response?.data?.scheduledEventId) {
          SnackbarService.error(`This Event could not be found`);
          subscription.next(null);
        }
        subscription.next(response.data);
      });
    });
  }
  public upsertEventItem = (event: EventItem): Observable<number> => {
    return new Observable<number>((subscription) => {
      this.put('porthos/event-item', event).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.eventId < 0) {
          SnackbarService.error(`Event could not be update or inserted: ${response.message}`);
          subscription.next(-1);
        } else {
          if (response?.data?.eventId > 0) {
            SnackbarService.notify(`Event updated for: ${event.eventName}`);
          } else {
            SnackbarService.notify(`Event created for: ${event.eventName}`);
          }
          subscription.next(response?.data?.eventId);
        }
      }, (error: any) => {
      });
    });
  }

  public getEventConfig = (eventId: number): Observable<EventConfiguration> => {
    return new Observable<EventConfiguration>((subscription) => {
      this.get(`porthos/event-config/${eventId}`).subscribe((response: ApiResponse<EventConfiguration>) => {
        if (response.hasErrors() || !response?.data?.eventId) {
          SnackbarService.error(`Event configuration could not be found`);
          subscription.next(null);
        }
        if (response?.data?.rounds) {
          response.data.rounds = response.data.rounds.map((r: EventRound) => {
            this.updateDescription(r);
            return r;
          });
        }
        subscription.next(response.data);
      });
    });
  }
  public getEventRegisteredAthletes = (eventId: number): Observable<EventAthlete[]> => {
    return new Observable<EventAthlete[]>((subscription) => {
      this.get(`porthos/event-config/athletes/${eventId}`).subscribe((response: ApiResponse<EventAthlete[]>) => {
        if (response.hasErrors() || !response?.data) {
          SnackbarService.error(`Registered athletes could not be found`);
          subscription.next(null);
        }
        subscription.next(response.data);
      });
    });
  }
  // get the list of athletes this user can access for the selected event
  public getEventAthletes = (eventId: number): Observable<EventAthlete[]> => {
    return new Observable<EventAthlete[]>((subscription) => {
      this.get(`porthos/my-event-athletes/${eventId}`).subscribe((response: ApiResponse<EventAthlete[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`Event athletes could not be found`);
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }
  // register, check-in, sign consent, etc for an athlete
  public setEventAthleteStatus = (eventId: number, athleteId: number, eventStatus: EventAthleteStatus): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put(`porthos/event-athlete/status/${eventId}/${athleteId}`, eventStatus).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.eventId < 0) {
          SnackbarService.error(`Athlete's status could not be update or inserted: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Athlete status updated`);
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }
  public addEventRound = (eventId: number): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put(`porthos/event-item/add-round/${eventId}`, {}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.eventId < 0) {
          SnackbarService.error(`A round could not be added to this event: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Event round added`);
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }
  public updateRound = (round: EventRound): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      if (round.poolRoundsUsed) {
        round.rankFromPoolsJson = JSON.stringify({pools: round.poolRoundsUsed});
      }
      this.put(`porthos/event-item/update-round/${round.eventId}`, round).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.eventId < 0) {
          SnackbarService.error(`A round could not be updated for this event: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Event round updated`);
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }
  public setEventStatus = (eventId: number, eventStatusId: number): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put(`porthos/event/${eventId}/status/${eventStatusId}`, {}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.eventId < 0) {
          SnackbarService.error(`Event's status could not be update or inserted: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Event status updated`);
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }

  public setEventRoundStatus = (eventId: number, eventRoundId: number,  eventStatusId: number): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put(`porthos/event/${eventId}/round/${eventRoundId}/status/${eventStatusId}`, {}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.eventId < 0) {
          SnackbarService.error(`Event round's status could not be updated: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Event round status updated`);
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }

  public promoteRoundAthletes = (eventId: number, eventRoundId: number): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.put(`porthos/event/${eventId}/round/${eventRoundId}/promote-athletes/`, {}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.eventId < 0) {
          SnackbarService.error(`Event round's status could not be updated: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Event round status updated`);
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }
  public deleteRound = (eventId: number, eventRoundId: number): Observable<boolean> => {
    return new Observable<boolean>((subscription) => {
      this.delete(`porthos/event-item/delete-round/${eventId}/${eventRoundId}`).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success || response?.data?.eventId < 0) {
          SnackbarService.error(`The round could not be deleted for this event: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Event round deleted`);
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }
  public rerunRankings = (eventId: number, circuitIds: number[]): Observable<boolean> => {
  return new Observable<boolean>((subscription) => {
    this.put(`porthos/event-item/run-rankings/${eventId}`, {circuitIds}).subscribe((response: ApiResponse<any>) => {
      if (response.hasErrors() || !response.success || response?.data?.eventId < 0) {
        SnackbarService.error(`Rankings could not be run for this event: ${response.message}`);
        subscription.next(false);
      } else {
        SnackbarService.notify(`Rankings run successfully`);
        subscription.next(true);
      }
      });
    });
  }

  public updateDescription = (round: EventRound) => {
    if (round.roundTypeId === 1) {
      if (!round.poolSizes) {
        round.roundDescription = 'Pools: not created yet';
      } else {
        round.roundDescription = `Pools: ${round.poolSizes}`;
      }
      round.roundName = `(R${round.eventRoundId})Pools`;
    } else if (round.roundTypeId === 2) {
      // process DE round
      let lastRound = '?';
      const foundOption = LookupProxyService.staticLookups.deLevelOptions.find(opt => opt.id === round.athletesPromoted);
      if (foundOption) {
        lastRound = foundOption.name;
      }
      round.roundDescription = `Tableau to ${lastRound}`;
      round.roundName = `(R${round.eventRoundId}) DE to ${lastRound}`;
    } else if (round.roundTypeId === 3) {
      try {
        round.poolRoundsUsed = (JSON.parse(round.rankFromPoolsJson)).pools;
      } catch (parseError) {
        round.poolRoundsUsed = [];
      }
      // description for selection format
      round.roundDescription = `Selection from Round ${round.eventRoundId}: ${round.promotedPercent || 100}% (${round.athletesPromoted})`;
      round.roundName = `Rankings (R${round.eventRoundId})`;
    }
  }
}

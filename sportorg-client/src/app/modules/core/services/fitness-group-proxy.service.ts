import {RestProxyService} from "./rest-proxy.service";
import {
  Exercise, FitnessGroup, FitnessGroupType, FitnessAgeCategory, FitnessGroupAthlete
} from "../models/fitness-objects";
import {Observable, Subject} from "rxjs";
import { ApiResponse } from "../models/rest-objects";
import { HttpClient } from "@angular/common/http";
import {Injectable} from "@angular/core";
import { Router} from "@angular/router";
import {SnackbarService} from "./snackbar.service";
import {StaticValuesService} from "./static-values.service";


@Injectable({providedIn: 'root'})
export class FitnessGroupProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }

  public getGroupsAdmin = (): Observable<FitnessGroup[]> => {
    return new Observable((subscription) => {
      this.get(`fitness/groups/admin/`).subscribe((response: ApiResponse<FitnessGroup[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`Groups could not be retrieved at this time`);
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
        }
      }, (error: any) => {});
    });
  }

  public getGroupExercises = (groupId: number) => {
    return new Observable<Exercise[]>((subscription) => {
      if (!(groupId > 0)) {
        subscription.next([]);
        return;
      }
      this.get(`fitness/group/exercises/${groupId}`).subscribe((response: ApiResponse<Exercise[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`Exercises could not be retrieved at this time`);
          subscription.next([]);
        } else {
          subscription.next(response.data);
        }
      }, (error: any) => {
      });
    });
  }

  public getGroupTypes = (groupId: number): Observable<FitnessGroupType[]> => {
  return new Observable((subscription) => {
      this.get(`fitness/groups/athlete-types/${groupId}/`).subscribe((response: ApiResponse<FitnessGroupType[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
        }
        }, (error: any) => {});
    });
}
  public getGroupAges = (groupId: number): Observable<FitnessAgeCategory[]> => {
    return new Observable((subscription) => {
      this.get(`fitness/groups/age-categories/${groupId}/`).subscribe((response: ApiResponse<FitnessAgeCategory[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
        }
      }, (error: any) => {
      });
    });
  }
  public getGroupAthletes = (groupId: number): Observable<FitnessGroupAthlete[]> => {
    return new Observable((subscription) => {
      this.get(`fitness/groups/athletes/${groupId}/`).subscribe((response: ApiResponse<FitnessGroupAthlete[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
        }
      }, (error: any) => {
      });
    });
  }

  public upsertGroup = (group: FitnessGroup): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put(`fitness/groups/`, group).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors()) {
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }
  public setSelectedExercise = (groupId: number, exerciseId: number, state: boolean): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put(`fitness/exercise-group`, {groupId, exerciseId, state}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors()) {
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }

  public inviteToGroup = (groupId: number, athleteId: number): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put(`fitness/groups/invite`, {groupId, athleteId}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors()) {
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }
  public removeFromGroup = (groupId: number, athleteId: number): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put(`fitness/groups/remove`, {groupId, athleteId}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors()) {
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }
}

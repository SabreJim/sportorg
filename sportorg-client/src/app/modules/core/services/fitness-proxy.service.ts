import {RestProxyService} from "./rest-proxy.service";
import {
  FitnessProfile,
  FitnessLogItem,
  Exercise,
  ExerciseLogResults,
  FitnessProfileStat, FitnessCompareResponse
} from "../models/fitness-objects";
import {Observable, Subject} from "rxjs";
import { ApiResponse } from "../models/rest-objects";
import { HttpClient } from "@angular/common/http";
import {Injectable} from "@angular/core";
import { Router} from "@angular/router";
import {SnackbarService} from "./snackbar.service";
import {StaticValuesService} from "./static-values.service";


@Injectable({providedIn: 'root'})
export class FitnessProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }

  public FitnessProfile: Subject<FitnessProfile> = new Subject<FitnessProfile>();
  public Exercises: Subject<Exercise[]> = new Subject<Exercise[]>();
  public ProfileCompare: Subject<FitnessCompareResponse> = new Subject<FitnessCompareResponse>();

  protected exerciseCache: Exercise[] = [];

  // get any profiles that this user can see
  public getMyFitnessProfiles = (): Observable<FitnessProfile[]> => {
    return new Observable((subscription) => {
        this.get('my-fitness-profiles').subscribe((response: ApiResponse<FitnessProfile[]>) => {
          if (response.hasErrors()) {
            SnackbarService.error(`Profiles could not be retrieved at this time`);
            subscription.next([]);
          } else {
            if (response.data && response.data.length) {
              const updatedProfiles: FitnessProfile[] = response.data.map(this.mapIcons);

              subscription.next(updatedProfiles);
            } else {
              subscription.next([]);
            }
          }
        }, (error: any) => {});
    });
  }

  protected mapIcons = (profile: FitnessProfile) => {
    profile.stats = profile.stats.map((stat: FitnessProfileStat) => {
      stat.icon = StaticValuesService.ICON_MAP[stat.name];
      return stat;
    });
    return profile;
  }

  // get the full profile of an athlete
  public getFitnessProfile = (athleteId: number) => {
    this.get(`fitness-profile/${athleteId}`).subscribe((response: ApiResponse<FitnessProfile>) => {
      if (response.hasErrors()) {
        SnackbarService.error(`Profile could not be retrieved at this time`);
        this.FitnessProfile.next(null);
        this.appRouter.navigate(['fitness-tracker']);
      } else {
        if (response.data && response.data.athleteId) {
          const updatedProfile: FitnessProfile = this.mapIcons(response.data);
          this.FitnessProfile.next(updatedProfile);
        } else {
          this.FitnessProfile.next(null);
          this.appRouter.navigate(['fitness-tracker']);
        }
      }
    }, (error: any) => {});
  }

  // add a fitness profile
  public createFitnessProfile = (newProfile: FitnessProfile): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('fitness-profile', newProfile).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Profile could not be created successfully: ${response.message}`);
          subscription.next(false);
        } else {
          SnackbarService.notify(`Profile created for : ${newProfile.firstName} ${newProfile.lastName}`);
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  // getExerciseLogs
  public getExerciseLogs = (athleteId): Observable<FitnessLogItem[]> => {
    return new Observable((subscription) => {
      this.get(`fitness-logs/${athleteId}`).subscribe((response: ApiResponse<FitnessLogItem[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`Profiles could not be retrieved at this time`);
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
        }
      }, (error: any) => {});
    });
  }

  // update the exercise log and calculate any changes on the back end
  public recordExerciseEvent = (newEvent: FitnessLogItem): Observable<ExerciseLogResults> => {
    return new Observable((subscription) => {
      this.put('exercise-event', newEvent).subscribe((response: ApiResponse<ExerciseLogResults>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`We couldn't record that exercise: ${response.message}`);
          subscription.next({athleteId: -1, levelUps: []});
        } else {
          subscription.next(response.data);
        }
      }, (error: any) => {});
    });
  }

  // remove an exerciseEvent that was recorded in error
  public deleteExerciseEvent = (eventId: number): Observable<ExerciseLogResults> => {
    return new Observable((subscription) => {
      this.delete(`exercise-event/${eventId}`).subscribe((response: ApiResponse<ExerciseLogResults>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Exercise was not deleted successfully: ${response.message}`);
          subscription.next({athleteId: -1, levelUps: []});
        } else {
          subscription.next(response.data);
        }
      }, (error: any) => {});
    });
  }

  public resetProfile = (athleteId: number): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put(`fitness-profile/reset/${athleteId}`, null).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Athlete could not be reset: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  // getAllExercises
  public getExercises = () => {
    if (this.exerciseCache && this.exerciseCache.length > 0){
      this.Exercises.next(this.exerciseCache);
      return;
    }
    this.get(`exercises/`).subscribe((response: ApiResponse<Exercise[]>) => {
      if (response.hasErrors()) {
        SnackbarService.error(`Exercises could not be retrieved at this time`);
        this.Exercises.next([]);
      } else {
        this.exerciseCache = response.data;
        this.Exercises.next(this.exerciseCache);
      }
    }, (error: any) => {});
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

  // compareMyFitness
  public runCompare = (athleteId: number, athleteTypes: number[], ageCategory: number) => {
    this.get(`compare-fitness/${athleteId}`, {athleteTypes: athleteTypes, ageCategory: ageCategory})
      .subscribe((response: ApiResponse<string>) => {
      if (response.hasErrors()) {
        SnackbarService.error(`Comparisons could not be retrieved at this time`);
        this.ProfileCompare.next({participants: 0, stats: []});
      } else {
        try {
          let parsed = (JSON.parse(response.data));
          this.ProfileCompare.next({stats: parsed.compareStats, participants: parsed.participants});
        } catch (parseErr) {
          this.ProfileCompare.next({participants: 0, stats: []});
        }
      }
    }, (error: any) => {});
  }

  public upsertExercise = (exercise: Exercise): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put(`exercise`, exercise).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Exercise could not be updated: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  // remove an exerciseEvent that was recorded in error
  public deleteExercise = (exerciseId: number): Observable<boolean> => {
    return new Observable((subscription) => {
      this.delete(`exercise/${exerciseId}`).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Exercise was not deleted successfully: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
}

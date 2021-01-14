import {RestProxyService} from "./rest-proxy.service";
import {
  FitnessProfile,
  FitnessLogItem,
  Exercise,
  ExerciseLogResults,
  FitnessProfileStat, FitnessCompareResponse, FitnessAgeCategory, FitnessGroupType, FitnessGroup
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
  protected lastAthleteExerciseId: number;

  // get any profiles that this user can see
  public getMyFitnessProfiles = (): Observable<FitnessProfile[]> => {
    return new Observable((subscription) => {
        this.get('fitness/my-fitness-profiles').subscribe((response: ApiResponse<FitnessProfile[]>) => {
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
    this.get(`fitness/fitness-profile/${athleteId}`).subscribe((response: ApiResponse<FitnessProfile>) => {
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
  public getMyGroups = (athleteId: number): Observable<FitnessGroup[]> => {
    return new Observable((subscription) => {
      this.get(`fitness/my-groups/${athleteId}`).subscribe((response: ApiResponse<FitnessGroup[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`Athlete Groups could not be retrieved at this time`);
          subscription.next([]);
        } else {
          subscription.next(response.data || []);
        }
      }, (error: any) => {});
    });
  }

  public getMyAgeCategories = (athleteId: number) => {
    return new Observable<FitnessAgeCategory[]>((subscription) => {
      this.get(`fitness/my-age-categories/${athleteId}`).subscribe((response: ApiResponse<FitnessAgeCategory[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        } else {
          subscription.next(response.data);
        }
      }, (error: any) => {
      });
    });
  }

  public getMyAthleteTypes = (athleteId: number) => {
    return new Observable<FitnessGroupType[]>((subscription) => {
      this.get(`fitness/my-athlete-types/${athleteId}`).subscribe((response: ApiResponse<FitnessGroupType[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        } else {
          subscription.next(response.data);
        }
      }, (error: any) => {
      });
    });
  }

  // add a fitness profile
  public createFitnessProfile = (newProfile: FitnessProfile): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('fitness/fitness-profile', newProfile).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Profile could not be created successfully: ${response.message}`);
          subscription.next(false);
        } else {
          if (newProfile.athleteId > 0) {
            SnackbarService.notify(`Profile updated for : ${newProfile.firstName} ${newProfile.lastName}`);
          } else {
            SnackbarService.notify(`Profile created for : ${newProfile.firstName} ${newProfile.lastName}`);
          }
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  // getExerciseLogs
  public getExerciseLogs = (athleteId): Observable<FitnessLogItem[]> => {
    return new Observable((subscription) => {
      this.get(`fitness/fitness-logs/${athleteId}`).subscribe((response: ApiResponse<FitnessLogItem[]>) => {
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
      this.put('fitness/exercise-event', newEvent).subscribe((response: ApiResponse<ExerciseLogResults>) => {
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
      this.delete(`fitness/exercise-event/${eventId}`).subscribe((response: ApiResponse<ExerciseLogResults>) => {
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
      this.put(`fitness/fitness-profile/reset/${athleteId}`, null).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Athlete could not be reset: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  // getAllExercises that are part of a group the athlete is in
  public getExercises = (athleteId: number) => {
    if (this.exerciseCache && this.exerciseCache.length && (athleteId === this.lastAthleteExerciseId )){
      this.Exercises.next(this.exerciseCache);
      return;
    }
    this.get(`fitness/my-exercises/${athleteId}`).subscribe((response: ApiResponse<Exercise[]>) => {
      if (response.hasErrors()) {
        SnackbarService.error(`Exercises could not be retrieved at this time`);
        this.Exercises.next([]);
      } else {
        this.exerciseCache = response.data;
        this.lastAthleteExerciseId = athleteId;
        this.Exercises.next(this.exerciseCache);
      }
    }, (error: any) => {});
  }

  // compareMyFitness
  public runCompare = (athleteId: number, athleteTypes: number[], ageCategory: number, groupId: number) => {
    this.get(`fitness/compare-fitness/${athleteId}`, {athleteTypes: athleteTypes, ageCategory: ageCategory, groupId})
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

  public upsertExercise = (exercise: Exercise, groupId: number): Observable<boolean> => {
    return new Observable((subscription) => {
      exercise.ownerGroupId = exercise.ownerGroupId || groupId;
      this.put(`fitness/exercise`, exercise).subscribe((response: ApiResponse<boolean>) => {
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
  public deleteExercise = (exercise: Exercise): Observable<boolean> => {
    return new Observable((subscription) => {
      this.delete(`fitness/exercise/${exercise.exerciseId}`).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.error(`Exercise was not deleted successfully: ${response.message}`);
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }


  public joinGroup = (groupId: number, athleteId: number): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put(`fitness/groups/join`, {groupId, athleteId}).subscribe((response: ApiResponse<any>) => {
        if (response.hasErrors()) {
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {
      });
    });
  }
  public leaveGroup = (groupId: number, athleteId: number): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put(`fitness/groups/leave`, {groupId, athleteId}).subscribe((response: ApiResponse<any>) => {
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

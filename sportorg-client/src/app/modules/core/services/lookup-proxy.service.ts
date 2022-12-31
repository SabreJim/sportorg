import {RestProxyService} from "./rest-proxy.service";
import {Observable, Subject} from "rxjs";
import {ApiResponse, LookupItem} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {MenuItem, AppStatus} from "../models/ui-objects";
import {SnackbarService} from "./snackbar.service";
import {FeeStructure} from "../models/data-objects";
import {clone} from 'ramda';


@Injectable({providedIn: 'root'})
export class LookupProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  // cached results for non-volatile lookup values
  protected feeCache: LookupItem[] = [];
  protected locationCache: LookupItem[] = [];
  protected programCache: LookupItem[] = [];
  protected seasonCache: LookupItem[] = [];
  protected regionCache: LookupItem[] = [];
  protected ageCategoryCache: LookupItem[] = [];
  protected athleteTypeCache: LookupItem[] = [];
  protected clubCache: LookupItem[] = [];
  protected appClubCache: LookupItem[] = [];
  protected companyCache: LookupItem[] = [];
  protected tagsCache: LookupItem[] = [];
  protected genderCache: LookupItem[] = [];
  protected eventStatusCache: LookupItem[] = [];

  public Subjects: Record<string, Subject<LookupItem[]>> = {
    fees: new Subject<LookupItem[]>(),
    locations: new Subject<LookupItem[]>(),
    programs: new Subject<LookupItem[]>(),
    seasons: new Subject<LookupItem[]>(),
    regions: new Subject<LookupItem[]>(),
    ageCategories: new Subject<LookupItem[]>(),
    athleteTypes: new Subject<LookupItem[]>(),
    clubs: new Subject<LookupItem[]>(),
    appClubs: new Subject<LookupItem[]>(),
    companies: new Subject<LookupItem[]>(),
    genders: new Subject<LookupItem[]>(),
    eventStatuses: new Subject<LookupItem[]>(),
  };
  public static staticLookups = {
    deLevelOptions: [
      {id: 0, checked: true, name: `Completion`, lookup: 'deLevel'},
      {id: 4, checked: true, name: `Semis(4)`, lookup: 'deLevel'},
      {id: 8, checked: true, name: `Top 8`, lookup: 'deLevel'},
      {id: 16, checked: true, name: `Top 16`, lookup: 'deLevel'},
      {id: 32, checked: true, name: `Top 32`, lookup: 'deLevel'}
    ]
  };
  protected pushLookups = () => {
    this.Subjects.fees.next(this.feeCache);
    this.Subjects.locations.next(this.locationCache);
    this.Subjects.programs.next(this.programCache);
    this.Subjects.seasons.next(this.seasonCache);
    this.Subjects.regions.next(this.regionCache);
    this.Subjects.ageCategories.next(this.ageCategoryCache);
    this.Subjects.athleteTypes.next(this.athleteTypeCache);
    this.Subjects.clubs.next(this.clubCache);
    this.Subjects.appClubs.next(this.appClubCache);
    this.Subjects.companies.next(this.companyCache);
    this.Subjects.genders.next(this.genderCache);
    this.Subjects.eventStatuses.next(this.eventStatusCache);
  };
  public refreshLookups = (repull: boolean = false) => {
    const extractLookup = (source: LookupItem[], name: string, byId: boolean = false) => {
      const matched = source.filter((lookup: LookupItem) => lookup.lookup === name);
      return matched.sort((a: LookupItem, b: LookupItem) => {
        if (byId) {
          if (a.id > b.id) return 1;
          if (a.id === b.id) return 0;
          return -1;
        }
        if (a.name > b.name) return 1;
        if (a.name === b.name) return 0;
        return -1;
      });
    }
    if (repull) {
      this.get(`lookups` ).subscribe((response: ApiResponse<LookupItem[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`There was a problem getting lookup items`);
          // dummy response so UI doesn't error out
          return { subject: new Subject<LookupItem[]>(), cache: [] };
        } else {
          this.feeCache = extractLookup(response.data, 'fees');
          this.locationCache = extractLookup(response.data,'locations');
          this.programCache = extractLookup(response.data, 'programs');
          this.seasonCache = extractLookup(response.data, 'seasons');
          this.regionCache = extractLookup(response.data, 'regions');
          this.ageCategoryCache = extractLookup(response.data, 'ageCategories', true);
          this.athleteTypeCache = extractLookup(response.data, 'athleteTypes');
          this.clubCache = extractLookup(response.data, 'clubs');
          this.appClubCache = extractLookup(response.data, 'appClubs');
          this.companyCache = extractLookup(response.data, 'companies');
          this.genderCache = extractLookup(response.data, 'genders');
          this.eventStatusCache = extractLookup(response.data, 'eventStatuses');
          this.pushLookups();
        }
      }, (error: any) => {});
    } else {
      this.pushLookups();
    }
  };

  public getLookup = (lookupName: string): Observable<LookupItem[]> => {
      return new Observable<LookupItem[]>((subscription) => {
        if (!this.Subjects[lookupName]) {
          //check for static sets
          if (LookupProxyService.staticLookups[lookupName]) {
            subscription.next(clone(LookupProxyService.staticLookups[lookupName]));
          } else {
            subscription.next([]);
          }
        }
        this.Subjects[lookupName].subscribe((items: LookupItem[]) => {
          subscription.next(items);
        });
        this.pushLookups();
      });
  }

  public getMenus = (): Observable<MenuItem[]> => {
    return new Observable<MenuItem[]>((subscription) => {
      this.get(`menus/` ).subscribe((response: ApiResponse<MenuItem[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error('There was an error getting menus');
          subscription.next([]);
        }
        subscription.next(response.data || []);
      });
    });
  }
  public getFeesAdmin = (): Observable<FeeStructure[]> => {
    return new Observable<FeeStructure[]>((subscription) => {
      this.get(`fees/` ).subscribe((response: ApiResponse<FeeStructure[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        }
        subscription.next(response.data || []);
      });
    });
  }
  // update the exercise log and calculate any changes on the back end
  public upsertFee = (fee: FeeStructure): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('fees', fee).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  // remove an exerciseEvent that was recorded in error
  public deleteFee = (fee: FeeStructure): Observable<boolean> => {
    return new Observable((subscription) => {
      this.delete(`fees/${fee.feeId}`).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }

  public getAppStatus = (): Observable<AppStatus[]> => {
    return new Observable<AppStatus[]>((subscription) => {
      this.get(`app-status/` ).subscribe((response: ApiResponse<AppStatus[]>) => {
        if (response.hasErrors()) {
          subscription.next([]);
        }
        subscription.next(response.data);
      });
    });
  }

  public getTags = (refresh: boolean = false) : Observable<LookupItem[]> => {
    return new Observable<LookupItem[]>((subscription) => {
      if (!this.tagsCache.length || refresh) {
        this.get('tags').subscribe((response: ApiResponse<LookupItem[]>) => {
          if (response.hasErrors()) {
            subscription.next([]);
          } else {
            this.tagsCache = response.data;
            subscription.next(response.data);
          }
        })
      } else {
        subscription.next(this.tagsCache);
      }
    });
  }

  public addTag = (tagName: string): Observable<boolean> => {
    return new Observable((subscription) => {
      this.put('tags', {tagName}).subscribe((response: ApiResponse<boolean>) => {
        if (response.hasErrors() || !response.success) {
          SnackbarService.notify('The tag could not be saved');
          subscription.next(false);
        } else {
          subscription.next(true);
        }
      }, (error: any) => {});
    });
  }
}

import {RestProxyService} from "./rest-proxy.service";
import {FeeStructure, ClassRecord} from "../models/data-objects";
import {Observable, of, Subject} from "rxjs";
import {ApiResponse, IndexedCache, LookupItem} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {MenuItem} from "../models/ui-objects";
import {SnackbarService} from "./snackbar.service";


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


  public Subjects: Record<string, Subject<LookupItem[]>> = {
    fees: new Subject<LookupItem[]>(),
    locations: new Subject<LookupItem[]>(),
    programs: new Subject<LookupItem[]>(),
    seasons: new Subject<LookupItem[]>()
  };

  protected pushLookups = () => {
    this.Subjects.fees.next(this.feeCache);
    this.Subjects.locations.next(this.locationCache);
    this.Subjects.programs.next(this.programCache);
    this.Subjects.seasons.next(this.seasonCache);
  };
  public refreshLookups = (repull: boolean = false) => {
    if (repull) {
      this.get(`lookups` ).subscribe((response: ApiResponse<LookupItem[]>) => {
        if (response.hasErrors()) {
          SnackbarService.error(`There was a problem getting lookup items`);;
          // dummy response so UI doesn't error out
          return { subject: new Subject<LookupItem[]>(), cache: [] };
        } else {

          this.feeCache = response.data.filter((lookup: LookupItem) => lookup.lookup === 'fees');
          this.locationCache = response.data.filter((lookup: LookupItem) => lookup.lookup === 'locations');
          this.programCache = response.data.filter((lookup: LookupItem) => lookup.lookup === 'programs');
          this.seasonCache = response.data.filter((lookup: LookupItem) => lookup.lookup === 'seasons');
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
          subscription.next([]);
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
}

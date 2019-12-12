import {RestProxyService} from "./rest-proxy.service";
import {FeeStructure, ClassRecord} from "../models/data-objects";
import {Observable, of, Subject} from "rxjs";
import {ApiResponse, IndexedCache, LookupItem} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";


@Injectable({providedIn: 'root'})
export class LookupProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  // cached results for non-volatile lookup values
  public AllFees: Subject<FeeStructure[]> = new Subject<FeeStructure[]>();
  public AllPrograms: Subject<ClassRecord[]> = new Subject<ClassRecord[]>();
  protected programsCache: IndexedCache<ClassRecord[]> = { cache: [] };
  protected feesCache: FeeStructure[] = [];

  protected feeCache: LookupItem[] = [];
  protected locationCache: LookupItem[] = [];
  protected programLevelCache: LookupItem[] = [];
  protected seasonCache: LookupItem[] = [];


  public Subjects: Record<string, Subject<LookupItem[]>> = {
    fees: new Subject<LookupItem[]>(),
    locations: new Subject<LookupItem[]>(),
    programLevels: new Subject<LookupItem[]>(),
    seasons: new Subject<LookupItem[]>()
  };

  public getPrograms = (seasonId: number = null)=> {
    if (this.programsCache[seasonId]) {
      this.AllPrograms.next(this.programsCache[seasonId]);
    } else {
        this.get(`programs/${seasonId}` ).subscribe((response: ApiResponse<ClassRecord[]>) => {
          if (response.hasErrors()) {
            console.log('Error getting programs', response.message);
          }
          if (seasonId) {
            this.programsCache[seasonId] = response.data;
            this.AllPrograms.next(this.programsCache[seasonId]);
          } else {
            this.AllPrograms.next(response.data);
          }

        });
    }
    return this.AllPrograms;
  }

  protected pushLookups = () => {
    this.Subjects.fees.next(this.feeCache);
    this.Subjects.locations.next(this.locationCache);
    this.Subjects.programLevels.next(this.programLevelCache);
    this.Subjects.seasons.next(this.seasonCache);
  };
  public refreshLookups = (repull: boolean = false) => {
    if (repull) {
      this.get(`lookups` ).subscribe((response: ApiResponse<LookupItem[]>) => {
        if (response.hasErrors()) {
          console.log('Error getting lookups', response.message);
          // dummy response so UI doesn't error out
          return { subject: new Subject<LookupItem[]>(), cache: [] };
        } else {

          this.feeCache = response.data.filter((lookup: LookupItem) => lookup.lookup === 'fees');
          this.locationCache = response.data.filter((lookup: LookupItem) => lookup.lookup === 'locations');
          this.programLevelCache = response.data.filter((lookup: LookupItem) => lookup.lookup === 'program_levels');
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

  public getFees = ()=> {
    if (this.feesCache && this.feesCache.length > 0) {
      this.AllFees.next(this.feesCache);
    } else {
      this.get(`fees/` ).subscribe((response: ApiResponse<FeeStructure[]>) => {
        if (response.hasErrors()) {
          console.log('Error getting fees', response.message);
        }
        this.feesCache = response.data;
        this.AllFees.next(this.feesCache);
      });
    }
  }
}

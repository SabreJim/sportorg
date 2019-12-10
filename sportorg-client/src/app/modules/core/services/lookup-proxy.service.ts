import {RestProxyService} from "./rest-proxy.service";
import {FeeStructure, ProgramDescription, ProgramSeason} from "../models/data-objects";
import {Observable, of, Subject} from "rxjs";
import {ApiResponse, IndexedCache, LookupItem} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {head, filter} from 'ramda';


@Injectable({providedIn: 'root'})
export class LookupProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  // cached results for non-volatile lookup values
  protected seasonCache: ProgramSeason[] = [];
  public AllFees: Subject<FeeStructure[]> = new Subject<FeeStructure[]>();
  public AllPrograms: Subject<ProgramDescription[]> = new Subject<ProgramDescription[]>();
  protected programsCache: IndexedCache<ProgramDescription[]> = { cache: [] };
  protected feesCache: FeeStructure[] = [];
  // newer pattern for lookups
  protected feeCache: LookupItem[] = [];
  protected locationCache: LookupItem[] = [];
  protected programLevelCache: LookupItem[] = [];
  protected seasonCache2: LookupItem[] = [];

  public Subjects: Record<string, Subject<LookupItem[]>> = {
    fees: new Subject<LookupItem[]>(),
    locations: new Subject<LookupItem[]>(),
    programLevels: new Subject<LookupItem[]>(),
    seasons: new Subject<LookupItem[]>()
  };


  public getBestUpcomingSeason = (seasons: ProgramSeason[]) => {
    const now = new Date();
    now.setMonth(now.getUTCMonth() - 3);
    const firstMatch = head(filter((season: ProgramSeason) => {
      return season.endDate > now.toISOString();
    }, seasons));

    return (firstMatch) ? firstMatch : seasons[0];
  };

  public getSeasons = (): Observable<ProgramSeason[]> => {
    if (this.seasonCache.length > 0) {
      return of(this.seasonCache);
    } else {
      return new Observable<ProgramSeason[]>((subscription) => {
        this.get('seasons' ).subscribe((response: ApiResponse<ProgramSeason[]>) => {
          if (response.hasErrors()) {
            console.log('Error getting seasons', response.message);
          }
          this.seasonCache = response.data;
          subscription.next(response.data);
        })
      });
    }
  }

  public getPrograms = (seasonId: number)=> {
    if (this.programsCache[seasonId]) {
      this.AllPrograms.next(this.programsCache[seasonId]);
    } else {
        this.get(`programs/${seasonId}` ).subscribe((response: ApiResponse<ProgramDescription[]>) => {
          if (response.hasErrors()) {
            console.log('Error getting programs', response.message);
          }
          this.programsCache[seasonId] = response.data;
          this.AllPrograms.next(this.programsCache[seasonId]);
        });
    }
    return this.AllPrograms;
  }

  public getAllClasses = (): Observable<ProgramDescription[]> => {
    return new Observable((subscription) => {
      this.get(`all-classes` ).subscribe((response: ApiResponse<ProgramDescription[]>) => {
        if (response.hasErrors()) {
          console.log('Error getting programs', response.message);
          subscription.next([]);
        } else {
          subscription.next(response.data);
        }

      }, (error: any) => {});
    })
  }

  public refreshLookups = (repull: boolean = false) => {
    if (repull) {
      this.get(`lookups` ).subscribe((response: ApiResponse<LookupItem[]>) => {
        if (response.hasErrors()) {
          console.log('Error getting lookups', response.message);
          // dummy response so UI doesn't error out
          return { subject: new Subject<LookupItem[]>(), cache: [] };
        } else {
          console.log('split up by type', response.data);
          this.feeCache = response.data.filter((lookup: LookupItem) => lookup.lookup === 'fees');
          this.locationCache = response.data.filter((lookup: LookupItem) => lookup.lookup === 'locations');
          this.programLevelCache = response.data.filter((lookup: LookupItem) => lookup.lookup === 'program_levels');
          this.seasonCache2 = response.data.filter((lookup: LookupItem) => lookup.lookup === 'seasons');

          this.Subjects.fees.next(this.feeCache);
          this.Subjects.locations.next(this.locationCache);
          this.Subjects.programLevels.next(this.programLevelCache);
          this.Subjects.seasons.next(this.seasonCache2);
        }
      }, (error: any) => {});
    } else {
      this.Subjects.fees.next(this.feeCache);
      this.Subjects.locations.next(this.locationCache);
      this.Subjects.programLevels.next(this.programLevelCache);
      this.Subjects.seasons.next(this.seasonCache2);
    }

  };

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

import {RestProxyService} from "./rest-proxy.service";
import {FeeStructure, ProgramDescription, ProgramSeason} from "../models/data-objects";
import {Observable, of, Subject} from "rxjs";
import {ApiResponse, IndexedCache} from "../models/rest-objects";
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

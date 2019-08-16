import {RestProxyService} from "./rest-proxy.service";
import {ProgramLevel, ProgramSeason} from "../models/data-objects";
import {Observable, of} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
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
  protected AllSeasons: ProgramSeason[] = [];
  protected AllPrograms: ProgramLevel[] = [];



  public getBestUpcomingSeason = (seasons: ProgramSeason[]) => {
    const now = new Date();
    now.setMonth(now.getUTCMonth() - 3);
    return head(filter((season: ProgramSeason) => {
      return season.endDate > now.toISOString();
    }, seasons));
  };

  public getSeasons = (): Observable<ProgramSeason[]> => {
    if (this.AllSeasons.length > 0) {
      return of(this.AllSeasons);
    } else {
      return new Observable<ProgramSeason[]>((subscription) => {
        this.get('seasons' ).subscribe((response: ApiResponse) => {
          if (response.hasErrors()) {
            console.log('Error getting seasons', response.message);
          }
          console.log('GOT BACK', response);
          this.AllSeasons = response.data;
          subscription.next(response.data);
        })
      });
    }

  }
}

import {RestProxyService} from "./rest-proxy.service";
import {Class, ProgramSchedule} from "../models/data-objects";
import {Observable, Subject} from "rxjs";
import {ApiResponse, IndexedCache} from "../models/rest-objects";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";


@Injectable({providedIn: 'root'})
export class ClassesProxyService extends RestProxyService {
  constructor(http: HttpClient, appRouter: Router) {
    super(http, appRouter);
  }
  // Subjects that any consumer can watch
  public AllClasses: Subject<ProgramSchedule[]> = new Subject<ProgramSchedule[]>();
  protected classCache: IndexedCache<ProgramSchedule[]> = { cache: [] };

  public getClasses = (seasonId: number): void => {
    if (this.classCache[seasonId]) {
      this.AllClasses.next(this.classCache[seasonId]);
    } else {
      this.get('classes', {seasonId: seasonId} ).subscribe((response: ApiResponse<ProgramSchedule[]>) => {
        if (response.hasErrors()) {
          console.log('Error getting classes', response.message);
        }
        this.classCache[seasonId] = response.data;
        this.AllClasses.next(this.classCache[seasonId]);
      });
    }
  }
}

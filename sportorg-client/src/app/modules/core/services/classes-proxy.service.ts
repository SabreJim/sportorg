import {RestProxyService} from "./rest-proxy.service";
import {Class, ProgramSchedule} from "../models/data-objects";
import {Observable, Subject} from "rxjs";
import {ApiResponse} from "../models/rest-objects";
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

  public getClasses = (seasonId: number): void => {
    this.get('classes', {seasonId: seasonId} ).subscribe((response: ApiResponse) => {
      if (response.hasErrors()) {
        console.log('Error getting classes', response.message);
      }
      this.AllClasses.next(response.data);
    })
  }
}

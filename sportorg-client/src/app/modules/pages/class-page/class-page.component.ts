import {Component, OnDestroy, OnInit, SecurityContext} from '@angular/core';
import {ProgramDescription, ProgramSchedule, ProgramSeason} from "../../core/models/data-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {Subscription} from "rxjs";
import {ORG_COLORS, RecurringScheduleItem} from "../../core/models/ui-objects";
import {map} from 'ramda';
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-class-page',
  templateUrl: './class-page.component.html',
  styleUrls: [
    '../shared-page.scss',
    './class-page.component.scss'
  ]
})
export class ClassPageComponent implements OnInit, OnDestroy {
  private _selectedSeason: ProgramSeason;
  public get selectedSeason(): ProgramSeason {
    return this._selectedSeason;
  }public set selectedSeason(newSeason: ProgramSeason) {
    if (newSeason) {
      this._selectedSeason = newSeason;
      this.classProxy.getClasses(newSeason.seasonId);
      this.lookupProxy.getPrograms(newSeason.seasonId);
    }
  }

  public compareSeasons = (s1: ProgramSeason, s2: ProgramSeason) => {
    return s1.seasonId === s2.seasonId;
  }

  private classSubscription: Subscription;
  private programSubscription: Subscription;
  public availableSeasons: ProgramSeason[] = [];

  public currentScheduleItems: RecurringScheduleItem[] = [];
  public seasonDate: Date;

  public currentPrograms: ProgramDescription[] = [];

  constructor(protected lookupProxy: LookupProxyService, protected classProxy: ClassesProxyService,
              private appRouter: Router) {
    appRouter.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // get the 'fragment' and scroll the html anchor into view
        const tree = appRouter.parseUrl(appRouter.url);
        if (tree.fragment) {
          const element = document.querySelector("#" + tree.fragment);
          if (element) {
            setTimeout(() => {
              element.scrollIntoView(true) ;
            });
          }
        }
      }
    });
  }

  ngOnInit() {

    this. programSubscription = this.lookupProxy.AllPrograms.subscribe((programs: ProgramDescription[]) => {
      programs = map((program) => {
        program.expanded = true;
        program.colorValue = ORG_COLORS[program.colorId].secondary;
        return program;
      }, programs);
      this.currentPrograms = programs;
    });
    this.classSubscription = this.classProxy.AllClasses.subscribe((scheduleItems: ProgramSchedule[]) => {
      this.currentScheduleItems = map((item: ProgramSchedule) => {
        return new RecurringScheduleItem(item);
      }, scheduleItems);
    });
    // this can return from cache before the dependant subscriptions are added
    this.lookupProxy.getSeasons().subscribe((seasons: ProgramSeason[]) => {
      this.availableSeasons = seasons;
      if (seasons.length > 0) {
        this.selectedSeason = this.lookupProxy.getBestUpcomingSeason(seasons);
      }
    });
  }

  ngOnDestroy(): void {
    this.classSubscription.unsubscribe();
    this.programSubscription.unsubscribe();
  }

}

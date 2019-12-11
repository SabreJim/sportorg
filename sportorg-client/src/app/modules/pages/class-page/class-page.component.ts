import {Component, OnDestroy, OnInit, SecurityContext} from '@angular/core';
import {ClassRecord, ProgramSchedule, ProgramSeason} from "../../core/models/data-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {Subscription} from "rxjs";
import {ORG_COLORS} from "../../core/models/ui-objects";
import {join, map, pluck, uniq} from 'ramda';
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
  public compareSeasons = (s1: ProgramSeason, s2: ProgramSeason) => {
    return s1 && s2 && s1.seasonId === s2.seasonId;
  }
  private programSubscription: Subscription;
  public availableSeasons: ProgramSeason[] = [];

  public currentPrograms: ClassRecord[] = [];

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
    this. programSubscription = this.lookupProxy.AllPrograms.subscribe((programs: ClassRecord[]) => {
      programs = map((program) => {
        program.expanded = true;
        program.colorValue = ORG_COLORS[program.colorId].secondary;
        try {
          program.daysText = uniq(JSON.parse(program.daysOfWeek));
        } catch {
          program.daysText = '';
        }
        return program;
      }, programs);
      this.currentPrograms = programs;
    });
    this.lookupProxy.getPrograms();
  }

  ngOnDestroy(): void {
    this.programSubscription.unsubscribe();
  }

}

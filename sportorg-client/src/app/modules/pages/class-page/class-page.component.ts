import {Component, OnDestroy, OnInit} from '@angular/core';
import {ClassRecord, ProgramRecord} from "../../core/models/data-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {Subscription} from "rxjs";
import {join, map, pluck, uniq} from 'ramda';
import {NavigationEnd, Router} from "@angular/router";
import {StaticValuesService} from "../../core/services/static-values.service";
import {ProgramsProxyService} from "../../core/services/programs-proxy.service";

@Component({
  selector: 'app-class-page',
  templateUrl: './class-page.component.html',
  styleUrls: [
    '../shared-page.scss',
    './class-page.component.scss'
  ]
})
export class ClassPageComponent implements OnInit, OnDestroy {
  private programSubscription: Subscription;

  public currentPrograms: ProgramRecord[] = [];

  constructor(protected lookupProxy: LookupProxyService, protected classProxy: ClassesProxyService,
              private appRouter: Router, private programProxy: ProgramsProxyService) {
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
    this. programSubscription = this.programProxy.Programs.subscribe((programs: ProgramRecord[]) => {
      programs = map((program) => {
        program.expanded = true;
        program.colorValue = StaticValuesService.ORG_COLORS[program.colorId].secondary;
        try {
          program.daysText = uniq(JSON.parse(program.daysOfWeek));
        } catch {
          program.daysText = '';
        }
        return program;
      }, programs);
      this.currentPrograms = programs;
    });
    this.programProxy.getPrograms();
  }

  ngOnDestroy(): void {
    this.programSubscription.unsubscribe();
  }

}

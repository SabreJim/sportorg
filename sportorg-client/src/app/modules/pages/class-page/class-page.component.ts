import {Component, OnDestroy, OnInit} from '@angular/core';
import {ClassRecord, ProgramRecord} from "../../core/models/data-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {Subscription} from "rxjs";
import {clone} from 'ramda';
import {NavigationEnd, Router} from "@angular/router";
import {StaticValuesService} from "../../core/services/static-values.service";
import {ProgramsProxyService} from "../../core/services/programs-proxy.service";
import {LookupItem} from "../../core/models/rest-objects";

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
  public seasons: LookupItem[] = [];
  public defaultSeason: LookupItem;
  public currentSeason: LookupItem;

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
  public selectSeason = (season: LookupItem) => {
    if (season && season.id) {
      this.currentSeason = season;
      this.programProxy.getPrograms(season.id);
    } else {
      this.currentSeason = null;
    }
  };

  ngOnInit() {
    this. programSubscription = this.programProxy.Programs.subscribe((programs: ProgramRecord[]) => {
      programs = programs.map((program: ProgramRecord) => {
        program.expanded = true;
        program.colorValue = StaticValuesService.ORG_COLORS[program.colorId].secondary;
        try {
          const classes = JSON.parse(program.classes);
          const days: string[] = [];
          classes.map((c: any) => {
            if (days.indexOf(c.dayOfWeek) === -1) {
              days.push(c.dayOfWeek);
            }
          });
          program.daysText = days.join(', '); // not actually using this right now
        } catch {
          program.daysText = '';
        }
        return program;
      });
      this.currentPrograms = programs;
    });

    this.lookupProxy.getLookup('seasons').subscribe((items: LookupItem[]) => {
      this.seasons = items;
      const currentSeason = items.find(i => i.id === parseInt(i.otherId));
      this.selectSeason(currentSeason);
      this.defaultSeason = clone(currentSeason);
    });
  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.programSubscription]);
  }

}

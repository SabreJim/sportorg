import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProgramRecord} from "../../core/models/data-objects";
import {Subscription} from "rxjs";
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
  public currentSeason: LookupItem;

  constructor(private appRouter: Router, private programProxy: ProgramsProxyService) {
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

  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.programSubscription]);
  }

}

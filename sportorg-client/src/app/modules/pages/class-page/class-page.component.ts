import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Class, ProgramSchedule, ProgramSeason} from "../../core/models/data-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {Subscription} from "rxjs";
import {ScheduleItem} from "../../core/models/ui-objects";
import {map} from 'ramda';

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
    }
  }

  public compareSeasons = (s1: ProgramSeason, s2: ProgramSeason) => {
    return s1.seasonId === s2.seasonId;
  }

  private classSubscription: Subscription;
  public availableSeasons: ProgramSeason[] = [];

  public currentScheduleItems: ScheduleItem[] = [];

  constructor(protected lookupProxy: LookupProxyService, protected classProxy: ClassesProxyService) { }

  ngOnInit() {
    this.lookupProxy.getSeasons().subscribe((seasons: ProgramSeason[]) => {
      this.availableSeasons = seasons;
      if (seasons.length > 0) {
        this.selectedSeason = this.lookupProxy.getBestUpcomingSeason(seasons);
      }
    })
    this.classSubscription = this.classProxy.AllClasses.subscribe((scheduleItems: ProgramSchedule[]) => {
      this.currentScheduleItems = map((item: ProgramSchedule) => {
        return new ScheduleItem(item);
      }, scheduleItems);
    })
  }

  ngOnDestroy(): void {
    this.classSubscription.unsubscribe();
  }

}

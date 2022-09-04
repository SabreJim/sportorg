import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from "rxjs";
import {clone} from 'ramda';
import {StaticValuesService} from "../services/static-values.service";
import {LookupItem} from "../models/rest-objects";
import {LookupProxyService} from "../services/lookup-proxy.service";

@Component({
  selector: 'season-switcher',
  templateUrl: './season-switcher.component.html',
  styleUrls: [
    './season-switcher.component.scss'
  ]
})
export class SeasonSwitcherComponent implements OnInit, OnDestroy {
  public seasons: LookupItem[] = [];
  public defaultSeason: LookupItem;
  public currentSeason: LookupItem;
  protected lookupSub: Subscription;

  constructor(protected lookupProxy: LookupProxyService) {
  }

  @Output() seasonChanged = new EventEmitter<LookupItem>();
  @Output() seasonIdChanged = new EventEmitter<number>();
  public selectSeason = (season: LookupItem) => {
    if (season && season.id) {
      this.currentSeason = season;
      this.seasonChanged.next(this.currentSeason);
      this.seasonIdChanged.next(this.currentSeason.id);
    } else {
      this.currentSeason = null;
    }
  };

  ngOnInit() {
    this.lookupSub = this.lookupProxy.getLookup('seasons').subscribe((items: LookupItem[]) => {
      this.seasons = items;
      const currentSeason = items.find(i => i.id === parseInt(i.otherId));
      this.selectSeason(currentSeason);
      this.defaultSeason = clone(currentSeason);
    });
  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.lookupSub]);
  }

}

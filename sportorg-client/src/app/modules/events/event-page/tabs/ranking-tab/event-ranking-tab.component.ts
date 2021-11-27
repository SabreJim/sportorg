import {AfterViewInit, Component, Input, OnDestroy} from "@angular/core";
import {EventsProxyService} from "../../../../core/services/events/events-proxy.service";
import {EventPoolAthlete} from "../../../../core/models/data-objects";
import {RankingProxyService} from "../../../../core/services/events/ranking-proxy.service";


@Component({
  selector: 'app-event-ranking-tab',
  templateUrl: './event-ranking-tab.component.html',
  styleUrls: ['../../../events-shared.scss',
    './event-ranking-tab.component.scss'],

})
export class EventRankingTabComponent implements AfterViewInit, OnDestroy {
  constructor ( protected rankingProxy: RankingProxyService){}
  @Input() eventId: number;
  @Input() eventRoundId: number;
  @Input() roundTypeId = 1;

  public placeholder = 'Ranking has not been created yet';
  public rankedAthletes: EventPoolAthlete[];

  @Input() set refresh(newValue: boolean) {
    if (newValue) {
      this.getRanking();
      this.refresh = false;
    }
  }

  public getRanking = () => {
    if (this.eventId && this.eventRoundId){
      this.rankingProxy.getEventRoundRanking(this.eventId, this.eventRoundId).subscribe((rankings: EventPoolAthlete[]) => {
        this.rankedAthletes = rankings;
        this.placeholder = '';
      });
    }
  }
  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }
}

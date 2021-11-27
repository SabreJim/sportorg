import {AfterViewInit, Component, Input, OnDestroy} from "@angular/core";
import {EventsProxyService} from "../../../../core/services/events/events-proxy.service";
import {PoolsProxyService} from "../../../../core/services/events/pools-proxy.service";
import {EventPool} from "../../../../core/models/data-objects";
import {Router} from "@angular/router";

@Component({
  selector: 'app-event-pool-tab',
  templateUrl: './event-pool-tab.component.html',
  styleUrls: ['../../../events-shared.scss',
    './event-pool-tab.component.scss'],

})
export class EventPoolTabComponent implements AfterViewInit, OnDestroy {
  constructor ( protected eventProxy: EventsProxyService, protected poolsProxy: PoolsProxyService,
                protected router: Router){}

  @Input() eventId: number;
  @Input() eventRoundId: number;

  public roundPools: EventPool[];
  public placeholder = 'No pools have been created yet';

  @Input() set refresh(newValue: boolean) {
    if (newValue) {
      this.getPools();
      this.refresh = false;
    }
  }

  public getPools = () => {
    if (this.eventId && this.eventRoundId) {
      this.poolsProxy.getRoundPools(this.eventId, this.eventRoundId).subscribe((pools: EventPool[]) => {
        this.roundPools = pools;
        if (pools?.length) {
          this.placeholder = '';
        }
      });
    }
  }

  public launchPool = (pool: EventPool) => {
    this.router.navigate([`/porthos/event/pool/${pool.poolId}`]);
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }
}

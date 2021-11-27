import {AfterViewInit, Component, OnDestroy, OnInit} from "@angular/core";
import {EventsProxyService} from "../../../../../core/services/events/events-proxy.service";
import {PoolsProxyService} from "../../../../../core/services/events/pools-proxy.service";
import {EventPool, EventPoolAthlete} from "../../../../../core/models/data-objects";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../../../../core/services/static-values.service";

@Component({
  selector: 'app-pool-viewer',
  templateUrl: './pool-viewer.component.html',
  styleUrls: ['../../../../events-shared.scss',
    './pool-viewer.component.scss'],

})
export class PoolViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor ( protected eventProxy: EventsProxyService, protected poolsProxy: PoolsProxyService,
                protected route: ActivatedRoute, protected router: Router){}


  public pool: EventPool;
  public poolId = -1;
  public shownAthlete: EventPoolAthlete = null;

  protected navSub: Subscription;
  protected poolSub: Subscription;

  public getPool = () => {
    if (this.poolId) {
      this.poolSub = this.poolsProxy.getPool(this.poolId).subscribe((pool: EventPool) => {
        if (pool?.poolId) {
          this.pool = pool;
        }
      });
    }
  }

  public showAthlete = (athlete: EventPoolAthlete) => {
    if (this.shownAthlete?.athleteId === athlete.athleteId) {
      this.shownAthlete = null; // hide on second click
    } else {
      this.shownAthlete = athlete;
    }
  }
  public editPool = () => {
    // TODO: also require event or referee role
    if ([3,4].includes( this.pool.eventRoundStatusId)) { // only if running (3) or completed (4)
      this.router.navigate([`/porthos/event/pool-edit/${this.pool.poolId}`]);
    }
  }


  ngOnInit() {
    this.navSub =  this.route.paramMap.subscribe((params: ParamMap) => {
      const poolId = Number(params.get('poolId'));
      if (poolId && poolId > 0) { // request event content
        this.poolId = poolId;
        this.getPool();
      }
    });
  }
  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.navSub, this.poolSub]);
  }
}

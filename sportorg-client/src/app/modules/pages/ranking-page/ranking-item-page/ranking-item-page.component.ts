import {AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild} from "@angular/core";
import {RankingProxyService} from "../../../core/services/events/ranking-proxy.service";
import {FilterRequest} from "../../../core/filter-bar/filter-bar.component";
import {Subscription} from "rxjs";
import {Circuit, CircuitRanking} from "../../../core/models/data-objects";
import {TableColumn} from "../../../core/models/ui-objects";
import {StaticValuesService} from "../../../core/services/static-values.service";
import {ActivatedRoute, ParamMap} from "@angular/router";


@Component({
  selector: 'app-ranking-item-page',
  templateUrl: './ranking-item-page.component.html',
  styleUrls: ['../../shared-page.scss']
})
export class RankingItemPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('eventsTemplate') eventsTemplate: TemplateRef<any>;
  constructor(private rankingProxy: RankingProxyService, protected route: ActivatedRoute) { }

  ngAfterViewInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      // save params in case the lookup hasn't arrived yet
      this.circuitId = Number(params.get('circuitId'));
      this.getResults(this.circuitId);
      this.rankingProxy.getCircuit(this.circuitId).subscribe((circuit: Circuit) => {
        if (circuit?.circuitName) {
          this.circuitName = circuit.circuitName;
        }
      });
    });
    this.rankingColumns = [
      TableColumn.fromConfig({fieldName: 'athleteName', title: 'Name', type: 'string', displayType: 'long-string'}),
      new TableColumn('athleteClub', 'Club', 'number'),
      new TableColumn('athleteRegion', 'Province', 'number'),
      new TableColumn('ranking', 'Ranking', 'number'),
      new TableColumn('totalPoints', 'Total points', 'number'),
      TableColumn.fromConfig({fieldName: 'events', title: 'Results', type: 'template', setWidth: '200px',
        templateRef: this.eventsTemplate})
    ];
  }

  protected rankingSub: Subscription;
  public circuitId: number;
  public circuitName: string = '';

  public getResults = (circuitId) => {
    this.rankingSub = this.rankingProxy.getRanking(circuitId).subscribe((circuits: CircuitRanking[]) => {
      this.athleteRows = circuits;
    });
  }

  public athleteRows: CircuitRanking[] = [];
  public rankingColumns: TableColumn[] = [];

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.rankingSub]);
  }
}

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {EventRound} from "../../../core/models/data-objects";
import {EventsProxyService} from "../../../core/services/events/events-proxy.service";
import {LookupItem} from "../../../core/models/rest-objects";
import {ValidatingPanelComponent} from "../../../core/validating-panel/validating-panel.component";
import {clone} from 'ramda';
import {PoolsProxyService} from "../../../core/services/events/pools-proxy.service";
import {StaticValuesService} from "../../../core/services/static-values.service";
import {LookupProxyService} from "../../../core/services/lookup-proxy.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-event-format-item',
  templateUrl: './event-format-item.component.html',
  styleUrls: ['../../events-shared.scss', '../event-format-modal.component.scss'],
})
export class EventFormatItemComponent extends ValidatingPanelComponent<EventRound> implements OnInit, OnDestroy {
  constructor(protected eventProxy: EventsProxyService, protected poolProxy: PoolsProxyService,
              protected lookupProxy: LookupProxyService){
    super();
  }

  @Input() get record () {
    return this._record;
  } set record(newValue: EventRound) {
    this._record = newValue;
    this.defaultRecord = clone(newValue);
    this.tempAthletesPromoted = StaticValuesService.getRoundedPercent(this.record.athletesReady,  this.record.promotedPercent);
    this.updateModelToForm();
  }
  protected _record: EventRound;
  @Input() canDelete = false;
  @Output() updateRounds = new EventEmitter();

  public roundTypes: LookupItem[] = [
    {id: 1, name: 'Pool', lookup: 'roundTypes'},
    {id: 2, name: 'Direct Elimination', lookup: 'roundTypes'},
    {id: 3, name: 'Selection', lookup: 'roundTypes'},
  ];

  public deLevelOptions: LookupItem[];
  public tempAthletesPromoted: number;
  protected putSub: Subscription;
  protected getSub: Subscription;


  public applyPoolSize = (newValue : number) => {
    this.setValue(newValue, 'preferredPoolSize');
    if (this.record.preferredPoolSize && this.record.athletesInRound) {
      this.record.numberOfPools = Math.round(this.record.athletesInRound / this.record.preferredPoolSize);
    }
    this.checkFormState();
  }
  public setPromotedPercent = (percent : number) => {
    this.tempAthletesPromoted = StaticValuesService.getRoundedPercent(this.record.athletesReady,  percent);
    this.setValue(percent, 'promotedPercent');
  }

  public saveRound = () => {
    this.putSub = this.eventProxy.updateRound(this.record).subscribe(() => {
      this.updateRounds.emit();
    });
  }
  public deleteRound = () => {
    this.putSub = this.eventProxy.deleteRound(this.record.eventId, this.record.eventRoundId).subscribe(() => {
      this.updateRounds.emit();
    });
  }

  public setRoundStatus = (roundStatusId: number) => {
    this.putSub = this.eventProxy.setEventRoundStatus(this.record.eventId, this.record.eventRoundId, roundStatusId).subscribe(() => {
      this.updateRounds.emit();
    });
  }

  public performSelection = () => {
    // cut athletes if selection < 100% and prepare the next round
    this.putSub = this.eventProxy.promoteRoundAthletes(this.record.eventId, this.record.eventRoundId).subscribe(() => {
      this.updateRounds.emit();
    });
  }

  public createPools = () => {
    this.putSub = this.poolProxy.createPools(this.record.eventId, this.record.eventRoundId).subscribe(() => {
      this.updateRounds.emit();
    })
  }

  /////////////////////////////
  // DE functions
  /////////////////////////////
  public createTableau = () => {

  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.putSub, this.getSub]);
  }

  ngOnInit(): void {
    this.getSub = this.lookupProxy.getLookup('deLevelOptions').subscribe((levels: LookupItem[]) => {
      this.deLevelOptions = levels;
    })
  }
}

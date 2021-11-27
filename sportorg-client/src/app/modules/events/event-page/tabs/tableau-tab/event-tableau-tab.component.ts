import {AfterViewInit, Component, Input, OnDestroy} from "@angular/core";
import {EventsProxyService} from "../../../../core/services/events/events-proxy.service";


@Component({
  selector: 'app-event-tableau-tab',
  templateUrl: './event-tableau-tab.component.html',
  styleUrls: ['../../../events-shared.scss',
    './event-tableau-tab.component.scss'],

})
export class EventTableauTabComponent implements AfterViewInit, OnDestroy {
  constructor ( protected eventProxy: EventsProxyService){}
  @Input() eventId: number;
  @Input() eventRoundId: number;

  public placeholder = 'Tableau has not been created yet';

  @Input() set refresh(newValue: boolean) {
    if (newValue) {
      this.getTableau();
      this.refresh = false;
    }
  }

  public getTableau = () => {

  }
  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }
}

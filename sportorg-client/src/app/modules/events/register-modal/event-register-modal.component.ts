import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {EventsProxyService} from "../../core/services/events/events-proxy.service";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {EventAthlete} from "../../core/models/data-objects";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {OrgFormControl} from "../../core/modals/validating-modal/validating-modal.component";
import {clone} from 'ramda';

@Component({
  selector: 'app-event-register-modal',
  templateUrl: './event-register-modal.component.html',
  styleUrls: ['../events-shared.scss', './event-register-modal.component.scss']
})
export class EventRegisterModalComponent implements OnInit, OnDestroy {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public matDialogRef: MatDialogRef<EventRegisterModalComponent>,
              protected eventProxy: EventsProxyService, protected lookupProxy: LookupProxyService,
              protected userProxy: FirebaseAuthService) {
    this.eventId = data.eventId;
    this.eventName = data.eventName;
  }
  public eventName = 'Current Event';
  public eventId = -1;
  public athletes: EventAthlete[] = [];
  public filteredAthletes: EventAthlete[] = [];
  protected currentSearch = '';
  public hasEventRole = false;
  public searchControl = new OrgFormControl('searchAthletes');

  protected getAthletes = () => {
    this.eventProxy.getEventAthletes(this.eventId).subscribe((eventAthletes: EventAthlete[]) => {
      this.athletes = eventAthletes;

      this.searchAthletes(this.currentSearch);
    });
  }

  public searchAthletes = (text: string) => {
    if (text?.length) {
      const search = text.toUpperCase();
      this.filteredAthletes = this.athletes.filter((a: EventAthlete) => {
        return (a.firstName.toUpperCase()).includes(search) ||
          (a.lastName.toUpperCase()).includes(search) ||
          (a.club.toUpperCase()).includes(search);
      })
    } else {
      this.filteredAthletes = clone(this.athletes);
    }
    this.currentSearch = text;
  }

  ngOnInit(): void {
    this.getAthletes();
    this.userProxy.hasRole('admin_event').subscribe((value: boolean) => {
      this.hasEventRole = value;
    });
  }
  public registerAthlete = (row: EventAthlete) => {
    this.eventProxy.setEventAthleteStatus(this.eventId, row.athleteId, { registered: true }).subscribe((success: boolean) => {
      this.getAthletes();
    });
  }
  public removeAthlete = (row: EventAthlete) => {
    this.eventProxy.setEventAthleteStatus(this.eventId, row.athleteId, { registered: false }).subscribe((success: boolean) => {
      this.getAthletes();
    });
  }
  ngOnDestroy(): void {
  }

}

import {AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {EventsProxyService} from "../../../core/services/events/events-proxy.service";
import {EventItem, ScheduledEvent} from "../../../core/models/data-objects";
import {StaticValuesService} from "../../../core/services/static-values.service";
import {TableColumn} from "../../../core/models/ui-objects";
import {ScheduledEventModalComponent} from "../../../core/modals/scheduled-event-modal/scheduled-event-modal.component";
import {MatDialog} from "@angular/material/dialog";
import {EventItemModalComponent} from "../../../core/modals/event-item-modal/event-item-modal.component";
import {EventRegisterModalComponent} from "../../../events/register-modal/event-register-modal.component";
import {FirebaseAuthService} from "../../../core/services/firebase-auth.service";

@Component({
  selector: 'app-event-item-page',
  templateUrl: './event-item-page.component.html',
  styleUrls: ['../../shared-page.scss', './event-item-page.component.scss']
})
export class EventItemPageComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(protected appRouter: Router, protected route: ActivatedRoute,
              protected eventProxy: EventsProxyService, protected dialog: MatDialog,
              protected userProxy: FirebaseAuthService) {
  }
  @ViewChild('eventLinkTemplate') eventLinkTemplate: TemplateRef<any>;
  @ViewChild('registerTemplate') registerTemplate: TemplateRef<any>;
  protected navSub: Subscription;
  protected eventSub: Subscription;
  protected eventListSub: Subscription;
  public hasEventRole = false;
  public loggedIn = true;
  public scheduledEvent: ScheduledEvent = {
    scheduledEventId: null,
    scheduledEventName: null,
    hostClubId: null,
    hostClubName: null,
    locationName: null,
    locationAddress: null,
    mapLinkUrl: null,
    startDate: null,
    endDate: null,
    contactEmail: null,
    externalRegistrationLink: null,
    registrationDeadlineDate: null,
    descriptionHtml: null,
    registrationOpen: null,
    events: []
  }

  // configuring the event table
  public eventRows: EventItem[] = [];
  public eventColumns: TableColumn[] = [];
  public editEvent = (row: EventItem) => {
    let data = { eventId: row?.eventId ? row.eventId : -1, scheduledEventId: this.scheduledEvent.scheduledEventId };
    const dialogRef = this.dialog.open(EventItemModalComponent,
      { maxWidth: '80vw', maxHeight: '80vh', data: data });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.success) {
        this.getRecord(this.scheduledEvent.scheduledEventId);
      }
    });
  }

  public editScheduledEvent = () => {
    const dialogRef = this.dialog.open(ScheduledEventModalComponent,
      { width: '80vw', height: '80vh', data: { scheduledEventId: this.scheduledEvent.scheduledEventId } });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.success ) {
        this.getRecord(this.scheduledEvent.scheduledEventId);
      }
    });
  }
  protected getRecord = (scheduledEventId: number) => {
    this.eventSub = this.eventProxy.getScheduledEvent(scheduledEventId).subscribe((event: ScheduledEvent) => {
      this.scheduledEvent = event;
      if (!this.loggedIn) {
        this.registrationDisabledMsg = 'Please login before attempting to register';
      } else if (event.registrationOpen !== 'Y'){
        this.registrationDisabledMsg = 'Registration for this event is closed';
      } else if (event.externalRegistrationLink?.length) {
        this.registrationDisabledMsg = 'Registration for this event is not handled by this site';
      } else {
        this.registrationDisabledMsg = '';
      }

      // now go get the events under this SE
      this.eventListSub = this.eventProxy.getEventsList(this.scheduledEvent.scheduledEventId).subscribe((events: EventItem[]) => {
        this.eventRows = events;
      })
    });
  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.navSub, this.eventSub]);
  }

  ngOnInit(): void {
    this.navSub =  this.route.paramMap.subscribe((params: ParamMap) => {
      const eventId = Number(params.get('scheduledEventId'));
      if (eventId && eventId > 0) { // request event content
        this.getRecord(eventId);
      } else {
        this.appRouter.navigate(['/']);
      }
    });
    this.userProxy.hasRole('admin_event').subscribe((value: boolean) => {
      this.hasEventRole = value;
    });
    this.userProxy.getSession();
  }
  ngAfterViewInit () {
    this.eventColumns  = [
      TableColumn.fromConfig({fieldName: 'eventName', title: 'Name', setWidth: '300px',
        type: 'template', templateRef: this.eventLinkTemplate}),
      TableColumn.fromConfig({fieldName: 'registrationDeadlineDate', title: 'Deadline', type: 'date', showColumn: false }),
      new TableColumn('eventDate', 'Date', 'date'),
      new TableColumn('startTime', 'Time', 'time'),
      TableColumn.fromConfig({fieldName: 'numRegistered', title: 'Registered #', type: 'number'}),
      TableColumn.fromConfig({fieldName: 'registerButton', title: '', type: 'template', templateRef: this.registerTemplate }),
    ];
  }

  // Registration related features
  public registrationDisabledMsg = '';
  public registerForEvent = (event: EventItem) => {
    const dialogRef = this.dialog.open(EventRegisterModalComponent,
      { minWidth: '20vw', maxWidth: '500px', minHeight: '40vh', maxHeight: '70vh', data: event });
    dialogRef.afterClosed().subscribe((result: any) => {
        this.getRecord(this.scheduledEvent.scheduledEventId);
    });
  }
}

import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, TemplateRef, ViewChild} from "@angular/core";
import {TableColumn} from "../../core/models/ui-objects";
import {EventFormatModalComponent} from "../event-format-modal/event-format-modal.component";
import {EventsProxyService} from "../../core/services/events/events-proxy.service";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../core/services/static-values.service";
import {
  EventAthlete,
  EventAthleteStatus,
  EventConfiguration, EventRound,
  MemberAttendance,
  ScreeningAnswer
} from "../../core/models/data-objects";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {AppUser, UserRole} from "../../core/models/authentication";
import {CheckinModalComponent, ConsentPerson} from "../../core/modals/checkin-modal/checkin-modal.component";
import {SnackbarService} from "../../core/services/snackbar.service";

@Component({
  selector: 'app-event-landing-page',
  templateUrl: './event-landing-page.component.html',
  styleUrls: ['../events-shared.scss',
    './event-landing-page.component.scss'],

})
export class EventLandingPageComponent implements AfterViewInit, OnDestroy {
  constructor (protected dialog: MatDialog, protected eventProxy: EventsProxyService,
               protected route: ActivatedRoute, protected appRouter: Router,
               protected userProxy: FirebaseAuthService, protected detector: ChangeDetectorRef){}

  @ViewChild('checkinTemplate') checkinTemplate: TemplateRef<any>;
  @ViewChild('paidTemplate') paidTemplate: TemplateRef<any>;
  protected navSub: Subscription;
  protected formatSub: Subscription;
  public hasEventRole = false;
  protected eventId = 0;
  public scheduledEventId = -1;
  protected checkedLogin = false;
  protected gettingConfig = false;
  public eventConfig: EventConfiguration = {
    eventId: 0,
    eventName: '...',
    eventStatus: 'Created'
  };
  public eventTabs: EventRound[] = [];
  public athleteRows: EventAthlete[] = [];
  public athleteColumns: TableColumn[] = [];

  public editFormat = (event: MouseEvent) => {
    event.stopPropagation(); // don't close the accordion
    const dialogRef = this.dialog.open(EventFormatModalComponent,
      { minWidth: '80vw', minHeight: '40vh', data: this.eventConfig });
    dialogRef.afterClosed().subscribe((result: any) => {
      this.getEvent();
    });
  }
  public getPercent = StaticValuesService.getRoundedPercent;

  public checkinAthlete = (row: EventAthlete) => {
    this.eventProxy.setEventAthleteStatus(this.eventId, row.athleteId, { checkedIn: true }).subscribe((success: boolean) => {
      this.getRegisteredAthletes();
    });
  }
  public consentAthlete = (row: EventAthlete) => {
    const tempMember: ConsentPerson = {
      memberId: row.athleteId,
      firstName: row.firstName,
      lastName: row.lastName
    }
    const dialogRef = this.dialog.open(CheckinModalComponent,
      { maxHeight: '80vh', maxWidth: '80vw', minWidth: '60vw', data:
          {member: tempMember, questions: 'event-consent-form',
            questionPrompt: 'Participants must agree to all of the following consents', title: `Tournament Consent Form`} });
    dialogRef.afterClosed().subscribe((result: MemberAttendance) => {
      if (result && result.screeningAnswers) {
        let allAgreed = true;
        result.screeningAnswers.map((a: ScreeningAnswer) => {
          if (a.answerId !== 3) {
            allAgreed = false;
          }
        });
        if (allAgreed) {
          const newStatus: EventAthleteStatus = {eventId: this.eventId, athleteId: row.athleteId, consentSigned: true};
          this.eventProxy.setEventAthleteStatus(this.eventId, row.athleteId, newStatus).subscribe((result: boolean) => {
          });
        } else {
          SnackbarService.notify('All consent questions must be agreed to');
        }
      }
    });
  }

  public getRegisteredAthletes = () => {
    if (this.eventId > 0) {
      this.eventProxy.getEventRegisteredAthletes(this.eventId).subscribe((athletes: EventAthlete[]) => {
        this.athleteRows = athletes;
        this.detector.detectChanges();
      });
    }
  }
  public getEvent = () => {
    if (this.eventId && !this.gettingConfig) { // if the route hasn't been parsed yet, wait for that
      this.gettingConfig = true;
      this.eventProxy.getEventConfig(this.eventId).subscribe((config: EventConfiguration) => {
        if (config && config.eventId) {
          this.scheduledEventId = config.scheduledEventId;
          this.eventConfig = config;
          this.gettingConfig = false;
          this.detector.detectChanges();
        }
      });
    }
  }
  public refreshTabs = (tabId: number) => {
    if (tabId > 0 && tabId <= this.eventConfig.rounds.length) {
      this.eventConfig.rounds[tabId - 1].refreshFlag = true;
      setTimeout(() => {
        this.eventConfig.rounds[tabId - 1].refreshFlag = false;
      })
    }
  }

  ngOnInit() {
    this.checkUser();
    this.getConfig();
  }
  protected getConfig = () => {
    if (!this.eventId) {
      this.navSub =  this.route.paramMap.subscribe((params: ParamMap) => {
        const eventId = Number(params.get('eventId'));
        if (eventId && eventId > 0) { // request event content
          this.eventId = eventId;
          this.getEvent();
          this.getRegisteredAthletes();
        } else {
          this.appRouter.navigate(['/events']);
        }
      });
    }
  }

  protected checkUser = () => {
    if (!this.checkedLogin) {
      this.userProxy.hasRole('admin_event').subscribe((value: boolean) => {
        this.hasEventRole = value;
        if (!this.checkedLogin) {
          this.checkedLogin = true;
          this.getRegisteredAthletes(); // update the status in the table
        }
      });
    }
  }
  ngAfterViewInit(): void {
    this.athleteColumns = [
      TableColumn.fromConfig({fieldName: 'athleteName', title: 'Name', type: 'string'}),
      TableColumn.fromConfig({fieldName: 'club', title: 'Club', type: 'string', setWidth: '180px'}),
      TableColumn.fromConfig({fieldName: 'checkedIn', title: 'Checked In', setWidth: '140px',
        type: 'template', templateRef: this.checkinTemplate}),
      TableColumn.fromConfig({fieldName: 'paid', title: 'Paid', setWidth: '140px',
        type: 'template', templateRef: this.paidTemplate }),
      TableColumn.fromConfig({fieldName: 'entryRanking', title: 'Ranked (initial)', type: 'number', setWidth: '140px'}),
    ];
    this.checkUser();
    this.getConfig();
  }
  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.navSub, this.formatSub]);
  }
}

import {AfterViewInit, Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AppMember, ScheduledEvent} from "../../models/data-objects";
import {OrgFormControl, ValidatingModalComponent} from "../validating-modal/validating-modal.component";
import {Observable} from "rxjs";
import {EventsProxyService} from "../../services/events/events-proxy.service";

@Component({
  selector: 'app-scheduled-event-modal',
  templateUrl: './scheduled-event-modal.component.html',
  styleUrls: ['./scheduled-event-modal.component.scss']
})
export class ScheduledEventModalComponent extends ValidatingModalComponent<ScheduledEvent> implements OnInit, AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: AppMember,
              public matDialogRef: MatDialogRef<ScheduledEventModalComponent>,
              protected eventProxy: EventsProxyService) {
    super(data, matDialogRef);
  }

  public record: ScheduledEvent;
  public defaultRecord: ScheduledEvent = {
    scheduledEventId: null,
    scheduledEventName: null,
    hostClubId: null,
    eventLogoId: null,
    locationName: null,
    locationAddress: null,
    mapLinkUrl: null,
    startDate: null,
    endDate: null,
    contactEmail: null,
    externalRegistrationLink: null,
    registrationDeadlineDate: null,
    descriptionHtml: null,
    events: []
  };
  protected primaryKeyField = 'scheduledEventId';
  public eventNameControl = new OrgFormControl('scheduledEventName');
  public hostClubControl = new OrgFormControl('hostClubId');
  public locationNameControl = new OrgFormControl('locationName');
  public locationAddressControl = new OrgFormControl('locationAddress');
  public mapLinkUrlControl = new OrgFormControl('mapLinkUrl');
  public startDateControl = new OrgFormControl('startDate', {specialFormat: 'date'});
  public endDateControl = new OrgFormControl('endDate', {specialFormat: 'date'});
  public contactEmailControl = new OrgFormControl('contactEmail');
  public regLinkControl = new OrgFormControl('externalRegistrationLink');
  public deadlineControl = new OrgFormControl('registrationDeadlineDate', {specialFormat: 'date'});

  public minStartDate: Date;
  public maxStartDate: Date;
  public maxDeadlineDate: Date;
  public minEndDate: Date;

  public getRecord = this.eventProxy.getScheduledEvent;

  ngOnInit() {

  }
  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.formControls = [this.eventNameControl, this.hostClubControl, this.locationNameControl, this.locationAddressControl,
      this.mapLinkUrlControl, this.startDateControl, this.endDateControl, this.contactEmailControl, this.regLinkControl,
      this.deadlineControl];
    this.dataLoaded.subscribe((ready: boolean) => {
      if (ready) {
        this.connectFormControls();
      }
    });
  }

  public setDateRestrict = (event: string, dateType: string) => {
    // set min endDate, maxDeadline
    if (dateType === 'start') {
      this.maxDeadlineDate = new Date(event);
      this.minEndDate = new Date(event);
    } else if (dateType === 'end') {
      this.maxStartDate = new Date(event);
    } else {
      this.minStartDate = new Date(event);
    }
  }
  public updateDescription = (event: string) => {
    this.record.descriptionHtml = event;
    this.checkFormState();
  }
  public updateLogoId = (newId: number) => {
    if (this.record && newId !== this.record.eventLogoId){
      this.record.eventLogoId = newId;
    }
  };

  protected saveRecord = this.eventProxy.upsertScheduledEvent;
}

import {AfterViewInit, Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AppMember, EventItem} from "../../models/data-objects";
import {OrgFormControl, ValidatingModalComponent} from "../validating-modal/validating-modal.component";
import {Observable} from "rxjs";
import {EventsProxyService} from "../../services/events/events-proxy.service";
import {LookupItem} from "../../models/rest-objects";
import {LookupProxyService} from "../../services/lookup-proxy.service";

@Component({
  selector: 'app-event-item-modal',
  templateUrl: './event-item-modal.component.html',
  styleUrls: ['./event-item-modal.component.scss']
})
export class EventItemModalComponent extends ValidatingModalComponent<EventItem> implements OnInit, AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public matDialogRef: MatDialogRef<EventItemModalComponent>,
              protected eventProxy: EventsProxyService, protected lookupProxy: LookupProxyService) {
    super(data, matDialogRef);
  }

  public record: EventItem;
  public defaultRecord: EventItem = {
    eventId: null,
    eventName: null,
    primaryAgeCategoryId: null,
    primaryAgeCategory: null,
    athleteTypeId: null,
    athleteType: null,
    genderId: null,
    eventDate: null,
    startDate: null,
    endDate: null,
    startTime: null,
    scheduledEventId: null,
    circuitId: null,
    circuitName: null
  };
  protected primaryKeyField = 'eventId';
  public eventNameControl = new OrgFormControl('eventName');
  public ageCategoryControl = new OrgFormControl('primaryAgeCategoryId');
  public athleteTypeControl = new OrgFormControl('athleteTypeId');
  public genderControl = new OrgFormControl('genderId');
  public startTimeControl = new OrgFormControl('startTime');
  public eventDateControl = new OrgFormControl('eventDate', {specialFormat: 'date'});

  public minDate: Date;
  public maxDate: Date;

  public getRecord = this.eventProxy.getEventItem;

  protected ageLookup: LookupItem[] = [];
  protected typeLookup: LookupItem[] = [];
  protected genderLookup: LookupItem[] = [];
  public updateName = (event: LookupItem) => {
    setTimeout(() => { // wait till the record is updated
      const ageName = this.ageLookup.find(l => l.id === this.record.primaryAgeCategoryId);
      const typeName = this.typeLookup.find(l => l.id === this.record.athleteTypeId);
      const genderName = this.genderLookup.find(l => l.id === this.record.genderId);
      const composedName = `${ageName ? ageName.name : ''} ${typeName ? typeName.name : ''} ${genderName ? genderName.name : ''}`;
      if (composedName?.length > 3) {
        this.eventNameControl.setValue(composedName);
        this.checkFormState();
      }
    }, 400);

  }
  ngOnInit() {
    this.lookupProxy.getLookup('ageCategories').subscribe(l => this.ageLookup = l);
    this.lookupProxy.getLookup('athleteTypes').subscribe(l => this.typeLookup = l);
    this.lookupProxy.getLookup('genders').subscribe(l => this.genderLookup = l);
  }
  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.formControls = [this.eventNameControl, this.ageCategoryControl, this.athleteTypeControl, this.startTimeControl,
      this.eventDateControl, this.genderControl];
    this.dataLoaded.subscribe((ready: boolean) => {
      if (ready) {
        this.defaultRecord.scheduledEventId = this.data.scheduledEventId;
        this.record.scheduledEventId = this.data.scheduledEventId;
        this.connectFormControls();
      }
    });
  }

  protected saveRecord = this.eventProxy.upsertEventItem;
}

import {AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FilterBarConfig, FilterConfig, FilterRequest} from "../../core/filter-bar/filter-bar.component";
import {LookupItem} from "../../core/models/rest-objects";
import {TableColumn} from "../../core/models/ui-objects";
import {EventsProxyService} from "../../core/services/events/events-proxy.service";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../core/services/static-values.service";
import {ScheduledEvent} from "../../core/models/data-objects";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ScheduledEventModalComponent} from "../../core/modals/scheduled-event-modal/scheduled-event-modal.component";

@Component({
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: [
    '../shared-page.scss',
    './event-page.component.scss'
  ]
})
export class EventPageComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(protected eventService: EventsProxyService, protected dialog: MatDialog) { }

  @ViewChild('ageCategoryTemplate') ageCategoryTemplate: TemplateRef<any>;
  @ViewChild('eventTypeTemplate') eventTypeTemplate: TemplateRef<any>;
  @ViewChild('locationTemplate') locationTemplate: TemplateRef<any>;
  @ViewChild('eventLinkTemplate') eventLinkTemplate: TemplateRef<any>;
  protected eventSub: Subscription;
  protected dialogRef: MatDialogRef<any>;
  protected genderOptions: LookupItem[] = [
    { id: -1, stringId: '"M"', lookup: 'genderFilter', name: 'Male' },
    { id: -1, stringId: '"F"', lookup: 'genderFilter', name: 'Female'}
  ];
  public hasEventRole = true;
  public updateOptions: FilterConfig = null;
  public currentFilter: FilterRequest;
  public filterConfig: FilterBarConfig = {
    hasSearch: true,
    searchTitle: 'Search',
    searchPlaceholder: 'Search events by name ...',
    options: [
      { title: 'By age', fieldName: 'age', singleSelect: false, value: '', options: [], lookupName: 'ageCategories', showHint: false },
      { title: 'By weapon', fieldName: 'athleteType', singleSelect: false, value: '', options: [], lookupName: 'athleteTypes', showHint: false }
    ]
  }
  public filterEvents = (request: FilterRequest) => {
    this.currentFilter =request;
    this.eventSub = this.eventService.getScheduledEvents(request).subscribe((events: ScheduledEvent[]) => {
      // preprocess the values
      events.map((e: ScheduledEvent) => {
        if (e.ages?.length) {
          e.ageOptions = e.ages.split(',');
        }
        if (e.eventTypes?.length) {
          e.eventTypeOptions = e.eventTypes.split(',');
        }
      });
      this.eventRows = events;
    });
  }

  public eventRows: any[] = [];
  public eventColumns: TableColumn[] = [];
  public editEvent = (row: ScheduledEvent) => {
    let data = row;
    if (!data?.scheduledEventId) {
      data = null;
    }
    const dialogRef = this.dialog.open(ScheduledEventModalComponent,
      { width: '80vw', height: '80vh', data: { scheduledEventId: row.scheduledEventId } });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.success ) {
        this.filterEvents(this.currentFilter);
      }
    });
  }
  ngOnInit() {
  }

  ngAfterViewInit() {
    // allow templates to be added first
    this.eventColumns  = [
      TableColumn.fromConfig({fieldName: 'scheduledEventName', title: 'Name', setWidth: '300px',
        type: 'template', templateRef: this.eventLinkTemplate}),
      new TableColumn('registrationDeadlineDate', 'Deadline', 'date'),
      new TableColumn('startDate', 'Starts', 'date'),
      new TableColumn('endDate', 'Ends', 'date'),
      TableColumn.fromConfig({fieldName: 'ages', title: 'Levels', setWidth: '200px',
        type: 'template', templateRef: this.ageCategoryTemplate }),
      TableColumn.fromConfig({fieldName: 'eventTypes', title: 'Weapons', setWidth: '200px',
        type: 'template', templateRef: this.eventTypeTemplate }),
      TableColumn.fromConfig({fieldName: 'locationName', title: 'Location', setWidth: '250px',
        type: 'template',templateRef: this.locationTemplate}),
      TableColumn.fromConfig({fieldName: 'circuit', title: 'Circuit', type: 'string', displayType: 'string'}),
      TableColumn.fromConfig({fieldName: 'hostClubName', title: 'Host', type: 'string', displayType: 'string'}),
    ];
    this.filterEvents(new FilterRequest());
  }
  ngOnDestroy() {
    StaticValuesService.cleanSubs([this.eventSub]);
  }
}

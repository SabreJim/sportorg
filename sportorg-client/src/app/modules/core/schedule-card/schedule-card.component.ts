import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {jqxSchedulerComponent} from "jqwidgets-ng/jqxscheduler";
import {ScheduleItem} from "../models/ui-objects";

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.scss']
})
export class ScheduleCardComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() maxWidth: number = 1000;

  @Input() get scheduleItems(): ScheduleItem[] {
    return this.dataDefinition.localData;
  } set scheduleItems(newItems: ScheduleItem[]) {
    if (newItems && newItems.length > 0) {
      this.dataDefinition.localData = newItems;
      this.dataAdapter = new jqx.dataAdapter(this.dataDefinition);
      console.log('CARD got data', newItems, this.scheduler);
      const firstDate = newItems[0].from;
      this.snapToDate = new jqx.date(firstDate.getUTCFullYear(), firstDate.getUTCMonth() + 1, firstDate.getUTCDate());
    } else {
      this.dataDefinition.localData = [];
      this.dataAdapter = new jqx.dataAdapter(this.dataDefinition);
    }
  }

  @ViewChild('schedulerReference', {static: false}) scheduler: jqxSchedulerComponent;
  ngAfterViewInit(): void {

  }
  public getWidth() : any {
    if (document.body.offsetWidth < this.maxWidth) {
      return '90%';
    }
    return this.maxWidth;
  }

  public dataDefinition: any =
    {
      dataType: "array",
      dataFields: [
        { name: 'id', type: 'number' },
        { name: 'description', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'subject', type: 'string' },
        { name: 'resourceId', type: 'string' },
        { name: 'recurrenceRule', type: 'string'},
        { name: 'from', type: 'date' },
        { name: 'to', type: 'date' }
      ],
      id: 'id',
      localData: []
    };
  public dataAdapter: any = new jqx.dataAdapter(this.dataDefinition);
  public snapToDate: any = new jqx.date(2019, 11, 23);
  public appointmentDataFields: any =
    {
      from: "from",
      to: "to",
      id: "id",
      description: "description",
      location: "location",
      style: 'style',
      subject: "subject",
      resourceId: "resourceId",
      recurrencePattern: 'recurrenceRule'
    };
  public resources: any =
    {
      colorScheme: "scheme05",
      dataField: "resourceId",
      source: new jqx.dataAdapter(this.dataDefinition)
    };
  public views: any[] =
    [
      {type: 'weekView', appointmentRenderMode: 'exactTime', timeRuler:
          {scaleStartHour: 13, scaleEndHour: 22, scale: 'quarterHour'}}
    ];

}

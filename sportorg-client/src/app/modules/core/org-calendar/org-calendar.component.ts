import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef, Input
} from '@angular/core';

import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarEventTitleFormatter,
  CalendarView
} from 'angular-calendar';
import { ViewPeriod } from 'calendar-utils';
import {Subject} from "rxjs";
import {RecurringScheduleItem } from "../models/ui-objects";
import {OrgTitleFormatterProvider} from "./org-title-formatter.provider";


@Component({
  selector: 'org-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './org-calendar.component.html',
  styleUrls: ['./org-calendar.component.scss'],
  providers: [
    {provide: CalendarEventTitleFormatter, useClass: OrgTitleFormatterProvider }
  ]
})
export class OrgCalendarComponent {
  @Input() panelTitle: string;
  @Input() set addCalendarItems(newItems: RecurringScheduleItem[]) {
    if(newItems && newItems.length) {
      this.updateCalendarEvents(newItems);
    }
  }

  @Input() set setCurrentDate(newDate: Date) {
    console.log('got new date', newDate);
  }

  public isExpanded = true;
  public changingWeek(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
  }
  refresh: Subject<any> = new Subject();  // mwl calendar is watching this
  public view = CalendarView.Week;
  public handleEvent(action: string, event: CalendarEvent): void {
  }

  eventTimesChanged({
                      event,
                      newStart,
                      newEnd
                    }: CalendarEventTimesChangedEvent): void {

  }
  public currentDate = new Date();

  public calendarEvents: CalendarEvent[] = [];

  public viewPeriod: ViewPeriod;

  constructor(private cdr: ChangeDetectorRef) {}

  public updateCalendarEvents(newSchedule: RecurringScheduleItem[]) {
    this.calendarEvents = [];
    newSchedule.forEach((schedule) => {
      this.calendarEvents = this.calendarEvents.concat(schedule.weeklyEvents);
    });
    this.currentDate = (this.calendarEvents[0].start);
    this.cdr.detectChanges();
  }
}

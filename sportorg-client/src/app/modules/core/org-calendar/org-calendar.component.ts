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
import {DAYS_OF_WEEK, RecurringScheduleItem} from "../models/ui-objects";
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
    if(newItems) {
      if (newItems.length) {
        this.updateCalendarEvents(newItems);
      } else {
        this.updateCalendarEvents([]);
      }
    }
  }

  @Input() set setCurrentDate(newDate: Date) {
    if (newDate) {
      newDate.setUTCDate(newDate.getUTCDate() + 2);
      this.currentDate = newDate;
      this.cdr.detectChanges();
    }
  }
  public weekStartsOn = 1; // DAYS_OF_WEEK.MONDAY;
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
    this.cdr.detectChanges();
  }
}

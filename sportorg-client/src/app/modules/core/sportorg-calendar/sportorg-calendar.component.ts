import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {LookupItem} from "../models/rest-objects";
import {LookupProxyService} from "../services/lookup-proxy.service";
import {ClassesProxyService} from "../services/classes-proxy.service";
import {ClassRecord} from "../models/data-objects";
import {StaticValuesService} from "../services/static-values.service";

export interface TimeSlot {
  id: number;
  type: 'class' | 'empty';
  startTime: string;
  eventName?: string;
  height?: number;
  colorId?: number;
  bgColor?: string;
  textColor?: string;
  startDate?: string;
  endDate?: string;
}
export interface DateHeader {
  id: number;
  dayName: string;
  specificDate: string;
  isHidden?: boolean;
}
@Component({
  selector: 'sportorg-calendar',
  templateUrl: './sportorg-calendar.component.html',
  styleUrls: ['./sportorg-calendar.component.scss']
})
export class SportorgCalendarComponent implements OnInit {

  // public weekdays: LookupItem[] = StaticValuesService.WEEK_DAYS;
  public weekdays: DateHeader[] = [];
  public timeSlotGrid: TimeSlot[][] = [];
  public currentSeasonId: number = null;
  @Input() isExpanded = true;
  @Output() doExpand = new EventEmitter<boolean>();
  constructor(private lookupService: LookupProxyService, private classService: ClassesProxyService) { }

  ngOnInit() {
    this.getClassData();

    // build date headers
    StaticValuesService.WEEK_DAYS.map((item: LookupItem) => {
      this.weekdays.push({id: item.id, dayName: item.name, specificDate: ''})
    });
    // calculate the current days of the week to display
    const currentDate = new Date();
    const todayDay: number = (this.weekdays[(currentDate.getUTCDay() + 6) % 7]).id; // in our Monday-first context
    this.weekdays.map((day: DateHeader) => {
      const dateDiff = day.id - todayDay;
      const tempDate = new Date();
      tempDate.setDate(currentDate.getDate() + dateDiff);
      day.specificDate = `${StaticValuesService.MONTH_NAMES[tempDate.getMonth()]} ${tempDate.getDate()}`
    });
  }
  public toggleExpand = () => {
    this.isExpanded = !this.isExpanded;
    this.doExpand.emit(this.isExpanded);
  }

  public updateSelection = (newId: number) => {
    console.log('switching season', newId);
  }

  public getClassData = (seasonId: number = null) => {
    this.classService.getAllClasses(seasonId).subscribe((classes: ClassRecord[]) => {
      console.log('got classes', classes);
      if (classes.length) {
        this.currentSeasonId = classes[0].seasonId;
      } else {
        this.currentSeasonId = 1; // default to first
      }
      let startTimes:string[] = [];
      classes.map((item) => {
        if (!startTimes.includes(item.startTime)){
          startTimes.push(item.startTime);
        }
      });
      startTimes.sort();

      for (let day of this.weekdays) {
        const currentColumn: TimeSlot[] = [];
        for (let time of startTimes) {
          const matchingClass = classes.find((item: ClassRecord) => {
            return item.dayId === day.id && item.startTime === time;
          });
          if (matchingClass) {
            const colorMatch = StaticValuesService.ORG_COLORS[matchingClass.colorId];
            const height = Math.floor(matchingClass.duration / 30);
            currentColumn.push({
              id: matchingClass.scheduleId,
              type: 'class',
              startTime: StaticValuesService.getUITime(matchingClass.startTime),
              eventName: matchingClass.levelName,
              height: height,
              colorId: matchingClass.colorId,
              bgColor: colorMatch.secondary,
              textColor: colorMatch.primary,
              startDate: matchingClass.startDate,
              endDate: matchingClass.endDate
            });
          } else {
            currentColumn.push({ id: 0, type: 'empty', startTime: time });
          }

        }
        this.timeSlotGrid.push(currentColumn);
        day.isHidden = (!currentColumn.some((event: TimeSlot) => event.type === 'class'));
      }
    })
  }

}

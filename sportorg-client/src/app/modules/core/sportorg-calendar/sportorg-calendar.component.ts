import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output, ViewRef
} from '@angular/core';
import {LookupItem} from "../models/rest-objects";
import {LookupProxyService} from "../services/lookup-proxy.service";
import {ClassesProxyService} from "../services/classes-proxy.service";
import {ClassRecord, ProgramRecord} from "../models/data-objects";
import {StaticValuesService} from "../services/static-values.service";
import {Subscription} from "rxjs";
import {ProgramsProxyService} from "../services/programs-proxy.service";
import { MatDialog } from "@angular/material/dialog";

export interface TimeSlot {
  id: number;
  type: 'class' | 'empty';
  startTime: string;
  endTime?: string;
  eventName?: string;
  height?: number;
  colorId?: number;
  bgColor?: string;
  textColor?: string;
  startDate?: string;
  endDate?: string;
  programId?: number;
}
export interface DateHeader {
  id: number;
  dayName: string;
  specificDate: string;
  date: string;
  isHidden?: boolean;
}
@Component({
  selector: 'sportorg-calendar',
  templateUrl: './sportorg-calendar.component.html',
  styleUrls: ['./sportorg-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SportorgCalendarComponent implements OnInit {

  public weekdays: DateHeader[] = [];
  public timeSlotGrid: TimeSlot[][] = [];
  public currentSeasonId: number = null;
  public programs: ProgramRecord[] = [];
  public allHidden: boolean = false;
  protected viewDate: string;
  protected programSub: Subscription;
  @Input() isExpanded = true;
  @Input() showExpand = true;
  @Output() doExpand = new EventEmitter<boolean>();
  constructor(private lookupService: LookupProxyService, private classService: ClassesProxyService,
              private programService: ProgramsProxyService, public dialog: MatDialog,
              private detector: ChangeDetectorRef) { }

  ngOnInit() {
    this.programSub = this.programService.Programs.subscribe((newPrograms: ProgramRecord[]) => {
      this.programs = newPrograms;
    });
    this.programService.getPrograms();
    // build date headers
    StaticValuesService.WEEK_DAYS.map((item: LookupItem) => {
      this.weekdays.push({id: item.id, dayName: item.name, specificDate: '', date: ''})
    });
    // calculate the current days of the week to display
    this.viewDate = StaticValuesService.localizeDate(Date());
    this.centerOnDate();

  }
  public toggleExpand = () => {
    this.isExpanded = !this.isExpanded;
    this.doExpand.emit(this.isExpanded);
    this.detector.detectChanges();
  };

  public updateSelection = (newId: number) => {
    this.getClassData();
  };

  protected centerOnDate = () => {
    const currentDate = new Date(this.viewDate);
    // calculate the current days of the week to display
    const todayDay: number = (this.weekdays[(currentDate.getUTCDay() + 6) % 7]).id; // in our Monday-first context
    this.weekdays.map((day: DateHeader) => {
      const dateDiff = day.id - todayDay;
      const tempDate = new Date(currentDate);
      tempDate.setDate(currentDate.getDate() + dateDiff);
      day.specificDate = `${StaticValuesService.MONTH_NAMES[tempDate.getMonth()]} ${tempDate.getDate()}`;
      day.date = tempDate.toISOString();
    });
    this.getClassData();
  }
  public changeWeek = (offset: number) => {
    let currentDate = new Date(this.viewDate);
    const weekOffset = (offset === 1) ? 60*60*24*7 : 60*60*24*7*-1;
    const newDate = new Date(currentDate.getTime() + weekOffset * 1000);
    this.viewDate = newDate.toISOString();
    this.centerOnDate();
  };

  public getClassData = () => {
    this.classService.getAllClasses().subscribe((classes: ClassRecord[]) => {
      if (classes.length) {
        this.currentSeasonId = classes[0].seasonId;
      } else {
        this.currentSeasonId = 1; // default to first
      }
      // trim down the classes to the ones that would apply to this week
      const currentClasses = classes.filter((classItem: ClassRecord) => {
        // started before last of this week, and ended after last day of this week
        return (classItem.startDate < this.weekdays[6].date) && (classItem.endDate > this.weekdays[6].date);
      });
      // flag to not show an empty calendar
      this.allHidden = (!currentClasses.length);

      // build out the list of possible start times
      let startTimes:string[] = [];
      currentClasses.map((item) => {
        if (!startTimes.includes(item.startTime)){
          startTimes.push(item.startTime);
        }
      });
      startTimes.sort();

      // rebuild weekly classes
      this.timeSlotGrid = [];
      for (let day of this.weekdays) {
        const currentColumn: TimeSlot[] = [];
        for (let time of startTimes) {
          const matchingClass = currentClasses.find((item: ClassRecord) => {
            return item.dayId === day.id && item.startTime === time;
          });
          if (matchingClass) {
            const colorMatch = StaticValuesService.ORG_COLORS[matchingClass.colorId];
            const height = Math.floor(matchingClass.duration / 30);
            currentColumn.push({
              id: matchingClass.scheduleId,
              type: 'class',
              startTime: StaticValuesService.getUITime(matchingClass.startTime),
              endTime: StaticValuesService.getUITime(matchingClass.endTime),
              eventName: matchingClass.programName,
              programId: matchingClass.programId,
              height: height,
              colorId: matchingClass.colorId,
              bgColor: colorMatch.secondary,
              textColor: colorMatch.primary,
              startDate: matchingClass.startDate,
              endDate: matchingClass.endDate
            });
          } else {
            currentColumn.push({ id: 0, type: 'empty', startTime: time});
          }
        }
        this.timeSlotGrid.push(currentColumn);
        day.isHidden = (!currentColumn.some((event: TimeSlot) => event.type === 'class'));
      }
        if (this.detector && !(this.detector as ViewRef).destroyed) {
          this.detector.detectChanges();
        }
    });
  }

  public getProgram = (programId: number) => {
    return this.programs.find((item: ProgramRecord) => item.programId === programId);
  }
}

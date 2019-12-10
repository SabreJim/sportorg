import {ProgramSchedule} from "./data-objects";
import { map } from 'ramda';
import { CalendarEvent } from 'angular-calendar';
import { EventColor } from 'calendar-utils';

export interface RecentItem {
  title: string;
  link: string;
  type?: string;
}

export interface OrgCalendarEvent extends CalendarEvent {
  location?: string;
  details?: string;
  groupName?: string;
}

export class TableColumn {
  title: string;
  type: string;
  fieldName: string;
  displayField?: string;
  lookupField?: string;
  showColumn: boolean;
  sortDirection: 'ASC' | 'DESC';
  constructor (fieldName: string, title: string, type: string, displayField?: string, lookupField?: string) {
    this.fieldName = fieldName;
    this.title = title;
    if (displayField) {
      this.displayField = displayField;
    } else {
      this.displayField = fieldName;
    }
    if (['string' , 'long-string' , 'number' , 'currency' ,'date', 'time', 'select'].includes(type)) {
      this.type = type;
    } else {
      this.type = 'string';
    }
    this.lookupField = lookupField;
    this.showColumn = true;
    this.sortDirection = 'DESC';
  }
}

export const ORG_COLORS: EventColor[] = [
  // reds: border / background 0 - 5
  { primary: '#1a237e', secondary: '#e53935'},
  { primary: '#1a237e', secondary: '#f44336'},
  { primary: '#1a237e', secondary: '#ef5350'},
  { primary: '#1a237e', secondary: '#e57373'},
  { primary: '#1a237e', secondary: '#ef9a9a'},
  { primary: '#1a237e', secondary: '#ffcdd2'},
  { primary: '#1a237e', secondary: '#ffcdd2'},
  // purples 6 - 11
  { primary: '#1a237e', secondary: '#8e24aa'},
  { primary: '#1a237e', secondary: '#9c27b0'},
  { primary: '#1a237e', secondary: '#ab47bc'},
  { primary: '#1a237e', secondary: '#ba68c8'},
  { primary: '#1a237e', secondary: '#ce93d8'},
  { primary: '#1a237e', secondary: '#e1bee7'},
  // blues 12 - 17
  { primary: '#1a237e', secondary: '#1e88e5'},
  { primary: '#1a237e', secondary: '#2196f3'},
  { primary: '#1a237e', secondary: '#42a5f5'},
  { primary: '#1a237e', secondary: '#64b5f6'},
  { primary: '#1a237e', secondary: '#90caf9'},
  { primary: '#1a237e', secondary: '#bbdefb'},
  // teals 18 - 23
  { primary: '#1a237e', secondary: '#00897b'},
  { primary: '#1a237e', secondary: '#009688'},
  { primary: '#1a237e', secondary: '#26a69a'},
  { primary: '#1a237e', secondary: '#4db6ac'},
  { primary: '#1a237e', secondary: '#80cbc4'},
  { primary: '#1a237e', secondary: '#b2dfdb'},
  // greens 24 - 29
  { primary: '#1a237e', secondary: '#43a047'},
  { primary: '#1a237e', secondary: '#4caf50'},
  { primary: '#1a237e', secondary: '#66bb6a'},
  { primary: '#1a237e', secondary: '#81c784'},
  { primary: '#1a237e', secondary: '#a5d6a7'},
  { primary: '#1a237e', secondary: '#c8e6c9'},
];
export const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export class RecurringScheduleItem {
  weeklyEvents: OrgCalendarEvent[];

  // assuming weekly schedule for now
  constructor(pSchedule: ProgramSchedule) {
    this.weeklyEvents = [];
    const startDate = new Date(pSchedule.startDate);
    const endDate = new Date(pSchedule.endDate);

    const targetDayOfWeek = DAYS_OF_WEEK.indexOf(pSchedule.dayOfWeek) || 0;
    const dateDiff = (7 - (startDate.getUTCDay() - targetDayOfWeek)) % 7;
    const currentDate = new Date(startDate);
    currentDate.setUTCDate(currentDate.getUTCDate() + dateDiff); // adjusted to correct start day of week

    const startArr = map(parseInt, pSchedule.startTime.split(':'));
    const endArr = map(parseInt, pSchedule.endTime.split(':'));
    let maxLoop = 0; // safety net against infinite loop
    while (currentDate < endDate && maxLoop < 50) {

      const startTime = new Date(currentDate);
      startTime.setDate(currentDate.getUTCDate()); // undo date discrepancies
      startTime.setHours(startArr[0], startArr[1]);
      const endTime = new Date(currentDate);
      endTime.setDate(currentDate.getUTCDate());
      endTime.setHours(endArr[0], endArr[1]);

      const pickColor = pSchedule.colorId || 0;
      // pSchedule.groupId to select a class? or color
      this.weeklyEvents.push({
        id: pSchedule.scheduleId,
        title: pSchedule.levelName,
        start: startTime,
        end: endTime,
        color: ORG_COLORS[pickColor],
        location: pSchedule.locationName,
        details: `${pSchedule.minAge} - ${pSchedule.maxAge}`,
        groupName: pSchedule.programId.toString()
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 7);
      maxLoop = maxLoop + 1;
    }
  }
}

export interface RegistrationDialogData {
  programName: string;
  programFees: number;
  season: string;
  year: number;
}

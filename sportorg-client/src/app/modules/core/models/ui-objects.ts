import {ProgramSchedule} from "./data-objects";
import { map } from 'ramda';
import { CalendarEvent } from 'angular-calendar';
import { EventColor } from 'calendar-utils'

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

export const colors: EventColor[] = [
  { primary: '#ad2121', secondary: '#FAE3E3' },
  { primary: '#1e90ff', secondary: '#D1E8FF' },
  { primary: '#e3bc08', secondary: '#FDF1BA' }
];
export const DAYS_OF_WEEK = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY' ];

export class RecurringScheduleItem {
  weeklyEvents: OrgCalendarEvent[];

  // assuming weekly schedule for now
  constructor(pSchedule: ProgramSchedule) {
    this.weeklyEvents = [];
    const startDate = new Date(pSchedule.startDate);
    const endDate = new Date(pSchedule.endDate);

    const targetDayOfWeek = DAYS_OF_WEEK.indexOf(pSchedule.dayOfWeek) || 0;
    const dateDiff = (7 - (startDate.getUTCDate() - targetDayOfWeek)) % 7;
    const currentDate = new Date(startDate);
    currentDate.setUTCDate(currentDate.getUTCDate() + dateDiff); // adjusted to correct start day of week

    const startArr = map(parseInt, pSchedule.startTime.split(':'));
    const endArr = map(parseInt, pSchedule.endTime.split(':'));
    while (currentDate < endDate) {

      const startTime = new Date(currentDate);
      startTime.setHours(startArr[0], startArr[1]);
      const endTime = new Date(currentDate);
      endTime.setHours(endArr[0], endArr[1]);

      const pickColor = (pSchedule.programId % colors.length) || 0;
      // pSchedule.groupId to select a class? or color
      this.weeklyEvents.push({
        id: pSchedule.scheduleId,
        title: pSchedule.levelName,
        start: startTime,
        end: endTime,
        color: colors[pickColor],
        location: pSchedule.locationName,
        details: `${pSchedule.minAge} - ${pSchedule.maxAge}`,
        groupName: pSchedule.programId.toString()
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 7);
    }
  }
}

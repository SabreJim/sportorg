import {ProgramSchedule} from "./data-objects";
import {parseConfigFile} from "tslint/lib/configuration";

export interface RecentItem {
  title: string;
  link: string;
  type?: string;
}

export class ScheduleItem {
  id: string;
  description?: string;
  style?: string;
  location: string;
  subject: string; // main name to show
  resourceId: string; // grouping of events: program, tournaments, etc
  recurrenceRule: string; // eg: 'FREQ=DAILY;', 'FREQ=WEEKLY;'
  recurrenceException?: string; // blocked out dates eg: '2018-11-24 09:00:00,2018-11-26 12:00:00',
  from: Date; // new Date(2018, 10, 23, 10, 0, 0),
  to: Date; // new Date(2018, 10, 23, 11, 0, 0)

  constructor(pSchedule: ProgramSchedule) {
    this.id = pSchedule.classId.toString();
    this.location = pSchedule.locationName;
    this.subject = pSchedule.levelName;
    this.resourceId = pSchedule.classId.toString();
    this.recurrenceRule = pSchedule.recurrenceRule;
    this.from = new Date(pSchedule.startDate);
    this.to = new Date(pSchedule.endDate);
    this.description = `ages: ${pSchedule.minAge} to ${pSchedule.maxAge}`;
  }
}

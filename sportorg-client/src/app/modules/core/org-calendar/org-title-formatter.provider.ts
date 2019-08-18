import { CalendarEventTitleFormatter, CalendarEvent } from 'angular-calendar';
import {OrgCalendarEvent} from "../models/ui-objects";

export class OrgTitleFormatterProvider extends CalendarEventTitleFormatter {
  // you can override any of the methods defined in the parent class

  monthTooltip(event: OrgCalendarEvent): string {
    return;
  }

  weekTooltip(event: OrgCalendarEvent): string {
    return event.location;
  }

  dayTooltip(event: OrgCalendarEvent): string {
    return;
  }
}

import {ProgramSchedule} from "./data-objects";
import { map } from 'ramda';
import { CalendarEvent } from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import {LookupItem} from "./rest-objects";
import {Observable} from "rxjs";

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

export interface ColumnConfig {
  title: string;
  type: string;
  displayType?: string;
  fieldName: string;
  displayField?: string;
  lookupField?: string;
  lookupStatic?: LookupItem[];
  showColumn?: boolean;
  sortDirection?: 'ASC' | 'DESC';
}
export class TableColumn {
  title: string;
  type: string;
  displayType?: string;
  fieldName: string;
  displayField?: string;
  lookupField?: string;
  lookupStatic?: LookupItem[];
  showColumn: boolean;
  sortDirection: 'ASC' | 'DESC';
  static fromConfig = (config: ColumnConfig) => {
    const column = new TableColumn(config.fieldName, config.title, config.type, config.displayField);
    column.lookupField = config.lookupField;
    column.lookupStatic = config.lookupStatic;
    if (config.displayType) {
      column.displayType = config.displayType;
    }
    return column;
  }
  constructor (fieldName: string, title: string, type: string, displayField?: string) {
    this.fieldName = fieldName;
    this.title = title;
    if (displayField) {
      this.displayField = displayField;
    } else {
      this.displayField = fieldName;
    }
    if (['string' , 'long-string' , 'number', 'currency' ,'date', 'time', 'select', 'boolean', 'html'].includes(type)) {
      this.type = type;
    } else {
      this.type = 'string';
    }
    this.displayType = type;
    this.showColumn = true;
    this.sortDirection = 'DESC';
  }
}
export interface AdminConfig {
  columns: TableColumn[];
  defaultObject?: any; // to default for new records
  getter: () => Observable<any[]>;
  setter: (entity: any) => Observable<boolean>;
  delete: (entity: any) => Observable<boolean>;
  identityField: string;
  notifySelection?: (row: any, state: boolean) => Observable<any>;
  entityType: string;
  disableAdd?: boolean;
  allowSelect?: boolean;
}

export interface MenuItem {
  menuId: number;
  title: string;
  link: string;
  mobileOnly: 'Y' | 'N';
  altTitle: string;
  orderNumber: number;
  parentMenuId?: number;
  childMenus?: MenuItem[];
}

export interface RegistrationDialogData {
  programName: string;
  programFees: number;
  season: string;
  year: number;
}
export interface AppStatus {
  statusId: number;
  appName: string;
  bannerActive: string;
  bannerText: string;
  bannerLink?: string;
}
export interface PageContent {
  pageId: number;
  pageName: string;
  title: string;
  htmlContent: string;
}
export interface AppToolTip {
  tipId: number;
  tipName: string;
  title: string;
  text: string;
  language?: string;
}

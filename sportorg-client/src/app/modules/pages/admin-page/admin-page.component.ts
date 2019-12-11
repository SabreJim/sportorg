import { Component, OnInit } from '@angular/core';
import {TableColumn} from "../../core/models/ui-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {Observable} from "rxjs";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {StaticValuesService} from "../../core/services/static-values.service";

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  public classColumns: TableColumn[] = [

    new TableColumn('seasonId', 'Season', 'select', 'seasonName', 'seasons'),
    new TableColumn('programId', 'Program', 'select', 'levelName', 'programLevels'),
    new TableColumn('dayOfWeek', 'Week Day', 'select', 'dayOfWeek', null,
      StaticValuesService.WEEK_DAYS),
    new TableColumn('startTime', 'Start Time', 'time'),
    new TableColumn('endTime', 'End Time', 'time'),
    new TableColumn('startDate', 'Start Date', 'date'),
    new TableColumn('endDate', 'End Date', 'date'),
    new TableColumn('locationId', 'Location', 'select', 'locationName', 'locations'),
    new TableColumn('registrationMethod', 'Register', 'string'),
    new TableColumn('colorId', 'Color', 'select', 'colorName'),
    new TableColumn('minAge', 'Min Age', 'number'),
    new TableColumn('maxAge', 'Max Age', 'number'),
  ];
  public getClasses = () => this.classService.getAllClasses(-1);
  constructor(private lookupService: LookupProxyService, private classService: ClassesProxyService) { }

  ngOnInit() {
  }

}

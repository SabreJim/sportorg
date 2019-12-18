import {Component, Input, OnInit} from '@angular/core';
import {AdminConfig, TableColumn} from "../../core/models/ui-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {ClassesProxyService} from "../../core/services/classes-proxy.service";
import {StaticValuesService} from "../../core/services/static-values.service";
import {ProgramsProxyService} from "../../core/services/programs-proxy.service";

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  public classConfig: AdminConfig = {
    panelTitle: 'Classes',
    description: 'Edit Classes',
    entityType: 'Class',
    columns: [
      TableColumn.fromConfig({fieldName: 'programId', title: 'Program', type: 'select',
        displayField: 'programName', lookupField: 'programs', displayType: 'long-string'}),
      TableColumn.fromConfig({fieldName: 'seasonId', title: 'Season', type: 'select',
        displayField: 'seasonName', lookupField: 'seasons'}),
      TableColumn.fromConfig({ fieldName: 'dayId', title: 'Week Day', type: 'select', displayField: 'dayOfWeek',
        lookupStatic: StaticValuesService.WEEK_DAYS }),
      new TableColumn('startTime', 'Start Time', 'time'),
      new TableColumn('endTime', 'End Time', 'time'),
      new TableColumn('startDate', 'Start Date', 'date'),
      new TableColumn('endDate', 'End Date', 'date'),
      new TableColumn('minAge', 'Min Age', 'number'),
      new TableColumn('maxAge', 'Max Age', 'number'),

    ],
    getter: () => this.classService.getAllClasses(-1),
    setter: this.classService.upsertClass,
    delete: this.classService.deleteClass
  };

  public programConfig: AdminConfig = {
    panelTitle: 'Programs',
    description: 'Edit Programs',
    entityType: 'Program',
    columns: [
      new TableColumn('programName', 'Name', 'string'),
      TableColumn.fromConfig({ fieldName: 'feeId', title: 'Fees', type: 'select', displayField: 'feeValue',
        lookupField: 'fees' }),
      TableColumn.fromConfig({ fieldName: 'locationId', title: 'Location', type: 'select', displayField: 'locationName',
        lookupField: 'locations' }),
      new TableColumn('registrationMethod', 'Registration', 'string'),
      new TableColumn('colorId', 'Color', 'number'),
      new TableColumn('isActive', 'Active', 'boolean'),
      new TableColumn('programDescription', 'Description', 'html')
    ],
    getter: this.programService.getAllPrograms,
    setter: this.programService.upsertPrograms,
    delete: this.programService.deletePrograms
  };

  constructor(private lookupService: LookupProxyService, private classService: ClassesProxyService,
              private programService: ProgramsProxyService) { }

  ngOnInit() {
  }

}

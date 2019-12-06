import { Component, OnInit } from '@angular/core';
import {TableColumn} from "../../core/models/ui-objects";
import {LookupProxyService} from "../../core/services/lookup-proxy.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  public classColumns: TableColumn[] = [

    new TableColumn('season', 'Season', 'select', 'seasonName'),
    new TableColumn('programId', 'Program', 'select', 'levelName'),
    new TableColumn('startDate', 'Start Date', 'date'),
    new TableColumn('endDate', 'End Date', 'date'),
    new TableColumn('location', 'Location', 'select', 'locationName'),
    new TableColumn('registrationMethod', 'Register', 'string'),
    new TableColumn('color', 'Color', 'select'),
    new TableColumn('minAge', 'Min Age', 'number'),
    new TableColumn('maxAge', 'Max Age', 'number'),
  ];
  public getClasses = this.lookupService.getAllClasses;
  constructor(private lookupService: LookupProxyService) { }

  ngOnInit() {
  }

}

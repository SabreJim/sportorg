import {NgModule} from "@angular/core";
import {MaterialModule} from "../material.module";
import {OrgHeaderComponent} from "./org-header/org-header.component";
import {OrgMenuBarComponent} from "./org-menu-bar/org-menu-bar.component";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import { ScheduleCardComponent } from './schedule-card/schedule-card.component';
import {jqxSchedulerModule} from "jqwidgets-ng/jqxscheduler";


@NgModule({
  declarations: [
    OrgHeaderComponent,
    OrgMenuBarComponent,
    ScheduleCardComponent
  ],
  exports: [
    OrgHeaderComponent,
    OrgMenuBarComponent,
    ScheduleCardComponent
  ],
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    CommonModule,
    jqxSchedulerModule
  ],
  providers: [

  ]
})
export class CoreModule { }

import {NgModule} from "@angular/core";
import {MaterialModule} from "../material.module";
import {OrgHeaderComponent} from "./org-header/org-header.component";
import {OrgMenuBarComponent} from "./org-menu-bar/org-menu-bar.component";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import { CalendarModule, DateAdapter } from "angular-calendar";
import {adapterFactory} from "angular-calendar/date-adapters/date-fns";
import {OrgCalendarComponent} from "./org-calendar/org-calendar.component";


@NgModule({
  declarations: [
    OrgHeaderComponent,
    OrgMenuBarComponent,
    OrgCalendarComponent
  ],
  exports: [
    OrgHeaderComponent,
    OrgMenuBarComponent,
    OrgCalendarComponent
  ],
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    CommonModule,
    CalendarModule.forRoot(
      {
        provide: DateAdapter,
        useFactory: adapterFactory
      },
    )
  ],
  providers: [
  ]
})
export class CoreModule { }

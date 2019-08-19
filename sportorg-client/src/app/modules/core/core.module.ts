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
import {RegistrationButtonComponent} from "./registration-button/registration-button.component";
import {RegistrationDialogComponent} from "./registration-button/registration-dialog/registration-dialog.component";
import {SafePipe} from "./pipes/safe-html.pipe";


@NgModule({
  declarations: [
    OrgHeaderComponent,
    OrgMenuBarComponent,
    OrgCalendarComponent,
    RegistrationButtonComponent,
    RegistrationDialogComponent,
    SafePipe
  ],
  exports: [
    OrgHeaderComponent,
    OrgMenuBarComponent,
    OrgCalendarComponent,
    RegistrationButtonComponent,
    RegistrationDialogComponent,
    SafePipe
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
  ],
  entryComponents: [
    RegistrationDialogComponent
  ]
})
export class CoreModule { }

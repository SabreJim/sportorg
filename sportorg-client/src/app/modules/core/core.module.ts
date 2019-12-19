import {NgModule} from "@angular/core";
import {MaterialModule} from "../material.module";
import {OrgHeaderComponent} from "./org-header/org-header.component";
import {OrgMenuBarComponent} from "./org-menu-bar/org-menu-bar.component";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import {RegistrationButtonComponent} from "./registration-button/registration-button.component";
import {SafePipe} from "./pipes/safe-html.pipe";
import {RouteGuardService} from "./route-guard/route-guard.service";
import { EditPanelComponent } from './edit-panel/edit-panel.component';
import { AppTableComponent } from './app-table/app-table.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { SelectInputComponent } from './inputs/select-input/select-input.component';
import { DatePickerComponent } from './inputs/date-picker/date-picker.component';
import { StringInputComponent } from './inputs/string-input/string-input.component';
import { HtmlInputComponent } from './inputs/html-input/html-input.component';
import { NumberInputComponent } from './inputs/number-input/number-input.component';
import { TimeInputComponent } from './inputs/time-input/time-input.component';
import { SportorgCalendarComponent } from './sportorg-calendar/sportorg-calendar.component';
import { ConfirmModalComponent } from './modals/confirm-modal/confirm-modal.component';
import { BooleanInputComponent } from './inputs/boolean-input/boolean-input.component';
import { ProgramPanelComponent } from './program-panel/program-panel.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import {TooltipDirective} from "./tooltip/tooltip.directive";


@NgModule({
  declarations: [
    OrgHeaderComponent,
    OrgMenuBarComponent,
    RegistrationButtonComponent,
    SafePipe,
    EditPanelComponent,
    AppTableComponent,
    DynamicFormComponent,
    SelectInputComponent,
    DatePickerComponent,
    StringInputComponent,
    HtmlInputComponent,
    NumberInputComponent,
    TimeInputComponent,
    SportorgCalendarComponent,
    ConfirmModalComponent,
    BooleanInputComponent,
    ProgramPanelComponent,
    TooltipComponent,
    TooltipDirective
  ],
  exports: [
    OrgHeaderComponent,
    OrgMenuBarComponent,
    RegistrationButtonComponent,
    SafePipe,
    EditPanelComponent,
    AppTableComponent,
    SportorgCalendarComponent,
    ProgramPanelComponent,
    TooltipDirective,
    SelectInputComponent
  ],
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [
    RouteGuardService
  ],
  entryComponents: [
    AppTableComponent,
    ConfirmModalComponent,
    TooltipComponent
  ]
})
export class CoreModule { }

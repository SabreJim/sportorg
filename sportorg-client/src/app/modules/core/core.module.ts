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
import { MemberModalComponent } from './modals/member-modal/member-modal.component';
import { HtmlEditorModalComponent } from './modals/htm-editor-modal/html-editor-modal.component';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { OrgSnackbarComponent } from './org-snackbar/org-snackbar.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { LoginRequiredComponent } from './modals/login-required/login-required.component';
import { LoginRequiredDirective } from './modals/login-required/login-required.directive';
import { TabRoutingDirective } from './directives/tab-routing.directive';
import { TooltipIconComponent } from './tooltip/tooltip-icon/tooltip-icon.component';
import { CheckinModalComponent } from './modals/checkin-modal/checkin-modal.component';
import { MemberScreeningModalComponent } from './modals/member-screening-modal/member-screening-modal.component';
import {InvoiceModalComponent} from "./modals/invoice-modal/invoice-modal.component";
import {PaymentModalComponent} from "./modals/payment-modal/payment-modal.component";
import {FileUploadButtonComponent} from "./inputs/file-upload-button/file-upload-button.component";
import {RestImageDirective} from "./directives/rest-image.directive";
import {FileSelectButtonComponent} from "./inputs/file-select-button/file-select-button.component";
import {ImagePreviewModalComponent} from "./modals/image-preview-modal/image-preview-modal.component";
import {CheckinMenuComponent} from "./org-menu-bar/checkin-menu/checkin-menu.component";
import {EditModalComponent} from "./edit-panel/edit-modal/edit-modal.component";
import {environment} from "../../../environments/environment";
import {AngularFireModule} from "@angular/fire";

@NgModule({
  declarations: [
    OrgHeaderComponent,
    OrgMenuBarComponent,
    RegistrationButtonComponent,
    SafePipe,
    EditPanelComponent,
    EditModalComponent,
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
    PaymentModalComponent,
    ProgramPanelComponent,
    TooltipComponent,
    TooltipDirective,
    MemberModalComponent,
    HtmlEditorModalComponent,
    FilterBarComponent,
    OrgSnackbarComponent,
    InvoiceModalComponent,
    LoginRequiredComponent,
    LoginRequiredDirective,
    TabRoutingDirective,
    TooltipIconComponent,
    CheckinModalComponent,
    CheckinMenuComponent,
    MemberScreeningModalComponent,
    FileUploadButtonComponent,
    FileSelectButtonComponent,
    RestImageDirective,
    ImagePreviewModalComponent
  ],
  exports: [
    OrgHeaderComponent,
    OrgMenuBarComponent,
    RegistrationButtonComponent,
    SafePipe,
    EditPanelComponent,
    EditModalComponent,
    AppTableComponent,
    SportorgCalendarComponent,
    ProgramPanelComponent,
    TooltipDirective,
    SelectInputComponent,
    OrgSnackbarComponent,
    InvoiceModalComponent,
    PaymentModalComponent,
    LoginRequiredComponent,
    SelectInputComponent,
    DatePickerComponent,
    StringInputComponent,
    HtmlInputComponent,
    NumberInputComponent,
    TimeInputComponent,
    BooleanInputComponent,
    TooltipComponent,
    TooltipDirective,
    HtmlEditorModalComponent,
    LoginRequiredDirective,
    TabRoutingDirective,
    FileUploadButtonComponent,
    FileSelectButtonComponent,
    RestImageDirective,
    FilterBarComponent
  ],
  imports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    CommonModule,
    AngularEditorModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [
    RouteGuardService
  ],
  entryComponents: [
    ConfirmModalComponent,
    MemberModalComponent,
    EditModalComponent,
    HtmlEditorModalComponent,
    CheckinModalComponent,
    InvoiceModalComponent,
    PaymentModalComponent,
    MemberScreeningModalComponent,
    ImagePreviewModalComponent
  ]
})
export class CoreModule { }

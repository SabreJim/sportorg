import {NgModule} from "@angular/core";
import {MaterialModule} from "../material.module";
import {HomePageComponent} from "./home/home-page.component";
import {CommonModule} from "@angular/common";
import { ClassPageComponent } from './class-page/class-page.component';
import { FencerPageComponent } from './fencer-page/fencer-page.component';
import { EventPageComponent } from './event-page/event-page.component';
import { AboutPageComponent } from './about-page/about-page.component';
import {RouterModule} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {jqxSchedulerModule} from "jqwidgets-ng/jqxscheduler";
import {CoreModule} from "../core/core.module";

@NgModule({
  declarations: [
    HomePageComponent,
    ClassPageComponent,
    FencerPageComponent,
    EventPageComponent,
    AboutPageComponent
  ],
  exports: [

  ],
  imports: [
    MaterialModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    jqxSchedulerModule,
    CoreModule
  ],
  providers: [

  ]
})
export class PagesModule { }

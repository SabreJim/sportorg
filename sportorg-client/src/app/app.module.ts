import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MaterialModule} from "./modules/material.module";
import {PagesModule} from "./modules/pages/pages.module";
import {CoreModule} from "./modules/core/core.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FitnessTrackerModule} from "./modules/fitness-tracker/fitness-tracker.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    CoreModule,
    PagesModule,
    FitnessTrackerModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

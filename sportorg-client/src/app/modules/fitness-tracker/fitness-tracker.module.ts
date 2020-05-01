import {NgModule} from "@angular/core";
import {MaterialModule} from "../material.module";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CoreModule} from "../core/core.module";
import { FitnessPageComponent } from './fitness-page/fitness-page.component';
import { ProfileIconComponent } from './fitness-page/profile-icon/profile-icon.component';
import { FitnessWidgetComponent } from './fitness-profile-page/fitness-widget/fitness-widget.component';
import { FitnessLogComponent } from './fitness-profile-page/fitness-log/fitness-log.component';
import { FitnessCompareComponent } from './fitness-profile-page/fitness-compare/fitness-compare.component';
import { FitnessProfileModalComponent } from './fitness-page/fitness-profile-modal/fitness-profile-modal.component';
import { FitnessProfilePageComponent } from './fitness-profile-page/fitness-profile-page.component';
import { ExercisesWidgetComponent } from './fitness-profile-page/exercises-widget/exercises-widget.component';
import { ExerciseEditModalComponent } from './fitness-profile-page/exercise-edit-modal/exercise-edit-modal.component';

@NgModule({
  declarations: [
  FitnessPageComponent,
  ProfileIconComponent,
  FitnessWidgetComponent,
  FitnessLogComponent,
  FitnessCompareComponent,
  FitnessProfileModalComponent,
  FitnessProfilePageComponent,
  ExercisesWidgetComponent,
  ExerciseEditModalComponent],
  exports: [
    FitnessPageComponent
  ],
  imports: [
    MaterialModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CoreModule
  ],
  providers: [

  ],
  entryComponents: [
    FitnessProfileModalComponent,
    ExerciseEditModalComponent
  ]
})
export class FitnessTrackerModule { }

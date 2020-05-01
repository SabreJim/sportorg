import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {
  Exercise,
  ExerciseLogResults,
  FitnessLogItem,
  FitnessProfile,
  FitnessProfileStat
} from "../../../core/models/fitness-objects";
import {FitnessProxyService} from "../../../core/services/fitness-proxy.service";
import {StaticValuesService} from "../../../core/services/static-values.service";
import {Subscription} from "rxjs";
import {SnackbarService} from "../../../core/services/snackbar.service";
import {ConfirmModalComponent} from "../../../core/modals/confirm-modal/confirm-modal.component";
import {MatDialog} from "@angular/material";
import {AppUser} from "../../../core/models/authentication";
import {FitnessProfileModalComponent} from "../../fitness-page/fitness-profile-modal/fitness-profile-modal.component";
import {ExerciseEditModalComponent} from "../exercise-edit-modal/exercise-edit-modal.component";

@Component({
  selector: 'app-exercises-widget',
  templateUrl: './exercises-widget.component.html',
  styleUrls: ['./exercises-widget.component.scss']
})
export class ExercisesWidgetComponent implements OnInit, OnDestroy {

  @Input() get profile(): FitnessProfile {
    return this._profile;
  } set profile(newProfile: FitnessProfile) {
    if (!newProfile || !newProfile.athleteId) {
      return; // nothing to do yet
    }
    this._profile = newProfile;
  }
  @Input() appUser: AppUser;
  @Input() set isActive(active: number) {
    if (active === 1) {
      if (!this.exerciseSub || !this.exerciseSub.unsubscribe) {
        this.exerciseSub = this.fitnessProxy.Exercises.subscribe((exercises: Exercise[]) => {
          // add icon information to each exercise
          this.exercises = exercises.map((exercise: Exercise) => {
            const icons = [];
            for (let [key, value] of Object.entries(StaticValuesService.ICON_MAP)) {
              icons.push( { name: key, value: exercise[key + 'Value'], icon: value });
            }
            exercise.statValues = icons;
            return exercise;
          });
        });
      }
      this.fitnessProxy.getExercises();
    }
  }
  private _profile: FitnessProfile;
  protected exerciseSub: Subscription;

  public exercises: Exercise[] = [];

  public logExercise = (quantity: number, exerciseId: number, uiExercise: Exercise) => {
    const logItem: FitnessLogItem = { athleteId: this.profile.athleteId, exerciseId: exerciseId, exerciseQuantity: quantity};

    // confirm deletion
      const dialogRef = this.dialog.open(ConfirmModalComponent,
        { width: '350px', height: '240px', data: { title: `Log ${quantity} sets?`,
            message: `Yes, I completed ${quantity} sets of ${uiExercise.measurementUnitQuantity} ${uiExercise.measurementUnit}`}});
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          // send the request to log exercises
          this.fitnessProxy.recordExerciseEvent(logItem).subscribe((logResult: ExerciseLogResults) => {
            if (logResult && logResult.levelUps && logResult.levelUps.length) {
              SnackbarService.notify(logResult.levelUps.join(' '));
            }
          });
        }
      });
  }

  public editExercise = (exercise: Exercise) => {
      const dialogRef = this.dialog.open(ExerciseEditModalComponent,
        { maxHeight: '80vh', maxWidth: '800px', data: exercise });
      dialogRef.afterClosed().subscribe((result: Exercise) => {
        if (result && result.exerciseId) {
          this.fitnessProxy.upsertExercise(result).subscribe((saveResult: boolean) => {
            this.fitnessProxy.getExercises();// refresh
          });
        }
      });
  }

  constructor(protected fitnessProxy: FitnessProxyService, protected dialog: MatDialog) { }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.exerciseSub]);
  }

}

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
import {log} from "util";

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
  protected userEvents: FitnessLogItem[] = [];

  public exercises: Exercise[] = [];

  public updateQuantity = (q: number, exercise: Exercise) => {
    exercise.quantityDone = q;

    const foundLog = this.userEvents.find((item: FitnessLogItem) => item.exerciseId === exercise.exerciseId);
    if (!foundLog) {
       this.userEvents.push({ athleteId: this.profile.athleteId, exerciseId: exercise.exerciseId, exerciseQuantity: q});
    } else {
      this.userEvents = this.userEvents.map((item: FitnessLogItem) => {
        if (item.exerciseId === exercise.exerciseId) {
          item.exerciseQuantity = q;
        }
        return item;
      });
    }
  }
  public logExercise = (exerciseId: number, uiExercise: Exercise) => {
    uiExercise.quantityDone = 0;
    const foundLog = this.userEvents.find((item: FitnessLogItem) => item.exerciseId === exerciseId);
    this.fitnessProxy.recordExerciseEvent(foundLog).subscribe((logResult: ExerciseLogResults) => {
      this.userEvents = this.userEvents.map((item: FitnessLogItem) => {
        if (item.exerciseId === exerciseId) {
          item.exerciseQuantity = 0;
          uiExercise.quantityDone = 0;
        }
        return item;
      });
    })
  }

  constructor(protected fitnessProxy: FitnessProxyService) { }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.exerciseSub]);
  }

}

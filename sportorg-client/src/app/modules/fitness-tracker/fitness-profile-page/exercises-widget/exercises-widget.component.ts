import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {
  Exercise,
  ExerciseLogResults,
  FitnessLogItem,
  FitnessProfile,
} from "../../../core/models/fitness-objects";
import {FitnessProxyService} from "../../../core/services/fitness-proxy.service";
import {StaticValuesService} from "../../../core/services/static-values.service";
import {Subscription} from "rxjs";
import {SnackbarService} from "../../../core/services/snackbar.service";
import {ConfirmModalComponent} from "../../../core/modals/confirm-modal/confirm-modal.component";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MatDialog } from "@angular/material/dialog";
import {AppUser} from "../../../core/models/authentication";
import {LookupItem} from "../../../core/models/rest-objects";
import {FormControl} from "@angular/forms";
import {distinctUntilChanged, debounceTime} from "rxjs/operators";
import {ImagePreviewModalComponent} from "../../../core/modals/image-preview-modal/image-preview-modal.component";
import {FilterBarConfig, FilterRequest} from "../../../core/filter-bar/filter-bar.component";

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
          this.filterExercises(null);
        });
      }
      this.fitnessProxy.getExercises(this.profile.athleteId);
    }
  }
  private _profile: FitnessProfile;
  protected exerciseSub: Subscription;
  public statOptions: LookupItem[] = [
    { id: 0, name: 'balance', lookup: 'statValues', moreInfo: 'balanceValue' },
    { id: 1, name: 'flexibility', lookup: 'statValues' , moreInfo: 'flexibilityValue' },
    { id: 2, name: 'power', lookup: 'statValues', moreInfo: 'powerValue' },
    { id: 3, name: 'endurance', lookup: 'statValues', moreInfo: 'enduranceValue' },
    { id: 4, name: 'foot speed', lookup: 'statValues', moreInfo: 'footSpeedValue' },
    { id: 5, name: 'hand speed', lookup: 'statValues', moreInfo: 'handSpeedValue' },
  ];
  public filterConfig: FilterBarConfig = {
    hasSearch: true,
    searchTitle: 'Search',
    searchPlaceholder: 'Search exercises',
    options: [
      { title: 'Stats', placeholder: 'Show only ...', fieldName: 'stats', singleSelect: false, value: '', options: this.statOptions }
    ]
  }

  // run the join of typeahead filtering and selection filtering
  public filterExercises = (request: FilterRequest) => {
    if (!this.exercises || !this.exercises.length) {
      this.filteredExercises = [];
      return; // no source to filter on
    }
    this.filteredExercises = this.exercises.filter((row: Exercise) => {
      if (!request) return true; // not filtered yet
      let searchMatch = true;
      if (request.search && !((row.name.toUpperCase()).includes(request.search))) {
        searchMatch = false;
      }
      let statMatch = true;
      // all selected and none selected both return everything
      const filterStats: number[] = request.filters['stats'];
      if (filterStats.length > 0 && filterStats.length  < this.statOptions.length) {
        // check if the row has the requested values
        let anyMatch = false;
        filterStats.forEach((statId: number) => {
          const statOption: LookupItem = this.statOptions.find(item => item.id = statId);
          if (row[statOption.moreInfo] && row[statOption.moreInfo] > 0) {
            anyMatch = true;
          }
        });
        statMatch = anyMatch;
      }
      return searchMatch && statMatch;
    });
  }

  // throw up the full image in a modal. Animated GIFs should appear in the modal but not the preview
  public showFullImage = (exercise: Exercise) => {
    this.dialog.open(ImagePreviewModalComponent,
      { data: { imageId: exercise.fileId, isPreview: false } });
  }
  public exercises: Exercise[] = [];
  public filteredExercises: Exercise[] = [];

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

  constructor(protected fitnessProxy: FitnessProxyService, protected dialog: MatDialog) { }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.exerciseSub]);
  }

}

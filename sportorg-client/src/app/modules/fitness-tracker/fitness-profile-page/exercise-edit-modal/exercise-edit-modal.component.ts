import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Exercise} from "../../../core/models/fitness-objects";
import {LookupItem} from "../../../core/models/rest-objects";


@Component({
  selector: 'app-exercise-edit-modal',
  templateUrl: './exercise-edit-modal.component.html',
  styleUrls: ['./exercise-edit-modal.component.scss']
})
export class ExerciseEditModalComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Exercise,
              public matDialogRef: MatDialogRef<ExerciseEditModalComponent>) {
  }
  ngOnInit() {
    if (this.data && this.data.exerciseId) {
      setTimeout(()=> {
        this.updatedExercise = this.data; // allow lookups to load first
      });
    } else { // a new member object
      this.updatedExercise = Object.assign({}, this.defaultExercise);
    }
  }

  protected defaultExercise: Exercise = {
    exerciseId: 0,
    name: null,
    description: null,
    iconType: 'fa',
    iconName: '',
    imageId: -1,
    measurementUnit: 'reps',
    measurementUnitQuantity: 20,
    balanceValue: 0,
    flexibilityValue: 0,
    powerValue: 0,
    enduranceValue: 0,
    footSpeedValue: 0,
    handSpeedValue: 0
  };
  public invalid:any = {};

  public updatedExercise: Exercise = Object.assign({}, this.defaultExercise);

  public updateString = (newValue: string, position: string) => {
    this.invalid[position] = !newValue;
    this.updatedExercise[position] = newValue;
  };

  // validate the input and send the data to be saved
  public saveForm = () => {
    // if nothing is missing, send the request
    if (this.updatedExercise.name && this.updatedExercise.description) {
      this.matDialogRef.close(this.updatedExercise);
    }
  }
}

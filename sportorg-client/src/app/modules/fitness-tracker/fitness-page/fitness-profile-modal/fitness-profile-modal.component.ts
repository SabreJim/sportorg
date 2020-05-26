import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FitnessProfile} from "../../../core/models/fitness-objects";
import {LookupItem} from "../../../core/models/rest-objects";

@Component({
  selector: 'app-fitness-profile-modal',
  templateUrl: './fitness-profile-modal.component.html',
  styleUrls: ['./fitness-profile-modal.component.scss']
})
export class FitnessProfileModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: FitnessProfile,
              public matDialogRef: MatDialogRef<FitnessProfileModalComponent>) {
  }
  ngOnInit() {
    if (this.data && this.data.firstName) {
      setTimeout(()=> {
        this.newProfile = this.data; // allow lookups to load first
      });
    } else { // a new member object
      this.newProfile = Object.assign({}, this.defaultProfile);
    }
  }

  protected defaultProfile: FitnessProfile = {
    athleteId: -1,
    firstName: null,
    lastName: null,
    yearOfBirth: 2000,
    competeGender: null,
    stats: [],
    isEpee: 'N',
    isFoil: 'N',
    isSabre: 'N'
  };
  public newProfile: FitnessProfile = Object.assign({}, this.defaultProfile);

  public invalid: any = {};
  public composedAddress = '';
  public genderLookup: LookupItem[] = [
    {id: 1, lookup: 'gender', name: 'Male', description: 'M'},
    {id: 2, lookup: 'gender', name: 'Female', description: 'F'}
  ];

  public decodeLookup = (value: string, lookup: LookupItem[]) => {
    const foundItem = lookup.find((item: LookupItem) => {
      return item.description === value;
    });
    return (foundItem) ? foundItem.id : null;
  };
  public selectGender = (newValue: LookupItem) => {
    this.newProfile.competeGender = (newValue.description === 'M') ? 'M' : 'F';
  };

  public updateName = (newValue: string, position: string, isRequired = false) => {
    this.invalid[position] = isRequired && !newValue;
    this.newProfile[position] = newValue;
  };
  public updateWeapon = (newValue: string, field: string) => {
      this.newProfile[field] = (newValue === 'Y') ? 'Y' : 'N';
  };

  // validate the input and send the data to be saved
  public saveForm = () => {
    let anyInvalid = false;
    let requiredFields = ['firstName', 'lastName', 'yearOfBirth', 'competeGender'];
    // check required fields are filled in
    requiredFields.map((fieldName: string) => {
      if (!this.newProfile[fieldName]) {
        anyInvalid = true;
        this.invalid[fieldName] = true;
      }
    });

    // check the validation of existing fields
    Object.values(this.invalid).map((value: boolean) => {
      if (value) anyInvalid = true;
    });
    // if nothing is missing, send the request
    if (!anyInvalid) {
      this.matDialogRef.close(this.newProfile);
    }
  }
}

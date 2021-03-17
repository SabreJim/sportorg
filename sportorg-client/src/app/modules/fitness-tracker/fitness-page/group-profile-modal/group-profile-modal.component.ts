import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  FitnessAgeCategory,
  FitnessGroup,
  FitnessGroupAthlete,
  FitnessGroupType
} from "../../../core/models/fitness-objects";
import {TableColumn} from "../../../core/models/ui-objects";
import {FitnessGroupProxyService} from "../../../core/services/fitness-group-proxy.service";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../../../core/services/static-values.service";
import {SnackbarService} from "../../../core/services/snackbar.service";

@Component({
  selector: 'app-group-profile-modal',
  templateUrl: './group-profile-modal.component.html',
  styleUrls: ['./group-profile-modal.component.scss']
})
export class GroupProfileModalComponent implements OnInit, OnDestroy {
  constructor(@Inject(MAT_DIALOG_DATA) public data: FitnessGroup,
              public matDialogRef: MatDialogRef<GroupProfileModalComponent>,
              public fitnessGroupProxy: FitnessGroupProxyService) {
  }
  ngOnInit() {
    if (this.data && this.data.name) {
      setTimeout(()=> {
        this.newGroup = this.data; // allow lookups to load first
        this.newGroup.athleteTypeIds = this.newGroup.athleteTypeIds || [];
        this.newGroup.ageCategoryIds = this.newGroup.ageCategoryIds || [];
        this.newGroup.athleteIds = this.newGroup.athleteIds || [];
        this.isClosedValue = (this.newGroup.isClosed) ? 'Y' : 'N';
        this.getData();
      });
    } else { // a new member object
      this.newGroup = Object.assign({}, this.defaultGroup);
      this.getData();
    }
  }
  protected typeSub: Subscription;
  protected ageSub: Subscription;
  protected athleteSub: Subscription;

  protected getData = () => {
    this.fitnessGroupProxy.getGroupTypes(this.newGroup.groupId).subscribe((types: FitnessGroupType[]) => {
      this.athleteTypeOptions = types;
        this.updateSelectedTypes(types);
    });
    this.fitnessGroupProxy.getGroupAges(this.newGroup.groupId).subscribe((ages: FitnessAgeCategory[]) => {
      this.ageOptions = ages;
      this.updateSelectedAges(ages);
    });
    this.fitnessGroupProxy.getGroupAthletes(this.newGroup.groupId).subscribe((athletes: FitnessGroupAthlete[]) => {
      this.athleteOptions = athletes;
    });
  }
  protected defaultGroup: FitnessGroup = {
    groupId: -1,
    name: '',
    isAdmin: true,
    isClosed: false,
    description: '',
    athleteTypeIds: [],
    ageCategoryIds: [],
    athleteIds: []
  };
  public newGroup: FitnessGroup = Object.assign({}, this.defaultGroup);

  public invalid: any = {};
  public isClosedValue = 'N';
  public setIsClosed = (newState: string) => {
    this.newGroup.isClosed = newState === 'Y';
  }

  // validate the input and send the data to be saved
  public saveForm = () => {
    let anyInvalid = false;
    let requiredFields = ['name'];
    // check required fields are filled in
    requiredFields.map((fieldName: string) => {
      if (!this.newGroup[fieldName]) {
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
      this.matDialogRef.close(this.newGroup);
    }
  }

  // table configurations
  public athleteTypeColumns: TableColumn[] = [
    new TableColumn('typeName', 'Name', 'string')
  ];
  public athleteTypeOptions: FitnessGroupType[];

  public ageColumns: TableColumn[] = [
    new TableColumn('label', 'Name', 'string'),
    new TableColumn('min', 'Minimum', 'number'),
    new TableColumn('max', 'Maximum', 'number')
  ];
  public ageOptions: FitnessAgeCategory[] = [];

  public athleteColumns: TableColumn[] = [
    new TableColumn('athleteName', 'Name', 'string'),
    new TableColumn('yearOfBirth', 'Birth Year', 'number'),
    new TableColumn('competeGender', 'Gender', 'string'),
    new TableColumn('fitnessLevel', 'Level', 'number')
  ];
  public athleteOptions: FitnessGroupAthlete[] = [];

  public updateSelectedTypes = (types: FitnessGroupType[]) => {
    this.newGroup.athleteTypeIds = types.filter(item => item.isSelected).map(item => item.athleteTypeId);
  }
  public updateSelectedAges = (ages: FitnessAgeCategory[]) => {
      this.newGroup.ageCategoryIds = ages.filter(item => item.isSelected).map(item => item.ageId);
  }
  public inviteAthlete = (athlete: FitnessGroupAthlete) => {
    this.fitnessGroupProxy.inviteToGroup(this.newGroup.groupId, athlete.athleteId).subscribe((success: boolean) => {
      if (success) {
        SnackbarService.notify(`Athlete: ${athlete.athleteName} has been invited.`);
      }
    });
  }
  public removeAthlete = (athlete: FitnessGroupAthlete) => {
    this.fitnessGroupProxy.removeFromGroup(this.newGroup.groupId, athlete.athleteId).subscribe((success: boolean) => {
      if (success) {
        SnackbarService.notify(`Athlete: ${athlete.athleteName} has been removed from the group.`);
      }
    });
  }


  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.typeSub, this.ageSub, this.athleteSub]);
  }
}

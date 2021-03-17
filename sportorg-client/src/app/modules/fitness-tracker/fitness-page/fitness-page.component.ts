import {Component, OnDestroy, OnInit} from '@angular/core';
import {FitnessProxyService} from "../../core/services/fitness-proxy.service";
import {Subscription} from "rxjs";
import {Exercise, FitnessGroup, FitnessProfile} from "../../core/models/fitness-objects";
import {AppUser} from "../../core/models/authentication";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import { MatDialog } from "@angular/material/dialog";
import {FitnessProfileModalComponent} from "./fitness-profile-modal/fitness-profile-modal.component";
import {FitnessGroupProxyService} from "../../core/services/fitness-group-proxy.service";
import {StaticValuesService} from "../../core/services/static-values.service";
import {GroupProfileModalComponent} from "./group-profile-modal/group-profile-modal.component";
import {AdminConfig, TableColumn} from "../../core/models/ui-objects";
import {LookupItem} from "../../core/models/rest-objects";

@Component({
  selector: 'app-fitness-page',
  templateUrl: './fitness-page.component.html',
  styleUrls: [
    './fitness-page.component.scss',
    '../../pages/shared-page.scss',
  ]
})
export class FitnessPageComponent implements OnInit, OnDestroy {
  protected profileSubscription: Subscription;
  protected groupSubscription: Subscription;
  protected userSub: Subscription;
  protected createSub: Subscription;
  protected newSub: Subscription;
  protected alreadyCheckedProfiles = false;
  public activeTabId: number = 0;

  public profileStyle: string = 'tall-profile';
  public myProfiles: FitnessProfile[] = [];
  public myGroups: LookupItem[] = [];
  public myAdminGroups: FitnessGroup[] = [];
  public currentUser: AppUser;

  public newProfileRequested = (isNew: boolean) => {
    if (!this.currentUser || this.currentUser.isAnonymous) return; // do nothing as a login prompt will come up
    if (isNew) {
      // open a modal to create a new profile
      this.openAthleteDialog(null);
    }
  }
  public openAthleteDialog = (profile: FitnessProfile) => {
    const dialogRef = this.dialog.open(FitnessProfileModalComponent,
      { maxHeight: '80vh', maxWidth: '800px', data: profile });
    dialogRef.afterClosed().subscribe((result: FitnessProfile) => {
      if (result && result.firstName && result.lastName) {

        this.fitnessProxy.createFitnessProfile(result).subscribe((saveResult: boolean) => {
          this.getProfiles(); // refresh
        });
      }
    });
  }
  public newGroupRequested = (isNew: boolean) => {
    if (!this.currentUser || this.currentUser.isAnonymous) return; // do nothing as a login prompt will come up
    if (isNew) {
      // open a modal to create a new profile
      this.openGroupDialog(null);
    }
  }
  public openGroupDialog = (group: FitnessGroup) => {
    const dialogRef = this.dialog.open(GroupProfileModalComponent,
      { maxHeight: '80vh', maxWidth: '80vw', data: group });
    dialogRef.afterClosed().subscribe((result: FitnessGroup) => {
      if (result && result.name ) {
        this.fitnessGroupProxy.upsertGroup(result).subscribe((saveResult: boolean) => {
          this.getGroups(); // refresh
        });
      }
    });
  }

  public notifyTabs = (tabId: number) => {
    this.activeTabId = tabId;
    if (tabId === 1 && this.currentUser.isFitnessAdmin) {
      this.getGroups();
    }
    if (tabId === 2 && this.currentUser.isFitnessAdmin) {
      // if myGroups is empty, get those now so we can assign exercises to groups
      if (!this.myGroups || !this.myGroups.length) {
        this.getGroups();
      }
      // get exercises that the admin can edit
    }
  }

  protected getGroups = () => {
    this.groupSubscription = this.fitnessGroupProxy.getGroupsAdmin().subscribe((groups: FitnessGroup[]) => {
      if (groups && groups.length) {
        this.myGroups = groups.map((group: FitnessGroup) => {
          return {
            id: group.groupId,
            name: group.name,
            moreInfo: '',
            lookup: 'programs',
            description: group.description
          }
        });
        this.myAdminGroups = groups.filter((item: FitnessGroup) => item.isAdmin);
      } else {
        this.myGroups = [];
        this.myAdminGroups = [];
      }
      this.myAdminGroups = this.myAdminGroups.concat({
        groupId: -1,
        name: '',
        description: '',
        isClosed: false,
        isAdmin: true,
        groupMembers: 0,
        athleteTypeIds:[],
        ageCategoryIds:[],
        athleteIds: []
      });
    });
  }

  public currentExerciseGroupId: number;
  public exerciseConfig: AdminConfig = {
    entityType: 'Exercise',
    identityField: 'exerciseId',
    columns: [
      new TableColumn('name', 'Name', 'string'),
      new TableColumn('description', 'Description', 'html'),
      new TableColumn('fileId', 'Image Id', 'image'),
      new TableColumn('iconType', 'Icon Type', 'string'),
      new TableColumn('iconName', 'Icon Name', 'string'),
      new TableColumn('balanceValue', 'Balance', 'number'),
      new TableColumn('flexibilityValue', 'Flexibility', 'number'),
      new TableColumn('powerValue', 'Power', 'number'),
      new TableColumn('enduranceValue', 'Endurance', 'number'),
      new TableColumn('footSpeedValue', 'Foot Speed', 'number'),
      new TableColumn('handSpeedValue', 'Hand Speed', 'number'),
      new TableColumn('measurementUnit', 'Units', 'string'),
      new TableColumn('measurementUnitQuantity', 'Quantity (per set)', 'number')
    ],
    allowSelect: true,
    defaultObject: {
      name: 'Exercise',
      measurementUnit : 'reps',
      measurementUnitQuantity: 10,
      fileId: null,
      iconType: 'fas',
      iconName: 'fas fa-wind',
      balanceValue: 0,
      flexibilityValue: 0,
      powerValue: 0,
      enduranceValue: 0,
      footSpeedValue: 0,
      handSpeedValue: 0
    },
    getter: () => {
      setTimeout(() => this.refreshExercises = false);
      return this.fitnessGroupProxy.getGroupExercises(this.currentExerciseGroupId);
    },
    setter: (exercise: any) => {
      return this.fitnessProxy.upsertExercise(exercise, this.currentExerciseGroupId);
    },
    delete: this.fitnessProxy.deleteExercise,
    notifySelection: (row: Exercise, state: boolean) => {
      return this.fitnessGroupProxy.setSelectedExercise(this.currentExerciseGroupId, row.exerciseId, state);
    }
  };

  public refreshExercises: boolean = false;
  public selectGroupForExercises = (group: LookupItem) => {
    this.currentExerciseGroupId = group.id;
    this.refreshExercises = true;
  };


  protected getProfiles = () => {
    this.profileSubscription = this.fitnessProxy.getMyFitnessProfiles().subscribe((profiles: FitnessProfile[]) => {
      // add a "create another" option
      this.myProfiles = profiles.concat({
        athleteId: -1,
        firstName: '',
        lastName: '',
        yearOfBirth: null,
        competeGender: 'M',
        stats: [],
        generatedFromMember: false,
        createNewPlaceholder: true
      });
    });
  }
  constructor(private authService: FirebaseAuthService, private fitnessProxy: FitnessProxyService,
              private fitnessGroupProxy: FitnessGroupProxyService, public dialog: MatDialog) { }

  ngOnInit() {
    this.userSub = this.authService.CurrentUser.subscribe((user: AppUser) => {
      // check if there is a session already
      this.currentUser = user;

      if (!this.alreadyCheckedProfiles) {
        this.getProfiles();
      }
    });
    this.authService.getSession();
  }
  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.profileSubscription, this.groupSubscription]);
  }

}

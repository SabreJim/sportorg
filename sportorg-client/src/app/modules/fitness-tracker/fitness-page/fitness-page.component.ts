import {Component, OnDestroy, OnInit} from '@angular/core';
import {FitnessProxyService} from "../../core/services/fitness-proxy.service";
import {Subscription} from "rxjs";
import {FitnessProfile} from "../../core/models/fitness-objects";
import {AppUser} from "../../core/models/authentication";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {AppMember} from "../../core/models/data-objects";
import {MatDialog} from "@angular/material";
import {FitnessProfileModalComponent} from "./fitness-profile-modal/fitness-profile-modal.component";

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
  protected userSub: Subscription;
  protected createSub: Subscription;
  protected newSub: Subscription;
  protected alreadyCheckedProfiles = false;

  public profileStyle: string = 'tall-profile';
  public myProfiles: FitnessProfile[] = [];
  public currentUser: AppUser;

  public newProfileRequested = (isNew: boolean) => {
    if (!this.currentUser || this.currentUser.isAnonymous) return; // do nothing as a login prompt will come up
    if (isNew) {
      // open a modal to create a new profile
      this.openDialog(null);
    }
  }
  public openDialog = (profile: FitnessProfile) => {
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

  protected getProfiles = () => {
    this.profileSubscription = this.fitnessProxy.getMyFitnessProfiles().subscribe((profiles: FitnessProfile[]) => {
      // add a "create another" option
      const uiProfiles = profiles.concat({
        athleteId: -1,
        firstName: '',
        lastName: '',
        yearOfBirth: null,
        competeGender: 'M',
        stats: [],
        generatedFromMember: false,
        createNewPlaceholder: true
      });
      this.myProfiles = uiProfiles;
    });
  }
  constructor(private authService: FirebaseAuthService, private fitnessProxy: FitnessProxyService, public dialog: MatDialog,) { }

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
    if (this.profileSubscription && this.profileSubscription.unsubscribe) {
      this.profileSubscription.unsubscribe();
    }
  }

}

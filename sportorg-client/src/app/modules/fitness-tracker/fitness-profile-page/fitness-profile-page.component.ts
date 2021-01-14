import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FitnessProxyService} from "../../core/services/fitness-proxy.service";
import {AppUser} from "../../core/models/authentication";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {FitnessProfile} from "../../core/models/fitness-objects";
import {StaticValuesService} from "../../core/services/static-values.service";
import {ConfirmModalComponent} from "../../core/modals/confirm-modal/confirm-modal.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-fitness-profile-page',
  templateUrl: './fitness-profile-page.component.html',
  styleUrls: ['./fitness-profile-page.component.scss']
})
export class FitnessProfilePageComponent implements OnInit, OnDestroy {

  protected routeSub: Subscription;
  protected userSub: Subscription;
  protected profileSub: Subscription;
  protected paramAthleteId: number;
  protected userId: string;

  public currentProfile: FitnessProfile;
  public currentUser: AppUser;
  public activeTabId: number = 0;
  constructor(protected activatedRoute: ActivatedRoute, protected router: Router,
              protected fitnessProxy: FitnessProxyService, protected authService: FirebaseAuthService,
              protected dialog: MatDialog) { }


  protected refreshProfile = () => {
    if (this.currentUser.userId && this.paramAthleteId) {
      this.fitnessProxy.getFitnessProfile(this.paramAthleteId);
    }
  }

  public notifyTabs = (tabId: number) => {
    this.activeTabId = tabId;
    if (tabId === 0) {
      this.refreshProfile();
    }
  }

  ngOnInit() {
    this.profileSub = this.fitnessProxy.FitnessProfile.subscribe((profile: FitnessProfile) => {
      this.currentProfile = profile;
    });
    this.routeSub = this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      this.paramAthleteId = Number(paramMap.get('athleteId'));
    });
    this.userSub = this.authService.CurrentUser.subscribe((user: AppUser) => {
      // if not logged in, kick back to landing page
      if (user && !user.isAnonymous) {
        this.currentUser = user;
        this.refreshProfile();
      }
    });
    this.authService.getSession();
  }
  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.routeSub, this.userSub,  this.profileSub]);
  }


  public showHint = () => {
    const randomIndex = Math.floor(Math.random() * Math.floor(this.hintMessages.length));

    this.dialog.open(ConfirmModalComponent,
      { width: '450px', height: '300px', data: { title: `Fitness Tracker Tip`,
          message: this.hintMessages[randomIndex], showCancel: false }});
  }

  protected hintMessages = [
    `<strong>Fitness Level</strong>: this is a measure of how often you have recorded exercises. As you
    progress, the amount of exercises to reach the next level will increase. We add up all the
     exercises you logged <strong>in the last week</strong> to see if you have "leveled up".`,
    `<strong>Stats!</strong> Each exercise increases your progress towards one or more stats improving. Stats
      like "Endurance" or "Balance" represent how much you have been working on improving that part of your fitness.
 Just a reminder that this is just a way to track your work; you won't see anything different in the mirror when you level up!`,
    `<strong>Progress</strong>: Progress is tracked two ways. Your "levels" will improve when you go over a threshold 
for that particular stat in a week. Any exercises you log only count towards your progress for one week, so keep exercising
regularly and to make more progress you will need to exercise more and more.`,
    `<strong>Exercise sets</strong>: Each exercise is broken up into "sets". A set is how many times you need to repeat, or 
how long you need to do the exercise, to be able to count the work. Doing one push-up doesn't really register in this tracker. 
So aim to complete a full set. If you can do more, go for two sets. Or come back later and do another set when you are rested.`,
    `<strong>Upcoming features</strong>: We will be adding quick GIFs to show good examples of each exercise. Speak to Jim if
 you think of other features you would like to see added!`
  ];
}

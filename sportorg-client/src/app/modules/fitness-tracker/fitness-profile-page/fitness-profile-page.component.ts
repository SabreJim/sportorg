import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {FitnessProxyService} from "../../core/services/fitness-proxy.service";
import {AppUser} from "../../core/models/authentication";
import {FirebaseAuthService} from "../../core/services/firebase-auth.service";
import {FitnessProfile} from "../../core/models/fitness-objects";
import {StaticValuesService} from "../../core/services/static-values.service";

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
              protected fitnessProxy: FitnessProxyService, protected authService: FirebaseAuthService) { }


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

}

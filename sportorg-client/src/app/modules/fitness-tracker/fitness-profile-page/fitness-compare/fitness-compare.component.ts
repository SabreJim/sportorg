import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppUser} from "../../../core/models/authentication";
import {
  FitnessCompareResponse,
  FitnessCompareStat,
  FitnessProfile,
  FitnessProfileStat
} from "../../../core/models/fitness-objects";
import {FitnessProxyService} from "../../../core/services/fitness-proxy.service";
import {Subscription} from "rxjs";
import {LookupProxyService} from "../../../core/services/lookup-proxy.service";
import {LookupItem} from "../../../core/models/rest-objects";
import {MatCheckboxChange} from "@angular/material";
import {StaticValuesService} from "../../../core/services/static-values.service";

@Component({
  selector: 'app-fitness-compare',
  templateUrl: './fitness-compare.component.html',
  styleUrls: ['./fitness-compare.component.scss']
})
export class FitnessCompareComponent implements OnInit, OnDestroy {
  @Input() set isActive(active: number) {
    if (active === 2) {
      setTimeout(this.runCompare);
    }
  }

  @Input() appUser: AppUser;
  @Input() get profile(): FitnessProfile {
    return this._profile;
  } set profile(newProfile: FitnessProfile) {
    if (!newProfile || !newProfile.athleteId) {
      return; // nothing to do yet
    }
    this._profile = newProfile;

  }
  public athleteTypes: number[] = [];
  public ageCategory: number = -1;
  public ageOptions: LookupItem[] = [];
  public typeOptions: LookupItem[] = [];
  public compareStats: FitnessCompareStat[] = [];
  public numParticipants: number = 0;

  public selectAthleteType = (change: MatCheckboxChange, source: LookupItem) => {
    if (change.checked) {
      // add to selected
      this.athleteTypes.push(source.id);
    } else {
      this.athleteTypes = this.athleteTypes.filter((id) => id !== source.id);
    }
    this.runCompare();
  };
  protected compareSub: Subscription;

  public runCompare = () => {
    if (this.profile && this.profile.athleteId) {
      this.fitnessProxy.runCompare(this.profile.athleteId, this.athleteTypes, this.ageCategory);
    }
  }

  protected _profile: FitnessProfile;
  constructor(protected fitnessProxy: FitnessProxyService, protected lookupProxy: LookupProxyService) { }

  ngOnInit() {
    this.lookupProxy.getLookup('ageCategories').subscribe((categories: LookupItem[])=> {
      if (!categories || !categories.length) return; // not able to process
      // mark the profile's age category as selected by default
      const profileAge = StaticValuesService.COMPETITION_YEAR - this.profile.yearOfBirth;
      let selectedAgeGroup = null;
      this.ageOptions = categories.map((item: LookupItem) => {
        try {
          item.moreInfo = JSON.parse(item.moreInfo);
        } catch (parseErr) {
          // nothing to do; JSON already parsed
        }
        if (!selectedAgeGroup && profileAge >= (item.moreInfo as any).min && profileAge <= (item.moreInfo as any).max) {
          selectedAgeGroup = item;
        }
        return item;
      });
      this.ageCategory = selectedAgeGroup.id;
    });
    this.lookupProxy.getLookup('athleteTypes').subscribe((types: LookupItem[])=> {
      this.typeOptions = types;
    });
    this.compareSub = this.fitnessProxy.ProfileCompare.subscribe((response: FitnessCompareResponse) => {
      this.compareStats = response.stats.map((item: FitnessCompareStat) => {

        // pull fitness separately, otherwise pull from stats
        if (item.name === 'fitness') {
          item.myLevel = this.profile.fitnessLevel;
          item.myGains = this.profile.weeklyFitness;
          item.icon = '';
        } else {
          const myValues = this.profile.stats.find((profileStat: FitnessProfileStat) => profileStat.name === item.name);
          if (myValues) {
            item.myLevel = myValues.value;
            item.myGains = myValues.weeklyProgress;
            item.icon = myValues.icon;
          } else {
            item.myLevel = 1;
            item.myGains = 0;
          }
        }
        return item;
      });
      this.numParticipants = response.participants || 0;
    });
  }

  ngOnDestroy(): void {
    if (this.compareSub && this.compareSub.unsubscribe) {
      this.compareSub.unsubscribe();
    }
  }

}

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppUser} from "../../../core/models/authentication";
import {
  FitnessAgeCategory,
  FitnessCompareResponse,
  FitnessCompareStat, FitnessGroup, FitnessGroupType,
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

    this.typeSub = this.fitnessProxy.getMyAthleteTypes(this.profile.athleteId).subscribe((types: FitnessGroupType[]) => {
      this.typeOptions = types.map((item: FitnessGroupType) => {
        return {
          id: item.athleteTypeId,
          name: item.typeName,
          lookup: 'athleteType'
        }
      });
    });
    this.fitnessProxy.getMyAgeCategories(this.profile.athleteId).subscribe((categories: FitnessAgeCategory[])=> {
      if (!categories || !categories.length) return; // not able to process
      // mark the profile's age category as selected by default
      const profileAge = StaticValuesService.COMPETITION_YEAR - this.profile.yearOfBirth;
      let selectedAgeGroup = null;
      this.ageOptions = categories.map((item: FitnessAgeCategory) => {
        if (!selectedAgeGroup && profileAge >= item.min && profileAge <= item.max) {
          selectedAgeGroup = item;
        }
        return {
          id: item.ageId,
          name: item.label,
          lookup: 'ageCategory',
          moreInfo: `${item.min} to ${item.max}`
        }
      });
      this.ageCategory = selectedAgeGroup.ageId;
    });
    this.groupSub = this.fitnessProxy.getMyGroups(this.profile.athleteId).subscribe((groups: FitnessGroup[]) => {
      this.groupOptions = groups.filter(item => item.isSelected).map((item: FitnessGroup) => {
        return {
          id: item.groupId,
          name: item.name,
          lookup: 'fitnessGroup'
        }
      });
    });
  }
  protected typeSub: Subscription;
  protected ageSub: Subscription;
  protected groupSub: Subscription;
  protected compareSub: Subscription;

  public athleteTypes: number[] = [];
  public ageCategory: number = -1;
  public selectedGroupId: number = -1;
  public ageOptions: LookupItem[] = [];
  public typeOptions: LookupItem[] = [];
  public groupOptions: LookupItem[] = [];
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

  public runCompare = () => {
    if (this.profile && this.profile.athleteId) {
      this.fitnessProxy.runCompare(this.profile.athleteId, this.athleteTypes, this.ageCategory, this.selectedGroupId);
    }
  }

  protected _profile: FitnessProfile;
  constructor(protected fitnessProxy: FitnessProxyService, protected lookupProxy: LookupProxyService) { }

  ngOnInit() {
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
    StaticValuesService.cleanSubs([this.compareSub, this.ageSub, this.typeSub, this.groupSub]);
  }

}

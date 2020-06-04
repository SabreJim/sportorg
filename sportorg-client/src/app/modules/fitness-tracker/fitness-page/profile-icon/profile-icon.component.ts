import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FitnessProfile} from "../../../core/models/fitness-objects";
import {Router} from "@angular/router";
import {TipsProxyService} from "../../../core/services/tips-proxy.service";

@Component({
  selector: 'app-profile-icon',
  templateUrl: './profile-icon.component.html',
  styleUrls: ['./profile-icon.component.scss']
})
export class ProfileIconComponent implements OnInit {

  @Output() sendCreate: EventEmitter<FitnessProfile> = new EventEmitter<FitnessProfile>();
  @Output() sendNew: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() displayStyle: string;
  @Input() get profile(): FitnessProfile {
    return this._profile;
  } set profile(newProfile: FitnessProfile) {

    let tempMax = 1;
    newProfile.stats.map((stat) => {
      if (stat.value > tempMax) tempMax = stat.value;
    });
    this.maxStatValue = tempMax;
    this._profile = newProfile;
  }

  public maxStatValue = 1;

  protected _profile: FitnessProfile;

  public createProfile = (memberProfile: FitnessProfile) => {
    this.sendCreate.emit(memberProfile);
  }

  public openNewProfile = () => {
    this.sendNew.emit(true);
    setTimeout(() => {
      this.sendNew.emit(false); // reset listener
    });
  }

  public getTip = this.tipService.getToolTip;

  public useThisProfile = () => {
    this.router.navigate([`fitness-tracker/profile/${this.profile.athleteId}`]);
  }
  constructor(protected router: Router, protected tipService: TipsProxyService) { }

  ngOnInit() {

  }
}

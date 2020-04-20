import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Exercise, FitnessProfile} from "../../../core/models/fitness-objects";

@Component({
  selector: 'app-fitness-widget',
  templateUrl: './fitness-widget.component.html',
  styleUrls: ['./fitness-widget.component.scss']
})
export class FitnessWidgetComponent implements OnInit {

  @Input() set isActive(active: number) {
  }

  @Input() get profile(): FitnessProfile {
    return this._profile;
  } set profile(newProfile: FitnessProfile) {
    if (!newProfile || !newProfile.athleteId) {
      return; // nothing to do yet
    }
    let tempMax = 1;
    newProfile.stats.map((stat) => {
      if (stat.value > tempMax) tempMax = stat.value;
    });
    this.maxStatValue = tempMax;
    this._profile = newProfile;

    // fill out progress from profile
  }
  private _profile: FitnessProfile;
  public maxStatValue: number = 1;
  public levelColor: string = 'green';

  constructor(protected detector: ChangeDetectorRef) { }

  ngOnInit() {
  }

}

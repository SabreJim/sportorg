import {Component, Input, OnInit} from '@angular/core';
import {ExerciseLogResults, FitnessProfile} from "../../../core/models/fitness-objects";
import {AppUser} from "../../../core/models/authentication";
import {ConfirmModalComponent} from "../../../core/modals/confirm-modal/confirm-modal.component";
import {SnackbarService} from "../../../core/services/snackbar.service";
import {FitnessProxyService} from "../../../core/services/fitness-proxy.service";
import {MatDialog} from "@angular/material";
import {TipsProxyService} from "../../../core/services/tips-proxy.service";

@Component({
  selector: 'app-fitness-widget',
  templateUrl: './fitness-widget.component.html',
  styleUrls: ['./fitness-widget.component.scss']
})
export class FitnessWidgetComponent implements OnInit {

  @Input() set isActive(active: number) {
  }

  @Input() appUser: AppUser;
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

  }
  private _profile: FitnessProfile;
  public maxStatValue: number = 1;
  public levelColor: string = 'green';

  public getTip = this.tipService.getToolTip;

  public resetProfile = () => {
    // confirm resetting profile
    const dialogRef = this.dialog.open(ConfirmModalComponent,
      { width: '400px', height: '250px', data: { title: `Really reset all progress?`,
          message: `This action will completely reset all progress this athlete has recorded. Fitness level and all stats 
          will be reset to their initial values. Are you sure you want to proceed?`}});
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        // send the request to log exercises
        this.fitnessProxy.resetProfile(this.profile.athleteId).subscribe((result: boolean) => {
          if (result) {
            SnackbarService.notify(`The user's profile has been reset.`);
            this.fitnessProxy.getFitnessProfile(this.profile.athleteId);
          }
        });
      }
    });
  }


  constructor(protected fitnessProxy: FitnessProxyService, protected dialog: MatDialog, protected tipService: TipsProxyService) { }

  ngOnInit() {
  }

}
